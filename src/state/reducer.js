// The single reducer that owns all app state: windows, desktop items, overlays, auth flow and settings.
import { NOTE_TEXT } from '../lib/constants.js';
import { APPS } from '../lib/apps-registry.js';
import { uid, clamp, gridPosition, normalizeDesktop, iconLabel, getWorkspaceBounds } from '../lib/utils.js';
import { initialChildren } from './filesystem-data.js';
import { initialPayload } from './initial-payload.js';

export function reducer(state, action) {
  switch (action.type) {
    case 'BOOT_PROGRESS': return { ...state, bootProgress: Math.min(100, action.value) };
    case 'BOOT_FINISHED': return { ...state, phase: state.account ? 'login' : 'setup', bootProgress: 100 };
    case 'SETUP_NAME_CHANGED': return { ...state, setupName: action.value, setupError: null };
    case 'SETUP_PASSWORD_CHANGED': return { ...state, setupPassword: action.value, setupError: null };
    case 'SETUP_PASSWORD_CONFIRM_CHANGED': return { ...state, setupPasswordConfirm: action.value, setupError: null };
    case 'SETUP_ERROR': return { ...state, setupError: action.value, authShake: true };
    case 'SETUP_COMPLETE':
      return { ...state, account: action.account, setupName: '', setupPassword: '', setupPasswordConfirm: '', setupError: null, unlocking: true };
    case 'LOGIN_PASSWORD_CHANGED': return { ...state, loginPassword: action.value, loginError: null };
    case 'LOGIN_ERROR': return { ...state, loginError: action.value, authShake: true };
    case 'AUTH_SHAKE_END': return { ...state, authShake: false };
    case 'LOGIN_START_UNLOCK': return { ...state, unlocking: true };
    case 'LOGIN_UNLOCKED': return { ...state, phase: 'desktop', unlocking: false, loginPassword: '', loginError: null };
    case 'RESET_ACCOUNT':
      return {
        ...state,
        account: null,
        phase: 'setup',
        loginPassword: '',
        loginError: null,
        setupName: '',
        setupPassword: '',
        setupPasswordConfirm: '',
        setupError: null,
        authShake: false,
        windows: [],
        activeWindowId: null,
        spotlightOpen: false,
        notificationCenterOpen: false,
        contextMenu: null,
        theme: 'dark',
        wallpaper: 'aurora',
        trash: [],
        notesText: NOTE_TEXT,
        filesystem: { id: 'root', type: 'folder', name: 'Desktop', children: initialChildren }
      };
    case 'SET_THEME': return { ...state, theme: action.value };
    case 'SET_WALLPAPER': return { ...state, wallpaper: action.value };
    case 'OPEN_SPOTLIGHT': return { ...state, spotlightOpen: true, notificationCenterOpen: false, controlCenterOpen: false, appleMenuOpen: false, contextMenu: null };
    case 'CLOSE_SPOTLIGHT': return { ...state, spotlightOpen: false };
    case 'TOGGLE_NOTIFICATION_CENTER': return { ...state, notificationCenterOpen: !state.notificationCenterOpen, spotlightOpen: false, controlCenterOpen: false, appleMenuOpen: false, contextMenu: null };
    case 'CLOSE_NOTIFICATION_CENTER': return { ...state, notificationCenterOpen: false };
    case 'TOGGLE_CONTROL_CENTER': return { ...state, controlCenterOpen: !state.controlCenterOpen, spotlightOpen: false, notificationCenterOpen: false, appleMenuOpen: false, contextMenu: null };
    case 'CLOSE_CONTROL_CENTER': return { ...state, controlCenterOpen: false };
    case 'TOGGLE_APPLE_MENU': return { ...state, appleMenuOpen: !state.appleMenuOpen, spotlightOpen: false, notificationCenterOpen: false, controlCenterOpen: false, contextMenu: null };
    case 'CLOSE_APPLE_MENU': return { ...state, appleMenuOpen: false };
    case 'TOGGLE_DND': return { ...state, doNotDisturb: !state.doNotDisturb };
    case 'CLEAR_NOTIFICATIONS': return { ...state, notifications: [] };
    case 'CLOSE_OVERLAYS': return { ...state, spotlightOpen: false, notificationCenterOpen: false, controlCenterOpen: false, appleMenuOpen: false, contextMenu: null };
    case 'LOCK_SCREEN': return { ...state, phase: 'login', loginPassword: '', loginError: null, spotlightOpen: false, notificationCenterOpen: false, controlCenterOpen: false, appleMenuOpen: false, contextMenu: null };
    case 'RESTART_WEBOS': return { ...state, phase: 'boot', bootProgress: 0, windows: [], activeWindowId: null, spotlightOpen: false, notificationCenterOpen: false, controlCenterOpen: false, appleMenuOpen: false, contextMenu: null };
    case 'DELETE_DESKTOP_ITEM': {
      const item = state.filesystem.children.find((child) => child.id === action.id);
      if (!item) return state;
      return {
        ...state,
        filesystem: { ...state.filesystem, children: state.filesystem.children.filter((child) => child.id !== action.id) },
        trash: [{ ...item, deletedAt: new Date().toISOString() }, ...state.trash],
        selectedDesktopItemId: null,
        contextMenu: null
      };
    }
    case 'RESTORE_TRASH_ITEM': {
      const item = state.trash.find((child) => child.id === action.id);
      if (!item) return state;
      const { deletedAt, ...rest } = item;
      const position = gridPosition(state.filesystem.children.length);
      return {
        ...state,
        filesystem: { ...state.filesystem, children: [...state.filesystem.children, { ...rest, showOnDesktop: true, x: rest.x ?? position.x, y: rest.y ?? position.y }] },
        trash: state.trash.filter((child) => child.id !== action.id)
      };
    }
    case 'EMPTY_TRASH': return { ...state, trash: [] };
    case 'OPEN_CONTEXT_MENU': return { ...state, contextMenu: action.value, spotlightOpen: false, notificationCenterOpen: false, controlCenterOpen: false, appleMenuOpen: false, selectedDesktopItemId: action.value?.targetId || null };
    case 'CLOSE_CONTEXT_MENU': return { ...state, contextMenu: null };
    case 'SELECT_DESKTOP_ITEM': return { ...state, selectedDesktopItemId: action.value };
    case 'SORT_DESKTOP_ICONS': {
      const sorted = [...state.filesystem.children].sort((a, b) => iconLabel(a).localeCompare(iconLabel(b), 'it', { sensitivity: 'base' }));
      return { ...state, filesystem: { ...state.filesystem, children: sorted.map((item, index) => ({ ...item, ...gridPosition(index) })) } };
    }
    case 'RESET_DESKTOP_ICONS':
      return { ...state, filesystem: { ...state.filesystem, children: normalizeDesktop(state.filesystem.children) } };
    case 'ADD_DESKTOP_ITEM': {
      const children = [...state.filesystem.children, action.item].map((item, index) => ({ ...item, ...gridPosition(index) }));
      return { ...state, filesystem: { ...state.filesystem, children } };
    }
    case 'UPDATE_FILESYSTEM': return { ...state, filesystem: action.value };
    case 'SHOW_TOAST': return { ...state, toasts: state.doNotDisturb ? state.toasts : [...state.toasts, action.toast], notifications: [{ ...action.toast, time: new Date().toISOString() }, ...state.notifications].slice(0, 30) };
    case 'DISMISS_TOAST': return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.id) };
    case 'OPEN_WINDOW': {
      const z = state.windowZ + 1;
      const id = action.windowId || uid('win');
      const record = {
        id,
        appKey: action.appKey,
        title: APPS[action.appKey]?.title || 'Window',
        x: action.bounds.x,
        y: action.bounds.y,
        width: action.bounds.width,
        height: action.bounds.height,
        origin: action.bounds.origin,
        restoreBounds: null,
        minimized: false,
        maximized: false,
        closing: false,
        z,
        payload: initialPayload(action.appKey, state, action.payload || {})
      };
      return { ...state, windows: [...state.windows, record], windowZ: z, activeWindowId: id, spotlightOpen: false, notificationCenterOpen: false, controlCenterOpen: false, appleMenuOpen: false, contextMenu: null };
    }
    case 'FOCUS_WINDOW': {
      const z = state.windowZ + 1;
      return {
        ...state,
        windowZ: z,
        activeWindowId: action.id,
        windows: state.windows.map((window) => window.id === action.id ? { ...window, z, minimized: false } : window)
      };
    }
    case 'MINIMIZE_WINDOW':
      return { ...state, activeWindowId: state.activeWindowId === action.id ? null : state.activeWindowId, windows: state.windows.map((window) => window.id === action.id ? { ...window, minimized: true } : window) };
    case 'RESTORE_WINDOW': {
      const z = state.windowZ + 1;
      return { ...state, windowZ: z, activeWindowId: action.id, windows: state.windows.map((window) => window.id === action.id ? { ...window, minimized: false, z } : window) };
    }
    case 'TOGGLE_MAXIMIZE_WINDOW': {
      const workspace = getWorkspaceBounds();
      const z = state.windowZ + 1;
      return {
        ...state,
        windowZ: z,
        activeWindowId: action.id,
        windows: state.windows.map((window) => {
          if (window.id !== action.id) return window;
          if (window.maximized) {
            return { ...window, ...window.restoreBounds, restoreBounds: null, maximized: false, minimized: false, z };
          }
          return { ...window, restoreBounds: { x: window.x, y: window.y, width: window.width, height: window.height }, x: workspace.left, y: workspace.top, width: workspace.width, height: workspace.height, maximized: true, minimized: false, z };
        })
      };
    }
    case 'MOVE_WINDOW':
      return { ...state, windows: state.windows.map((window) => window.id === action.id ? { ...window, x: action.bounds.x, y: action.bounds.y, width: action.bounds.width ?? window.width, height: action.bounds.height ?? window.height, maximized: false } : window) };
    case 'SET_SNAP_PREVIEW': return { ...state, snapPreview: action.value };
    case 'CLEAR_SNAP_PREVIEW': return state.snapPreview ? { ...state, snapPreview: null } : state;
    case 'SNAP_WINDOW': {
      const workspace = getWorkspaceBounds();
      const z = state.windowZ + 1;
      const halfGap = 6;
      const halfWidth = Math.round((workspace.width - halfGap) / 2);
      return {
        ...state,
        windowZ: z,
        activeWindowId: action.id,
        snapPreview: null,
        windows: state.windows.map((window) => {
          if (window.id !== action.id) return window;
          const restoreBounds = window.maximized ? window.restoreBounds : { x: window.x, y: window.y, width: window.width, height: window.height };
          if (action.side === 'top') {
            return { ...window, restoreBounds, x: workspace.left, y: workspace.top, width: workspace.width, height: workspace.height, maximized: true, minimized: false, z };
          }
          const x = action.side === 'left' ? workspace.left : workspace.left + workspace.width - halfWidth;
          return { ...window, restoreBounds, x, y: workspace.top, width: halfWidth, height: workspace.height, maximized: false, minimized: false, z };
        })
      };
    }
    case 'START_CLOSE_WINDOW':
      return { ...state, windows: state.windows.map((window) => window.id === action.id ? { ...window, closing: true } : window) };
    case 'REMOVE_WINDOW':
      return { ...state, windows: state.windows.filter((window) => window.id !== action.id), activeWindowId: state.activeWindowId === action.id ? null : state.activeWindowId };
    case 'UPDATE_WINDOW_PAYLOAD':
      return { ...state, windows: state.windows.map((window) => window.id === action.id ? { ...window, payload: typeof action.updater === 'function' ? action.updater(window.payload) : { ...window.payload, ...action.payload } } : window) };
    case 'SET_NOTES_TEXT':
      return { ...state, notesText: action.value, windows: state.windows.map((window) => window.appKey === 'notes' ? { ...window, payload: { ...window.payload, text: action.value } } : window) };
    case 'SET_CLOCK': return { ...state, clock: action.value };
    default: return state;
  }
}
