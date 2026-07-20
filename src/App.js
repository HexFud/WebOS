// The root component: boots the reducer, wires global keyboard shortcuts/timers, and switches between boot/setup/login/desktop phases.
import { h, Fragment, useEffect, useReducer, useRef } from './lib/dom.js';
import { BOOT_MS, UNLOCK_MS, NOTE_TEXT, MIN_PASSWORD_LENGTH } from './lib/constants.js';
import { WALLPAPERS } from './lib/wallpapers.js';
import { APPS } from './lib/apps-registry.js';
import { uid, buildWindowBounds } from './lib/utils.js';
import { persistAccount, persistWorkspace } from './lib/storage.js';
import { reducer } from './state/reducer.js';
import { INITIAL_STATE } from './state/initial-state.js';
import { BootScreen } from './components/boot-screen.js';
import { LoginScreen, SetupScreen } from './components/auth-screens.js';
import { MenuBar } from './components/menu-bar.js';
import { Taskbar } from './components/taskbar.js';
import { ContextMenu } from './components/context-menu.js';
import { AppleMenu } from './components/apple-menu.js';
import { ControlCenter } from './components/control-center.js';
import { Spotlight } from './components/spotlight.js';
import { NotificationCenter } from './components/notification-center.js';
import { ToastStack } from './components/toast-stack.js';
import { Desktop } from './components/desktop.js';

export function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const bootStart = useRef(Date.now());

  useEffect(() => { document.documentElement.lang = 'it'; }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    document.body.dataset.theme = state.theme;
    document.title = `WebOS · ${state.phase === 'desktop' ? 'Desktop' : state.phase === 'setup' ? 'Setup' : 'Unlock'}`;
    document.body.style.setProperty('--wallpaper-accent', WALLPAPERS[state.wallpaper].accent);
  }, [state.phase, state.theme, state.wallpaper]);

  useEffect(() => {
    const clock = window.setInterval(() => dispatch({ type: 'SET_CLOCK', value: new Date() }), 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    if (state.phase !== 'boot') return undefined;
    bootStart.current = Date.now();
    const progress = window.setInterval(() => dispatch({ type: 'BOOT_PROGRESS', value: Math.min(100, 18 + ((Date.now() - bootStart.current) / BOOT_MS) * 82) }), 70);
    const done = window.setTimeout(() => dispatch({ type: 'BOOT_FINISHED' }), BOOT_MS);
    return () => { window.clearInterval(progress); window.clearTimeout(done); };
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'desktop') return undefined;
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        return dispatch({ type: state.spotlightOpen ? 'CLOSE_SPOTLIGHT' : 'OPEN_SPOTLIGHT' });
      }
      if (event.altKey && event.key.toLowerCase() === 'tab') {
        event.preventDefault();
        const list = state.windows.filter((window) => !window.minimized && !window.closing).sort((a, b) => a.z - b.z);
        if (!list.length) return;
        const index = list.findIndex((window) => window.id === state.activeWindowId);
        dispatch({ type: 'FOCUS_WINDOW', id: list[(index + 1) % list.length].id });
      }
      if (event.key === 'Escape') {
        if (state.spotlightOpen) return dispatch({ type: 'CLOSE_SPOTLIGHT' });
        if (state.notificationCenterOpen) return dispatch({ type: 'CLOSE_NOTIFICATION_CENTER' });
        if (state.controlCenterOpen) return dispatch({ type: 'CLOSE_CONTROL_CENTER' });
        if (state.appleMenuOpen) return dispatch({ type: 'CLOSE_APPLE_MENU' });
        if (state.contextMenu) return dispatch({ type: 'CLOSE_CONTEXT_MENU' });
        const visible = state.windows.filter((window) => !window.closing);
        const active = visible.find((window) => window.id === state.activeWindowId) || visible.slice().sort((a, b) => b.z - a.z)[0];
        if (active) dispatch({ type: 'START_CLOSE_WINDOW', id: active.id });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activeWindowId, state.appleMenuOpen, state.contextMenu, state.controlCenterOpen, state.notificationCenterOpen, state.phase, state.spotlightOpen, state.windows]);

  useEffect(() => {
    if (!state.notificationCenterOpen && !state.controlCenterOpen && !state.appleMenuOpen && !state.contextMenu) return undefined;
    const closeMenus = () => dispatch({ type: 'CLOSE_OVERLAYS' });
    window.addEventListener('pointerdown', closeMenus, { once: true });
    return () => window.removeEventListener('pointerdown', closeMenus);
  }, [state.appleMenuOpen, state.contextMenu, state.controlCenterOpen, state.notificationCenterOpen]);

  // Feature: persistent workspace. Save desktop files/folders, notes, theme,
  // wallpaper and trash so they survive a page reload, not just the account.
  useEffect(() => {
    if (!state.account) return;
    persistWorkspace({ filesystem: state.filesystem, notesText: state.notesText, wallpaper: state.wallpaper, theme: state.theme, trash: state.trash });
  }, [state.account, state.filesystem, state.notesText, state.wallpaper, state.theme, state.trash]);

  const submitSetup = () => {
    const name = state.setupName.trim();
    if (!name) return dispatch({ type: 'SETUP_ERROR', value: 'Please enter a display name.' });
    if (state.setupPassword.length < MIN_PASSWORD_LENGTH) return dispatch({ type: 'SETUP_ERROR', value: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    if (state.setupPassword !== state.setupPasswordConfirm) return dispatch({ type: 'SETUP_ERROR', value: 'Passwords do not match.' });
    const account = { userName: name, password: state.setupPassword };
    persistAccount(account);
    dispatch({ type: 'SETUP_COMPLETE', account });
    window.setTimeout(() => dispatch({ type: 'LOGIN_UNLOCKED' }), UNLOCK_MS);
    showToast('Account created', `Welcome to WebOS, ${name}.`);
  };

  const submitLogin = () => {
    if (!state.loginPassword.trim()) return dispatch({ type: 'LOGIN_ERROR', value: 'Please enter your password.' });
    if (state.loginPassword !== state.account?.password) return dispatch({ type: 'LOGIN_ERROR', value: 'Incorrect password. Try again.' });
    dispatch({ type: 'LOGIN_START_UNLOCK' });
    window.setTimeout(() => dispatch({ type: 'LOGIN_UNLOCKED' }), UNLOCK_MS);
  };

  const openApp = (appKey, extras = {}) => {
    if (!APPS[appKey]) return;
    dispatch({ type: 'OPEN_WINDOW', appKey, bounds: buildWindowBounds(appKey, state.windows.length, extras.originRect), payload: extras });
  };

  const showToast = (title, message, variant = 'info') => {
    const toast = { id: uid('toast'), title, message, variant };
    dispatch({ type: 'SHOW_TOAST', toast });
    window.setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id: toast.id }), 2800);
  };

  const onDesktopAction = (action, value) => {
    dispatch({ type: 'CLOSE_CONTEXT_MENU' });
    if (action === 'new-file') {
      const item = { id: uid('file'), type: 'file', name: `New file ${state.filesystem.children.filter((child) => child.type === 'file').length + 1}.txt`, icon: 'file', showOnDesktop: true, content: 'New file created inside WebOS.' };
      dispatch({ type: 'ADD_DESKTOP_ITEM', item });
      showToast('File created', item.name);
    }
    if (action === 'new-folder') {
      const item = { id: uid('folder'), type: 'folder', name: `New Folder ${state.filesystem.children.filter((child) => child.type === 'folder').length + 1}`, icon: 'folder', showOnDesktop: true, children: [] };
      dispatch({ type: 'ADD_DESKTOP_ITEM', item });
      showToast('Folder created', item.name);
    }
    if (action === 'set-wallpaper') {
      dispatch({ type: 'SET_WALLPAPER', value });
      showToast('Wallpaper changed', WALLPAPERS[value].label);
    }
    if (action === 'sort-icons') {
      dispatch({ type: 'SORT_DESKTOP_ICONS' });
      showToast('Desktop sorted', 'Icons were arranged in alphabetical order.');
    }
    if (action === 'refresh') {
      dispatch({ type: 'RESET_DESKTOP_ICONS' });
      showToast('Desktop refreshed', 'Desktop icons were reflowed.');
    }
    if (action === 'open-item') {
      if (value === 'trash') return openApp('trash');
      const item = state.filesystem.children.find((child) => child.id === value);
      if (item) launchSpotlightItem({ item });
    }
    if (action === 'delete-item') {
      const item = state.filesystem.children.find((child) => child.id === value);
      dispatch({ type: 'DELETE_DESKTOP_ITEM', id: value });
      if (item) showToast('Moved to Trash', item.name);
    }
    if (action === 'empty-trash') {
      const count = state.trash.length;
      dispatch({ type: 'EMPTY_TRASH' });
      showToast('Trash emptied', `${count} item${count === 1 ? '' : 's'} deleted for good.`);
    }
  };

  const activeWindow = state.windows.find((window) => window.id === state.activeWindowId && !window.minimized && !window.closing);
  const activeAppTitle = activeWindow ? APPS[activeWindow.appKey]?.title || 'WebOS' : 'Desktop';

  const onLockScreen = () => { dispatch({ type: 'LOCK_SCREEN' }); showToast('Screen locked', 'Enter your password to continue.'); };
  const onRestart = () => dispatch({ type: 'RESTART_WEBOS' });
  const onAbout = () => { dispatch({ type: 'CLOSE_APPLE_MENU' }); openApp('settings'); };

  const spotlightItems = state.filesystem.children.map((item) => ({
    key: item.id,
    title: item.name,
    subtitle: item.type === 'shortcut' ? 'App' : item.type === 'folder' ? 'Folder' : 'File',
    icon: item.icon,
    item
  }));

  const launchSpotlightItem = (result) => {
    const item = result.item;
    dispatch({ type: 'CLOSE_SPOTLIGHT' });
    if (item.type === 'shortcut') return openApp(item.appKey);
    if (item.type === 'folder') return openApp('explorer', { path: ['root', item.id] });
    if (item.type === 'file') return openApp('notes', { text: item.content || NOTE_TEXT });
  };

  return h('div', { className: `shell shell--${state.theme} shell--${state.phase}${state.unlocking ? ' shell--unlocking' : ''}` },
    h('div', { className: 'wallpaper-backdrop', style: { backgroundImage: WALLPAPERS[state.wallpaper].background } }),
    state.phase !== 'boot' && h(Desktop, { state, dispatch, openApp, showToast }),
    state.phase === 'boot' && h(BootScreen, { progress: state.bootProgress }),
    state.phase === 'setup' && h(SetupScreen, {
      name: state.setupName,
      password: state.setupPassword,
      confirm: state.setupPasswordConfirm,
      unlocking: state.unlocking,
      error: state.setupError,
      shake: state.authShake,
      onNameChange: (value) => dispatch({ type: 'SETUP_NAME_CHANGED', value }),
      onPasswordChange: (value) => dispatch({ type: 'SETUP_PASSWORD_CHANGED', value }),
      onConfirmChange: (value) => dispatch({ type: 'SETUP_PASSWORD_CONFIRM_CHANGED', value }),
      onSubmit: submitSetup,
      onShakeEnd: () => dispatch({ type: 'AUTH_SHAKE_END' })
    }),
    state.phase === 'login' && h(LoginScreen, {
      userName: state.account?.userName,
      clock: state.clock,
      password: state.loginPassword,
      unlocking: state.unlocking,
      error: state.loginError,
      shake: state.authShake,
      onPasswordChange: (value) => dispatch({ type: 'LOGIN_PASSWORD_CHANGED', value }),
      onSubmit: submitLogin,
      onShakeEnd: () => dispatch({ type: 'AUTH_SHAKE_END' })
    }),
    state.phase === 'desktop' && h(MenuBar, { state, activeAppTitle, dispatch }),
    state.phase === 'desktop' && h(Fragment, null, h(Taskbar, { state, openApp, dispatch }), h(ContextMenu, { menu: state.contextMenu, trashCount: state.trash.length, onAction: onDesktopAction })),
    state.appleMenuOpen && h(AppleMenu, { onLock: onLockScreen, onRestart, onAbout }),
    state.controlCenterOpen && h(ControlCenter, { state, dispatch, onClose: () => dispatch({ type: 'CLOSE_CONTROL_CENTER' }) }),
    state.spotlightOpen && h(Spotlight, { items: spotlightItems, onSelect: launchSpotlightItem, onClose: () => dispatch({ type: 'CLOSE_SPOTLIGHT' }) }),
    state.notificationCenterOpen && h(NotificationCenter, { notifications: state.notifications, onClear: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }), onClose: () => dispatch({ type: 'CLOSE_NOTIFICATION_CENTER' }) }),
    h(ToastStack, { toasts: state.toasts })
  );
}
