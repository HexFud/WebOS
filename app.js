(() => {
  const h = React.createElement;
  const { Fragment, useEffect, useReducer, useRef, useState } = React;

  const BOOT_MS = 2500;
  const UNLOCK_MS = 360;
  const HEADER_HEIGHT = 78;
  const TASKBAR_HEIGHT = 92;
  const MIN_PASSWORD_LENGTH = 4;
  const ACCOUNT_STORAGE_KEY = 'webos.account.v1';
  const NOTE_TEXT = 'Benvenuto in WebOS. Questa nota vive solo in memoria di sessione.';

  // Account persistence is best-effort only: some embedded/preview environments
  // block localStorage entirely, so every call is guarded and quietly falls back
  // to an in-memory-only session (the user simply sees the setup screen again).
  function loadStoredAccount() {
    try {
      const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.userName === 'string' && typeof parsed.password === 'string') return parsed;
      return null;
    } catch {
      return null;
    }
  }

  function persistAccount(account) {
    try {
      window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
    } catch {
      /* storage unavailable: session stays in-memory only */
    }
  }

  function clearStoredAccount() {
    try {
      window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);
    } catch {
      /* storage unavailable: nothing to clear */
    }
  }

  function initials(name) {
    const trimmed = (name || '').trim();
    return trimmed ? trimmed.slice(0, 1).toUpperCase() : '?';
  }

  const STORED_ACCOUNT = loadStoredAccount();

  const WALLPAPERS = {
    aurora: {
      label: 'Aurora',
      background: 'linear-gradient(135deg, rgba(10,18,34,0.96), rgba(22,38,70,0.86) 45%, rgba(84,124,170,0.76)), radial-gradient(circle at 18% 24%, rgba(117,211,255,0.30), transparent 28%), radial-gradient(circle at 78% 18%, rgba(189,160,255,0.24), transparent 24%), radial-gradient(circle at 62% 76%, rgba(87,208,177,0.14), transparent 24%)',
      accent: '#82d8ff'
    },
    graphite: {
      label: 'Graphite',
      background: 'linear-gradient(135deg, rgba(6,10,18,0.96), rgba(24,31,44,0.88) 46%, rgba(47,55,70,0.78)), radial-gradient(circle at 22% 18%, rgba(255,255,255,0.10), transparent 22%), radial-gradient(circle at 80% 82%, rgba(141,164,255,0.12), transparent 30%)',
      accent: '#aab6ff'
    },
    sunset: {
      label: 'Sunset',
      background: 'linear-gradient(135deg, rgba(31,14,26,0.96), rgba(82,31,43,0.90) 48%, rgba(170,89,86,0.82)), radial-gradient(circle at 18% 22%, rgba(255,171,139,0.34), transparent 26%), radial-gradient(circle at 80% 14%, rgba(255,214,136,0.20), transparent 22%), radial-gradient(circle at 66% 70%, rgba(255,110,152,0.16), transparent 28%)',
      accent: '#ffb09d'
    },
    dune: {
      label: 'Dune',
      background: 'linear-gradient(135deg, rgba(18,20,28,0.92), rgba(45,39,30,0.90) 42%, rgba(103,77,47,0.76)), radial-gradient(circle at 20% 18%, rgba(255,231,173,0.25), transparent 24%), radial-gradient(circle at 80% 72%, rgba(124,196,211,0.14), transparent 30%), radial-gradient(circle at 48% 80%, rgba(233,185,120,0.16), transparent 26%)',
      accent: '#f2d29c'
    }
  };

  const APPS = {
    explorer: { title: 'File Explorer', icon: 'folder', size: [780, 520] },
    notes: { title: 'Text Editor', icon: 'notes', size: [680, 500] },
    browser: { title: 'Browser', icon: 'browser', size: [820, 560] },
    settings: { title: 'Settings', icon: 'settings', size: [760, 540] },
    calc: { title: 'Calculator', icon: 'calc', size: [380, 560] },
    terminal: { title: 'Terminal', icon: 'terminal', size: [740, 470] }
  };

  const BASE_ITEMS = [
    { id: 'shortcut-explorer', type: 'shortcut', name: 'File Explorer', appKey: 'explorer', icon: 'folder', showOnDesktop: true },
    { id: 'shortcut-notes', type: 'shortcut', name: 'Text Editor', appKey: 'notes', icon: 'notes', showOnDesktop: true },
    { id: 'shortcut-browser', type: 'shortcut', name: 'Browser', appKey: 'browser', icon: 'browser', showOnDesktop: true },
    { id: 'shortcut-settings', type: 'shortcut', name: 'Settings', appKey: 'settings', icon: 'settings', showOnDesktop: true },
    { id: 'shortcut-calc', type: 'shortcut', name: 'Calculator', appKey: 'calc', icon: 'calc', showOnDesktop: true },
    { id: 'shortcut-terminal', type: 'shortcut', name: 'Terminal', appKey: 'terminal', icon: 'terminal', showOnDesktop: true },
    {
      id: 'folder-projects',
      type: 'folder',
      name: 'Projects',
      icon: 'folder',
      showOnDesktop: true,
      children: [
        { id: 'file-roadmap', type: 'file', name: 'Roadmap.txt', icon: 'file', content: 'Q3 roadmap\n- Finish WebOS shell\n- Polish apps\n- Add theming and shortcuts' },
        { id: 'file-launch', type: 'file', name: 'Launch notes.txt', icon: 'file', content: 'WebOS launch notes\nDesign: glassmorphism\nBehavior: in-memory only' }
      ]
    },
    { id: 'file-welcome', type: 'file', name: 'Welcome.txt', icon: 'file', showOnDesktop: true, content: 'This desktop is entirely simulated in React and keeps every state change in memory.' }
  ];

  const initialChildren = BASE_ITEMS.map((item, index) => ({ ...item, ...gridPosition(index) }));

  const INITIAL_STATE = {
    phase: 'boot',
    bootProgress: 18,
    unlocking: false,
    account: STORED_ACCOUNT,
    setupName: '',
    setupPassword: '',
    setupPasswordConfirm: '',
    setupError: null,
    loginPassword: '',
    loginError: null,
    authShake: false,
    theme: 'dark',
    wallpaper: 'aurora',
    startMenuOpen: false,
    contextMenu: null,
    selectedDesktopItemId: null,
    activeWindowId: null,
    windowZ: 20,
    windows: [],
    toasts: [],
    filesystem: { id: 'root', type: 'folder', name: 'Desktop', children: initialChildren },
    notesText: NOTE_TEXT,
    clock: new Date(),
    sessionStartedAt: Date.now()
  };

  function uid(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function gridPosition(index) {
    const column = index % 2;
    const row = Math.floor(index / 2);
    return { x: 32 + column * 116, y: 108 + row * 126 };
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: '2-digit', month: 'long' }).format(date);
  }

  function uptime(startedAt) {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  function sanitizeExpression(expression) {
    return expression.replace(/[^0-9+\-*/().,% ]/g, '');
  }

  function evaluateExpression(expression) {
    const safe = sanitizeExpression(expression).replace(/,/g, '.');
    if (!safe.trim()) {
      return '0';
    }
    try {
      return String(Function(`"use strict"; return (${safe});`)());
    } catch {
      return 'Errore';
    }
  }

  function getWorkspaceBounds() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      left: 20,
      top: HEADER_HEIGHT + 12,
      width: Math.max(360, width - 40),
      height: Math.max(240, height - HEADER_HEIGHT - TASKBAR_HEIGHT - 24)
    };
  }

  function buildWindowBounds(appKey, openIndex, originRect) {
    const size = APPS[appKey]?.size || [640, 460];
    const workspace = getWorkspaceBounds();
    const width = Math.min(size[0], workspace.width - 24);
    const height = Math.min(size[1], workspace.height - 24);
    const offset = openIndex * 26;
    const x = clamp(workspace.left + Math.round((workspace.width - width) / 2) + offset, workspace.left, workspace.left + workspace.width - width);
    const y = clamp(workspace.top + Math.round((workspace.height - height) / 2) + offset, workspace.top, workspace.top + workspace.height - height);

    if (!originRect) {
      return { x, y, width, height, origin: null };
    }

    const originX = originRect.left + originRect.width / 2;
    const originY = originRect.top + originRect.height / 2;
    return {
      x: clamp(Math.round(originX - width / 2), workspace.left, workspace.left + workspace.width - width),
      y: clamp(Math.round(originY - height / 2), workspace.top, workspace.top + workspace.height - height),
      width,
      height,
      origin: { x: originX, y: originY }
    };
  }

  function snapWindow(bounds) {
    const workspace = getWorkspaceBounds();
    const snap = 28;
    const leftEdge = bounds.x <= workspace.left + snap;
    const rightEdge = bounds.x + bounds.width >= workspace.left + workspace.width - snap;
    const topEdge = bounds.y <= workspace.top + snap;
    const halfW = Math.round(workspace.width / 2);
    const halfH = Math.round(workspace.height / 2);

    if (topEdge && leftEdge) return { x: workspace.left, y: workspace.top, width: halfW, height: halfH };
    if (topEdge && rightEdge) return { x: workspace.left + halfW, y: workspace.top, width: halfW, height: halfH };
    if (leftEdge) return { x: workspace.left, y: workspace.top, width: halfW, height: workspace.height };
    if (rightEdge) return { x: workspace.left + halfW, y: workspace.top, width: halfW, height: workspace.height };
    if (topEdge) return { x: workspace.left, y: workspace.top, width: workspace.width, height: halfH };
    return bounds;
  }

  function normalizeDesktop(children) {
    return children.map((item, index) => ({ ...item, ...gridPosition(index) }));
  }

  function findNodeByPath(root, path) {
    if (!path || path[0] !== 'root') return root;
    let current = root;
    for (let index = 1; index < path.length; index += 1) {
      const next = current.children.find((child) => child.id === path[index] && child.type === 'folder');
      if (!next) return current;
      current = next;
    }
    return current;
  }

  function findNodeById(node, id) {
    if (node.id === id) return node;
    if (!node.children) return null;
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  }

  function updateNodeInTree(node, targetId, updater) {
    if (node.id === targetId) return updater(node);
    if (!node.children) return node;
    return { ...node, children: node.children.map((child) => updateNodeInTree(child, targetId, updater)) };
  }

  function initialPayload(appKey, state, extras = {}) {
    switch (appKey) {
      case 'notes': return { text: extras.text ?? state.notesText };
      case 'browser': return { page: extras.page || 'home', address: extras.address || 'webos://home', history: ['home'], historyIndex: 0 };
      case 'settings': return { section: 'appearance' };
      case 'calc': return { expression: '', result: '0' };
      case 'terminal': return { lines: [{ type: 'system', text: 'WebOS Terminal ready. Type help to list commands.' }], input: '' };
      default: return { path: extras.path || ['root'], view: 'grid', selectedId: null, previewId: null };
    }
  }

  function iconLabel(node) {
    return node.type === 'shortcut' ? (APPS[node.appKey]?.title || node.name) : node.name;
  }

  function reducer(state, action) {
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
          startMenuOpen: false,
          contextMenu: null
        };
      case 'SET_THEME': return { ...state, theme: action.value };
      case 'SET_WALLPAPER': return { ...state, wallpaper: action.value };
      case 'TOGGLE_START_MENU': return { ...state, startMenuOpen: !state.startMenuOpen, contextMenu: null };
      case 'CLOSE_START_MENU': return { ...state, startMenuOpen: false };
      case 'OPEN_CONTEXT_MENU': return { ...state, contextMenu: action.value, startMenuOpen: false, selectedDesktopItemId: null };
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
      case 'SHOW_TOAST': return { ...state, toasts: [...state.toasts, action.toast] };
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
        return { ...state, windows: [...state.windows, record], windowZ: z, activeWindowId: id, startMenuOpen: false, contextMenu: null };
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
        return { ...state, windowZ: z, activeWindowId: action.id, windows: state.windows.map((window) => window.id === action.id ? { ...window, minimized: false, maximized: false, z } : window) };
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

  function Icon({ icon }) {
    switch (icon) {
      case 'notes': return h('svg', { viewBox: '0 0 24 24', className: 'app-icon-svg', 'aria-hidden': 'true' }, h('path', { d: 'M7 3.5h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6' }), h('path', { d: 'M8.2 8h7.6M8.2 11h7.6M8.2 14h5.4', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' }));
      case 'folder': return h('svg', { viewBox: '0 0 24 24', className: 'app-icon-svg', 'aria-hidden': 'true' }, h('path', { d: 'M3.8 7.5A2.2 2.2 0 0 1 6 5.3h4.2l1.8 2h6a2.2 2.2 0 0 1 2.2 2.2v6.7A2.2 2.2 0 0 1 18 18.4H6A2.2 2.2 0 0 1 3.8 16.2Z', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinejoin: 'round' }), h('path', { d: 'M4.5 9.3h15', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' }));
      case 'browser': return h('svg', { viewBox: '0 0 24 24', className: 'app-icon-svg', 'aria-hidden': 'true' }, h('rect', { x: '3.5', y: '5', width: '17', height: '14', rx: '3', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6' }), h('path', { d: 'M3.5 9.2h17M7.5 7.2h.01M10 7.2h.01M12.5 7.2h.01', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' }));
      case 'settings': return h('svg', { viewBox: '0 0 24 24', className: 'app-icon-svg', 'aria-hidden': 'true' }, h('path', { d: 'M10.2 3.8h3.6l.5 2.1a7.5 7.5 0 0 1 1.7.7l2-1.1 2.6 2.6-1.1 2a7.5 7.5 0 0 1 .7 1.7l2.1.5v3.6l-2.1.5a7.5 7.5 0 0 1-.7 1.7l1.1 2-2.6 2.6-2-1.1a7.5 7.5 0 0 1-1.7.7l-.5 2.1h-3.6l-.5-2.1a7.5 7.5 0 0 1-1.7-.7l-2 1.1-2.6-2.6 1.1-2a7.5 7.5 0 0 1-.7-1.7l-2.1-.5v-3.6l2.1-.5a7.5 7.5 0 0 1 .7-1.7l-1.1-2 2.6-2.6 2 1.1a7.5 7.5 0 0 1 1.7-.7Z', fill: 'none', stroke: 'currentColor', strokeWidth: '1.3', strokeLinejoin: 'round' }), h('circle', { cx: '12', cy: '12', r: '3.1', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6' }));
      case 'calc': return h('svg', { viewBox: '0 0 24 24', className: 'app-icon-svg', 'aria-hidden': 'true' }, h('rect', { x: '5', y: '3.5', width: '14', height: '17', rx: '3', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6' }), h('path', { d: 'M8.2 7h7.6M8 11h2M12 11h2M16 11h0M8 14.7h2M12 14.7h2M16 14.7h0M8 18h2M12 18h2M16 18h0', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' }));
      case 'terminal': return h('svg', { viewBox: '0 0 24 24', className: 'app-icon-svg', 'aria-hidden': 'true' }, h('rect', { x: '3.5', y: '5', width: '17', height: '14', rx: '3', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6' }), h('path', { d: 'M7 10.2 9.8 12 7 13.8M11 14.5h5.5', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round', strokeLinejoin: 'round' }));
      case 'wifi': return h('svg', { viewBox: '0 0 24 24', className: 'tray-icon', 'aria-hidden': 'true' }, h('path', { d: 'M4 8.8a12 12 0 0 1 16 0M7.3 12a7.4 7.4 0 0 1 9.4 0M10.6 15.1a2.2 2.2 0 0 1 2.8 0', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' }), h('circle', { cx: '12', cy: '18.3', r: '1.1', fill: 'currentColor' }));
      case 'volume': return h('svg', { viewBox: '0 0 24 24', className: 'tray-icon', 'aria-hidden': 'true' }, h('path', { d: 'M5.8 10.2H8.8L13 6.8v10.4l-4.2-3.4H5.8a1.2 1.2 0 0 1-1.2-1.2v-1.2a1.2 1.2 0 0 1 1.2-1.2Z', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinejoin: 'round' }), h('path', { d: 'M15.6 9.6a3.7 3.7 0 0 1 0 4.8M17.8 7.4a6.8 6.8 0 0 1 0 9.2', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' }));
      case 'battery': return h('svg', { viewBox: '0 0 24 24', className: 'tray-icon', 'aria-hidden': 'true' }, h('rect', { x: '4', y: '7', width: '15.5', height: '10', rx: '2', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6' }), h('path', { d: 'M19.5 10h.9v4h-.9', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' }), h('rect', { x: '6', y: '9', width: '9', height: '6', rx: '1.4', fill: 'currentColor', opacity: 0.85 }));
      case 'start': return h('svg', { viewBox: '0 0 24 24', className: 'tray-icon', 'aria-hidden': 'true' }, h('path', { d: 'M4 5.6 11 4v8l-7 .4ZM13 3.8 20 2.9V12l-7-.2ZM4 13.2l7 .2V21l-7-1.6ZM13 13.4l7-.2V21l-7-.8Z', fill: 'currentColor', opacity: 0.92 }));
      case 'close': return h('svg', { viewBox: '0 0 24 24', className: 'control-svg', 'aria-hidden': 'true' }, h('path', { d: 'M6 6 18 18M18 6 6 18', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' }));
      case 'minus': return h('svg', { viewBox: '0 0 24 24', className: 'control-svg', 'aria-hidden': 'true' }, h('path', { d: 'M6 12h12', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' }));
      case 'maximize': return h('svg', { viewBox: '0 0 24 24', className: 'control-svg', 'aria-hidden': 'true' }, h('path', { d: 'M6.5 6.5h11v11h-11Z', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinejoin: 'round' }));
      case 'restore': return h('svg', { viewBox: '0 0 24 24', className: 'control-svg', 'aria-hidden': 'true' }, h('path', { d: 'M8.5 7.5h8v8h-8Z', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinejoin: 'round' }), h('path', { d: 'M6.5 10.5V6.5h4', fill: 'none', stroke: 'currentColor', strokeWidth: '1.4', strokeLinecap: 'round' }));
      default: return h('svg', { viewBox: '0 0 24 24', className: 'app-icon-svg', 'aria-hidden': 'true' }, h('circle', { cx: '12', cy: '12', r: '8', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6' }));
    }
  }

  function BootScreen({ progress }) {
    return h('div', { className: 'boot-screen' },
      h('div', { className: 'boot-card' },
        h('div', { className: 'boot-logo-wrap' }, h('div', { className: 'boot-logo-ring' }), h('div', { className: 'boot-logo' }, 'W')),
        h('div', { className: 'boot-title' }, 'WebOS'),
        h('div', { className: 'boot-subtitle' }, 'Initializing desktop environment'),
        h('div', { className: 'boot-progress-track', role: 'progressbar', 'aria-valuenow': progress, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('div', { className: 'boot-progress-fill', style: { width: `${progress}%` } })),
        h('div', { className: 'boot-percent' }, `${Math.round(progress)}%`)
      )
    );
  }

  function LoginScreen({ userName, clock, password, unlocking, error, shake, onPasswordChange, onSubmit, onShakeEnd }) {
    return h('div', { className: `login-screen ${unlocking ? 'login-screen--unlocking' : ''}` },
      h('div', {
        className: `login-card ${shake ? 'login-card--shake' : ''}`,
        onAnimationEnd: (event) => { if (event.animationName === 'auth-shake') onShakeEnd(); }
      },
        h('div', { className: 'login-avatar' }, initials(userName)),
        h('div', { className: 'login-user' }, userName),
        h('div', { className: 'login-meta' }, `${formatDate(clock)} · ${formatTime(clock)}`),
        h('label', { className: 'login-label' }, 'Password'),
        h('input', {
          className: `login-input ${error ? 'login-input--error' : ''}`,
          type: 'password',
          value: password,
          onChange: (event) => onPasswordChange(event.target.value),
          onKeyDown: (event) => event.key === 'Enter' && onSubmit(),
          placeholder: '••••••••',
          autoFocus: true
        }),
        error && h('div', { className: 'auth-error' }, error),
        h('button', { className: 'login-button', type: 'button', onClick: onSubmit }, 'Unlock'),
        h('div', { className: 'login-hint' }, 'Enter the password you chose during setup.')
      )
    );
  }

  function SetupScreen({ name, password, confirm, unlocking, error, shake, onNameChange, onPasswordChange, onConfirmChange, onSubmit, onShakeEnd }) {
    return h('div', { className: `login-screen ${unlocking ? 'login-screen--unlocking' : ''}` },
      h('div', {
        className: `login-card ${shake ? 'login-card--shake' : ''}`,
        onAnimationEnd: (event) => { if (event.animationName === 'auth-shake') onShakeEnd(); }
      },
        h('div', { className: 'login-avatar' }, initials(name)),
        h('div', { className: 'login-user' }, 'Create your account'),
        h('div', { className: 'login-meta' }, 'Choose a name and a password to protect this desktop.'),
        h('label', { className: 'login-label' }, 'Your name'),
        h('input', {
          className: 'login-input',
          type: 'text',
          value: name,
          onChange: (event) => onNameChange(event.target.value),
          onKeyDown: (event) => event.key === 'Enter' && onSubmit(),
          placeholder: 'e.g. Alex',
          maxLength: 24,
          autoFocus: true
        }),
        h('label', { className: 'login-label' }, 'Password'),
        h('input', {
          className: `login-input ${error ? 'login-input--error' : ''}`,
          type: 'password',
          value: password,
          onChange: (event) => onPasswordChange(event.target.value),
          onKeyDown: (event) => event.key === 'Enter' && onSubmit(),
          placeholder: `At least ${MIN_PASSWORD_LENGTH} characters`
        }),
        h('label', { className: 'login-label' }, 'Confirm password'),
        h('input', {
          className: `login-input ${error ? 'login-input--error' : ''}`,
          type: 'password',
          value: confirm,
          onChange: (event) => onConfirmChange(event.target.value),
          onKeyDown: (event) => event.key === 'Enter' && onSubmit(),
          placeholder: '••••••••'
        }),
        error && h('div', { className: 'auth-error' }, error),
        h('button', { className: 'login-button', type: 'button', onClick: onSubmit }, 'Create account'),
        h('div', { className: 'login-hint' }, 'Stored only in this browser, never sent anywhere.')
      )
    );
  }

  function ToastStack({ toasts }) {
    return h('div', { className: 'toast-stack' }, toasts.map((toast) => h('div', { className: `toast toast--${toast.variant || 'info'}`, key: toast.id }, h('div', { className: 'toast-title' }, toast.title), h('div', { className: 'toast-body' }, toast.message))));
  }

  function ContextMenu({ menu, onAction }) {
    if (!menu) return null;
    return h('div', { className: 'context-menu', style: { left: `${menu.x}px`, top: `${menu.y}px` }, onPointerDown: (event) => event.stopPropagation() },
      h('button', { type: 'button', className: 'context-menu-item', onClick: () => onAction('new-file') }, 'New file'),
      h('button', { type: 'button', className: 'context-menu-item', onClick: () => onAction('new-folder') }, 'New folder'),
      h('div', { className: 'context-menu-divider' }),
      h('div', { className: 'context-menu-subtitle' }, 'Wallpaper'),
      Object.entries(WALLPAPERS).map(([key, wallpaper]) => h('button', { type: 'button', key, className: 'context-menu-item', onClick: () => onAction('set-wallpaper', key) }, wallpaper.label)),
      h('div', { className: 'context-menu-divider' }),
      h('button', { type: 'button', className: 'context-menu-item', onClick: () => onAction('sort-icons') }, 'Sort icons'),
      h('button', { type: 'button', className: 'context-menu-item', onClick: () => onAction('refresh') }, 'Refresh')
    );
  }

  function StartMenu({ userName, openApp, onClose }) {
    const items = [
      { appKey: 'explorer', label: 'File Explorer', desc: 'Navigate folders and files' },
      { appKey: 'notes', label: 'Text Editor', desc: 'Write and edit notes' },
      { appKey: 'browser', label: 'Browser', desc: 'Open simulated pages' },
      { appKey: 'settings', label: 'Settings', desc: 'Theme, wallpaper and system info' },
      { appKey: 'calc', label: 'Calculator', desc: 'Perform calculations' },
      { appKey: 'terminal', label: 'Terminal', desc: 'Run built-in shell commands' }
    ];

    return h('div', { className: 'start-menu', onPointerDown: (event) => event.stopPropagation() },
      h('div', { className: 'start-menu-profile' }, h('div', { className: 'start-menu-avatar' }, initials(userName)), h('div', null, h('div', { className: 'start-menu-name' }, userName), h('div', { className: 'start-menu-subtitle' }, 'WebOS session is running in memory'))),
      h('div', { className: 'start-menu-list' }, items.map((item) => h('button', { className: 'start-menu-item', type: 'button', key: item.appKey, onClick: () => { openApp(item.appKey); onClose(); } }, h('span', { className: 'start-menu-item-icon' }, h(Icon, { icon: APPS[item.appKey].icon })), h('span', null, h('span', { className: 'start-menu-item-title' }, item.label), h('span', { className: 'start-menu-item-desc' }, item.desc))))),
      h('div', { className: 'start-menu-footer' }, h('button', { className: 'start-menu-footer-button', type: 'button', onClick: () => openApp('settings') }, 'Open Settings'), h('button', { className: 'start-menu-footer-button', type: 'button', onClick: onClose }, 'Close'))
    );
  }

  function DesktopIcon({ item, selected, onSelect, onOpen, onMove, onEnd }) {
    const ref = useRef(null);

    function startDrag(event) {
      if (event.button !== 0) return;
      event.preventDefault();
      const startX = event.clientX;
      const startY = event.clientY;
      const originX = item.x;
      const originY = item.y;

      const move = (moveEvent) => onMove(item.id, { x: originX + (moveEvent.clientX - startX), y: originY + (moveEvent.clientY - startY) });
      const up = (upEvent) => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        onEnd(item.id, { x: originX + (upEvent.clientX - startX), y: originY + (upEvent.clientY - startY) });
      };

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      onSelect(item.id);
    }

    return h('button', { ref, className: `desktop-icon ${selected ? 'desktop-icon--selected' : ''}`, 'data-desktop-id': item.id, style: { left: `${item.x}px`, top: `${item.y}px` }, type: 'button', onClick: () => onSelect(item.id), onDoubleClick: () => onOpen(item), onPointerDown: startDrag, onContextMenu: (event) => { event.preventDefault(); onSelect(item.id); } }, h('div', { className: 'desktop-icon-visual' }, h(Icon, { icon: item.icon })), h('div', { className: 'desktop-icon-label' }, item.name));
  }

  function Desktop({ state, dispatch, openApp, showToast }) {
    const desktopItems = state.filesystem.children.filter((item) => item.showOnDesktop);

    function openDesktopItem(item) {
      const originRect = document.querySelector(`[data-desktop-id="${item.id}"]`)?.getBoundingClientRect() || null;
      if (item.type === 'shortcut') return openApp(item.appKey, { originRect });
      if (item.type === 'folder') return openApp('explorer', { path: ['root', item.id], originRect });
      if (item.type === 'file') return openApp('notes', { text: item.content || NOTE_TEXT, originRect });
    }

    return h('main', {
      className: `desktop desktop--${state.phase}`,
      style: { backgroundImage: WALLPAPERS[state.wallpaper].background },
      role: 'application',
      'aria-label': 'Desktop',
      onContextMenu: (event) => {
        event.preventDefault();
        dispatch({ type: 'OPEN_CONTEXT_MENU', value: { x: clamp(event.clientX, 12, window.innerWidth - 180), y: clamp(event.clientY, 12, window.innerHeight - 340) } });
      },
      onPointerDown: () => dispatch({ type: 'CLOSE_START_MENU' })
    },
      h('div', { className: 'desktop-overlay' }),
      h('div', { className: 'desktop-icons' }, desktopItems.map((item) => h(DesktopIcon, {
        key: item.id,
        item,
        selected: state.selectedDesktopItemId === item.id,
        onSelect: (id) => dispatch({ type: 'SELECT_DESKTOP_ITEM', value: id }),
        onOpen: openDesktopItem,
        onMove: (id, bounds) => dispatch({ type: 'UPDATE_FILESYSTEM', value: { ...state.filesystem, children: state.filesystem.children.map((child) => child.id === id ? { ...child, x: bounds.x, y: bounds.y } : child) } }),
        onEnd: (id, bounds) => dispatch({ type: 'UPDATE_FILESYSTEM', value: { ...state.filesystem, children: state.filesystem.children.map((child) => child.id === id ? { ...child, x: Math.round(clamp(bounds.x, 16, window.innerWidth - 140)), y: Math.round(clamp(bounds.y, 96, window.innerHeight - TASKBAR_HEIGHT - 120)) } : child) } })
      }))),
      state.phase !== 'boot' && h('div', { className: 'window-layer' }, state.windows.slice().sort((a, b) => a.z - b.z).map((windowItem) => h(WindowFrame, { key: windowItem.id, windowItem, state, dispatch, openApp, showToast, openDesktopItem })))
    );
  }

  function WindowFrame({ windowItem, state, dispatch, openApp, showToast, openDesktopItem }) {
    const frameRef = useRef(null);

    useEffect(() => {
      if (!windowItem.closing) return undefined;
      const timer = window.setTimeout(() => dispatch({ type: 'REMOVE_WINDOW', id: windowItem.id }), 240);
      return () => window.clearTimeout(timer);
    }, [dispatch, windowItem.closing, windowItem.id]);

    useEffect(() => {
      if (windowItem.maximized && frameRef.current) frameRef.current.style.transform = 'none';
    }, [windowItem.maximized]);

    const style = { left: `${windowItem.x}px`, top: `${windowItem.y}px`, width: `${windowItem.width}px`, height: `${windowItem.height}px`, zIndex: windowItem.z, '--spawn-x': windowItem.origin ? `${windowItem.origin.x - windowItem.x}px` : '0px', '--spawn-y': windowItem.origin ? `${windowItem.origin.y - windowItem.y}px` : '0px' };

    return h('section', { ref: frameRef, className: ['window', state.activeWindowId === windowItem.id ? 'window--active' : '', windowItem.minimized ? 'window--minimized' : '', windowItem.maximized ? 'window--maximized' : '', windowItem.closing ? 'window--closing' : '', windowItem.origin ? 'window--spawned' : ''].join(' '), style, 'data-window-id': windowItem.id, onMouseDown: () => dispatch({ type: 'FOCUS_WINDOW', id: windowItem.id }) },
      h('div', { className: 'window-titlebar', onPointerDown: (event) => startWindowDrag(event, windowItem, dispatch), onDoubleClick: () => dispatch({ type: 'TOGGLE_MAXIMIZE_WINDOW', id: windowItem.id }) },
        h('div', { className: 'window-title-group' }, h('div', { className: 'window-title-icon' }, h(Icon, { icon: APPS[windowItem.appKey]?.icon || 'folder' })), h('div', { className: 'window-title' }, windowItem.title)),
        h('div', { className: 'window-controls' },
          h('button', { type: 'button', className: 'window-control window-control--minimize', onClick: () => dispatch({ type: 'MINIMIZE_WINDOW', id: windowItem.id }) }, h(Icon, { icon: 'minus' })),
          h('button', { type: 'button', className: 'window-control window-control--maximize', onClick: () => dispatch({ type: 'TOGGLE_MAXIMIZE_WINDOW', id: windowItem.id }) }, h(Icon, { icon: windowItem.maximized ? 'restore' : 'maximize' })),
          h('button', { type: 'button', className: 'window-control window-control--close', onClick: () => dispatch({ type: 'START_CLOSE_WINDOW', id: windowItem.id }) }, h(Icon, { icon: 'close' }))
        )
      ),
      h('div', { className: 'window-body' }, renderApp(windowItem, state, dispatch, openApp, showToast, openDesktopItem))
    );
  }

  function startWindowDrag(event, windowItem, dispatch) {
    if (event.button !== 0 || windowItem.maximized) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = windowItem.x;
    const originY = windowItem.y;
    const originW = windowItem.width;
    const originH = windowItem.height;

    const move = (moveEvent) => {
      const el = document.querySelector(`[data-window-id="${windowItem.id}"]`);
      if (el) {
        el.style.left = `${originX + (moveEvent.clientX - startX)}px`;
        el.style.top = `${originY + (moveEvent.clientY - startY)}px`;
      }
    };

    const up = (upEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      dispatch({ type: 'MOVE_WINDOW', id: windowItem.id, bounds: snapWindow({ x: originX + (upEvent.clientX - startX), y: originY + (upEvent.clientY - startY), width: originW, height: originH }) });
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  function renderApp(windowItem, state, dispatch, openApp, showToast, openDesktopItem) {
    const payload = windowItem.payload || {};
    switch (windowItem.appKey) {
      case 'notes': return h(NotesApp, { value: payload.text || '', onChange: (value) => dispatch({ type: 'SET_NOTES_TEXT', value }) });
      case 'browser': return h(BrowserApp, { payload, onUpdate: (nextPayload) => dispatch({ type: 'UPDATE_WINDOW_PAYLOAD', id: windowItem.id, payload: nextPayload }), showToast });
      case 'settings': return h(SettingsApp, { state, onTheme: (value) => dispatch({ type: 'SET_THEME', value }), onWallpaper: (value) => dispatch({ type: 'SET_WALLPAPER', value }), onLogout: () => { clearStoredAccount(); dispatch({ type: 'RESET_ACCOUNT' }); showToast('Signed out', 'Set up a new account to continue.'); }, showToast });
      case 'calc': return h(CalculatorApp, { payload, onUpdate: (nextPayload) => dispatch({ type: 'UPDATE_WINDOW_PAYLOAD', id: windowItem.id, payload: nextPayload }) });
      case 'terminal': return h(TerminalApp, { payload, userName: state.account?.userName || 'guest', onUpdate: (nextPayload) => dispatch({ type: 'UPDATE_WINDOW_PAYLOAD', id: windowItem.id, payload: nextPayload }), openApp, showToast, onTheme: (value) => dispatch({ type: 'SET_THEME', value }), onWallpaper: (value) => dispatch({ type: 'SET_WALLPAPER', value }) });
      default: return h(ExplorerApp, { payload, filesystem: state.filesystem, onUpdate: (nextPayload) => dispatch({ type: 'UPDATE_WINDOW_PAYLOAD', id: windowItem.id, payload: nextPayload }), openApp, openDesktopItem, showToast });
    }
  }

  function NotesApp({ value, onChange }) {
    return h('div', { className: 'notes-app' }, h('div', { className: 'app-toolbar app-toolbar--compact' }, h('div', { className: 'app-toolbar-chip' }, 'Autosaved in memory'), h('div', { className: 'app-toolbar-chip' }, `${value.trim().split(/\s+/).filter(Boolean).length} words`)), h('textarea', { className: 'notes-editor', value, onChange: (event) => onChange(event.target.value), spellCheck: false, placeholder: 'Write your note here...' }));
  }

  function BrowserApp({ payload, onUpdate, showToast }) {
    const pages = {
      home: { title: 'WebOS Home', subtitle: 'A curated landing page inside the simulated browser.', body: ['This browser is a local simulation with static pages and a fake address bar.', 'Use the launcher shortcuts to switch to docs, news, or type an address.'] },
      docs: { title: 'Docs', subtitle: 'Developer notes and system documentation.', body: ['WebOS state remains in memory only.', 'Window management, theming and icons all live inside the React reducer.'] },
      news: { title: 'News', subtitle: 'A simulated feed with product updates.', body: ['Desktop icons are draggable.', 'Alt+Tab cycles the visible window stack.', 'Toasts slide from the corner and auto-dismiss.'] }
    };
    const current = pages[payload.page] || pages.home;
    function navigate(value) {
      const next = value.trim().toLowerCase();
      if (pages[next]) {
        onUpdate({ ...payload, page: next, address: `webos://${next}` });
        showToast('Browser navigated', `Opened ${pages[next].title}.`);
        return;
      }
      if (next.startsWith('http://') || next.startsWith('https://')) {
        showToast('External link', 'External navigation is intentionally simulated only.');
        return;
      }
      onUpdate({ ...payload, page: 'home', address: value });
      showToast('Search simulation', 'Unknown addresses fall back to the home page.');
    }

    return h('div', { className: 'browser-app' },
      h('div', { className: 'browser-toolbar' },
        h('button', { type: 'button', className: 'browser-nav-button', onClick: () => onUpdate({ ...payload, page: 'home', address: 'webos://home' }) }, 'Home'),
        h('button', { type: 'button', className: 'browser-nav-button', onClick: () => onUpdate({ ...payload, page: 'docs', address: 'webos://docs' }) }, 'Docs'),
        h('button', { type: 'button', className: 'browser-nav-button', onClick: () => onUpdate({ ...payload, page: 'news', address: 'webos://news' }) }, 'News'),
        h('input', { className: 'browser-address', value: payload.address, onChange: (event) => onUpdate({ ...payload, address: event.target.value }), onKeyDown: (event) => event.key === 'Enter' && navigate(event.currentTarget.value) })
      ),
      h('div', { className: 'browser-page' }, h('div', { className: 'browser-page-hero' }, h('div', { className: 'browser-page-tag' }, 'SIMULATED PAGE'), h('h2', null, current.title), h('p', null, current.subtitle)), h('div', { className: 'browser-card-grid' }, current.body.map((text, index) => h('article', { className: 'browser-card', key: index }, text))))
    );
  }

  function SettingsApp({ state, onTheme, onWallpaper, onLogout, showToast }) {
    const userName = state.account?.userName || 'Guest';
    return h('div', { className: 'settings-app' },
      h('div', { className: 'settings-panel' },
        h('div', { className: 'settings-section-title' }, 'Appearance'),
        h('div', { className: 'settings-toggle-row' }, h('button', { type: 'button', className: `settings-toggle ${state.theme === 'dark' ? 'settings-toggle--active' : ''}`, onClick: () => onTheme('dark') }, 'Dark'), h('button', { type: 'button', className: `settings-toggle ${state.theme === 'light' ? 'settings-toggle--active' : ''}`, onClick: () => onTheme('light') }, 'Light')),
        h('div', { className: 'settings-section-title' }, 'Wallpaper'),
        h('div', { className: 'wallpaper-grid' }, Object.entries(WALLPAPERS).map(([key, wallpaper]) => h('button', { key, type: 'button', className: `wallpaper-card ${state.wallpaper === key ? 'wallpaper-card--active' : ''}`, style: { backgroundImage: wallpaper.background }, onClick: () => { onWallpaper(key); showToast('Wallpaper changed', wallpaper.label); } }, h('span', { className: 'wallpaper-card-label' }, wallpaper.label))))
      ),
      h('div', { className: 'settings-panel settings-panel--info' },
        h('div', { className: 'settings-section-title' }, 'System info'),
        h('dl', { className: 'settings-info-list' }, h('div', null, h('dt', null, 'User'), h('dd', null, userName)), h('div', null, h('dt', null, 'Theme'), h('dd', null, state.theme)), h('div', null, h('dt', null, 'Wallpaper'), h('dd', null, WALLPAPERS[state.wallpaper].label)), h('div', null, h('dt', null, 'Windows'), h('dd', null, String(state.windows.length))), h('div', null, h('dt', null, 'Uptime'), h('dd', null, uptime(state.sessionStartedAt)))),
        h('div', { className: 'settings-section-title' }, 'Account'),
        h('button', { type: 'button', className: 'settings-toggle', onClick: onLogout }, 'Log out & reset account')
      )
    );
  }

  function CalculatorApp({ payload, onUpdate }) {
    const keys = ['C', '⌫', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='];
    function press(key) {
      if (key === 'C') return onUpdate({ expression: '', result: '0' });
      if (key === '⌫') {
        const expression = payload.expression.slice(0, -1);
        return onUpdate({ expression, result: expression ? evaluateExpression(expression) : '0' });
      }
      if (key === '=') return onUpdate({ expression: payload.expression, result: evaluateExpression(payload.expression) });
      const next = `${payload.expression}${key.replace('×', '*').replace('÷', '/').replace('−', '-')}`;
      return onUpdate({ expression: next, result: evaluateExpression(next) });
    }

    return h('div', { className: 'calculator-app' }, h('div', { className: 'calculator-display' }, h('div', { className: 'calculator-expression' }, payload.expression || '0'), h('div', { className: 'calculator-result' }, payload.result || '0')), h('div', { className: 'calculator-grid' }, keys.map((key) => h('button', { type: 'button', key, className: `calculator-key ${['C', '⌫', '%'].includes(key) ? 'calculator-key--muted' : ''} ${key === '=' ? 'calculator-key--accent' : ''}`, onClick: () => press(key) }, key))));
  }

  function TerminalApp({ payload, userName, onUpdate, openApp, showToast, onTheme, onWallpaper }) {
    const prompt = `${(userName || 'guest').toLowerCase().replace(/\s+/g, '')}@WebOS`;
    const inputRef = useRef(null);
    useEffect(() => { inputRef.current?.focus(); }, []);

    function execute(raw) {
      const trimmed = raw.trim();
      if (!trimmed) return;
      const commandLine = `${prompt}$ ${trimmed}`;
      const lines = [...payload.lines, { type: 'command', text: commandLine }];
      const [command, ...rest] = trimmed.split(/\s+/);
      const args = rest.join(' ');
      let next = lines;

      switch (command.toLowerCase()) {
        case 'help': next = [...lines, { type: 'output', text: 'help, ls, clear, date, whoami, pwd, echo, open, theme, wallpaper, calc' }]; break;
        case 'ls': next = [...lines, { type: 'output', text: ['Documents', 'Projects', 'Welcome.txt', 'Terminal'].join('    ') }]; break;
        case 'clear': onUpdate({ lines: [], input: '' }); return;
        case 'date': next = [...lines, { type: 'output', text: new Date().toString() }]; break;
        case 'whoami': next = [...lines, { type: 'output', text: userName || 'guest' }]; break;
        case 'pwd': next = [...lines, { type: 'output', text: '/desktop' }]; break;
        case 'echo': next = [...lines, { type: 'output', text: args || '' }]; break;
        case 'open': {
          if (APPS[args.toLowerCase()]) { openApp(args.toLowerCase()); next = [...lines, { type: 'output', text: `Opened ${APPS[args.toLowerCase()].title}.` }]; }
          else next = [...lines, { type: 'error', text: `Unknown app: ${args}` }];
          break;
        }
        case 'theme': {
          const nextTheme = args.toLowerCase();
          if (nextTheme === 'dark' || nextTheme === 'light') { onTheme(nextTheme); next = [...lines, { type: 'output', text: `Theme set to ${nextTheme}.` }]; }
          else next = [...lines, { type: 'error', text: 'Usage: theme light|dark' }];
          break;
        }
        case 'wallpaper': {
          const nextWallpaper = args.toLowerCase();
          if (WALLPAPERS[nextWallpaper]) { onWallpaper(nextWallpaper); next = [...lines, { type: 'output', text: `Wallpaper set to ${WALLPAPERS[nextWallpaper].label}.` }]; }
          else next = [...lines, { type: 'error', text: `Unknown wallpaper: ${args}` }];
          break;
        }
        case 'calc': next = [...lines, { type: 'output', text: evaluateExpression(args) }]; break;
        default: next = [...lines, { type: 'error', text: `Command not found: ${command}` }];
      }

      onUpdate({ ...payload, lines: next, input: '' });
    }

    return h('div', { className: 'terminal-app' }, h('div', { className: 'terminal-output' }, payload.lines.map((line, index) => h('div', { key: index, className: `terminal-line terminal-line--${line.type}` }, line.text))), h('form', { className: 'terminal-input-row', onSubmit: (event) => { event.preventDefault(); execute(payload.input); } }, h('span', { className: 'terminal-prompt' }, `${prompt}$`), h('input', { ref: inputRef, className: 'terminal-input', value: payload.input, onChange: (event) => onUpdate({ ...payload, input: event.target.value }), spellCheck: false, autoComplete: 'off' })));
  }

  function ExplorerApp({ payload, filesystem, onUpdate, openApp, openDesktopItem, showToast }) {
    const currentFolder = findNodeByPath(filesystem, payload.path);
    const preview = payload.previewId ? currentFolder.children.find((child) => child.id === payload.previewId) : null;
    const parentPath = payload.path.length > 1 ? payload.path.slice(0, -1) : ['root'];

    function openNode(node) {
      if (node.type === 'folder') return onUpdate({ ...payload, path: [...payload.path, node.id], selectedId: null, previewId: null });
      if (node.type === 'shortcut') { openApp(node.appKey); showToast('Shortcut launched', node.name); return; }
      if (node.type === 'file') {
        onUpdate({ ...payload, selectedId: node.id, previewId: node.id });
        if (node.name.toLowerCase().endsWith('.txt')) openApp('notes', { text: node.content || NOTE_TEXT });
      }
    }

    return h('div', { className: 'explorer-app' },
      h('div', { className: 'explorer-toolbar' },
        h('button', { type: 'button', className: 'explorer-button', onClick: () => onUpdate({ ...payload, path: parentPath, selectedId: null, previewId: null }) }, 'Up'),
        h('button', { type: 'button', className: 'explorer-button', onClick: () => onUpdate({ ...payload, view: payload.view === 'grid' ? 'list' : 'grid' }) }, payload.view === 'grid' ? 'List view' : 'Grid view'),
        h('div', { className: 'explorer-breadcrumb' }, payload.path.map((part, index) => {
          const node = index === 0 ? filesystem : findNodeById(filesystem, part);
          return h(Fragment, { key: part }, index > 0 && h('span', { className: 'explorer-breadcrumb-separator' }, '/'), h('button', { type: 'button', className: 'explorer-breadcrumb-item', onClick: () => onUpdate({ ...payload, path: payload.path.slice(0, index + 1), selectedId: null, previewId: null }) }, node?.name || 'Desktop'));
        }))
      ),
      h('div', { className: `explorer-layout explorer-layout--${payload.view}` },
        h('div', { className: 'explorer-list' }, currentFolder.children.map((node) => h('button', { key: node.id, type: 'button', className: `explorer-item ${payload.selectedId === node.id ? 'explorer-item--selected' : ''}`, onClick: () => onUpdate({ ...payload, selectedId: node.id, previewId: node.type === 'file' ? node.id : null }), onDoubleClick: () => openNode(node) }, h('span', { className: 'explorer-item-icon' }, h(Icon, { icon: node.icon })), h('span', { className: 'explorer-item-name' }, node.name), h('span', { className: 'explorer-item-meta' }, node.type)))),
        h('aside', { className: 'explorer-preview' }, preview ? h('div', { className: 'explorer-preview-card' }, h('div', { className: 'explorer-preview-title' }, preview.name), h('p', { className: 'explorer-preview-body' }, preview.content || 'No preview available.')) : h('div', { className: 'explorer-preview-empty' }, 'Select an item to preview it. Double click opens a folder or file.'))
      )
    );
  }

  function Taskbar({ state, openApp, dispatch }) {
    const apps = ['explorer', 'notes', 'browser', 'settings', 'calc', 'terminal'];

    function toggleWindow(appKey) {
      const open = state.windows.filter((window) => window.appKey === appKey && !window.closing);
      if (!open.length) return openApp(appKey);
      const active = open.find((window) => window.id === state.activeWindowId);
      if (active && !active.minimized) return dispatch({ type: 'MINIMIZE_WINDOW', id: active.id });
      const top = open.slice().sort((a, b) => b.z - a.z)[0];
      dispatch({ type: 'RESTORE_WINDOW', id: top.id });
    }

    return h('footer', { className: 'taskbar' },
      h('div', { className: 'taskbar-left' },
        h('button', { type: 'button', className: `taskbar-launcher ${state.startMenuOpen ? 'taskbar-launcher--active' : ''}`, onClick: () => dispatch({ type: 'TOGGLE_START_MENU' }) }, h(Icon, { icon: 'start' })),
        h('div', { className: 'taskbar-apps' }, apps.map((appKey) => {
          const open = state.windows.filter((window) => window.appKey === appKey && !window.closing);
          const active = open.some((window) => window.id === state.activeWindowId && !window.minimized);
          return h('button', { key: appKey, type: 'button', className: `taskbar-app ${open.length ? 'taskbar-app--open' : ''} ${active ? 'taskbar-app--active' : ''}`, onClick: () => toggleWindow(appKey), title: APPS[appKey].title }, h(Icon, { icon: APPS[appKey].icon }));
        }))
      ),
      h('div', { className: 'taskbar-right' }, h('div', { className: 'taskbar-tray' }, h(Icon, { icon: 'wifi' }), h(Icon, { icon: 'volume' }), h(Icon, { icon: 'battery' })), h('div', { className: 'taskbar-clock' }, h('div', { className: 'taskbar-time' }, formatTime(state.clock)), h('div', { className: 'taskbar-date' }, formatDate(state.clock))))
    );
  }

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
      return { error };
    }

    render() {
      if (this.state.error) {
        return h('div', {
          style: {
            padding: '24px',
            color: 'white',
            background: '#09111f',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }
        }, `WebOS render error:\n${this.state.error.message || String(this.state.error)}`);
      }

      return this.props.children;
    }
  }

  function App() {
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
      const progress = window.setInterval(() => dispatch({ type: 'BOOT_PROGRESS', value: Math.min(100, 18 + ((Date.now() - bootStart.current) / BOOT_MS) * 82) }), 70);
      const done = window.setTimeout(() => dispatch({ type: 'BOOT_FINISHED' }), BOOT_MS);
      return () => { window.clearInterval(progress); window.clearTimeout(done); };
    }, [state.phase]);

    useEffect(() => {
      if (state.phase !== 'desktop') return undefined;
      const handleKeyDown = (event) => {
        if (event.altKey && event.key.toLowerCase() === 'tab') {
          event.preventDefault();
          const list = state.windows.filter((window) => !window.minimized && !window.closing).sort((a, b) => a.z - b.z);
          if (!list.length) return;
          const index = list.findIndex((window) => window.id === state.activeWindowId);
          dispatch({ type: 'FOCUS_WINDOW', id: list[(index + 1) % list.length].id });
        }
        if (event.key === 'Escape') {
          if (state.contextMenu) return dispatch({ type: 'CLOSE_CONTEXT_MENU' });
          if (state.startMenuOpen) return dispatch({ type: 'CLOSE_START_MENU' });
          const visible = state.windows.filter((window) => !window.closing);
          const active = visible.find((window) => window.id === state.activeWindowId) || visible.slice().sort((a, b) => b.z - a.z)[0];
          if (active) dispatch({ type: 'START_CLOSE_WINDOW', id: active.id });
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.activeWindowId, state.contextMenu, state.phase, state.startMenuOpen, state.windows]);

    useEffect(() => {
      if (!state.startMenuOpen && !state.contextMenu) return undefined;
      const closeMenus = () => { dispatch({ type: 'CLOSE_START_MENU' }); dispatch({ type: 'CLOSE_CONTEXT_MENU' }); };
      window.addEventListener('pointerdown', closeMenus, { once: true });
      return () => window.removeEventListener('pointerdown', closeMenus);
    }, [state.contextMenu, state.startMenuOpen]);

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
      state.phase === 'desktop' && h(Fragment, null, h(Taskbar, { state, openApp, dispatch }), state.startMenuOpen && h(StartMenu, { userName: state.account?.userName, openApp, onClose: () => dispatch({ type: 'CLOSE_START_MENU' }) }), h(ContextMenu, { menu: state.contextMenu, onAction: onDesktopAction })),
      h(ToastStack, { toasts: state.toasts })
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(ErrorBoundary, null, h(App)));
})();
