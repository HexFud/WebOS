// Picks the right app component to render inside a window, based on its appKey.
import { h } from '../lib/dom.js';
import { clearStoredAccount, clearStoredWorkspace } from '../lib/storage.js';
import { TrashApp } from './trash-app.js';
import { NotesApp } from './notes-app.js';
import { BrowserApp } from './browser-app.js';
import { SettingsApp } from './settings-app.js';
import { CalculatorApp } from './calculator-app.js';
import { TerminalApp } from './terminal-app.js';
import { ExplorerApp } from './explorer-app.js';

export function renderApp(windowItem, state, dispatch, openApp, showToast, openDesktopItem) {
  const payload = windowItem.payload || {};
  switch (windowItem.appKey) {
    case 'notes': return h(NotesApp, { value: payload.text || '', onChange: (value) => dispatch({ type: 'SET_NOTES_TEXT', value }) });
    case 'browser': return h(BrowserApp, { payload, onUpdate: (nextPayload) => dispatch({ type: 'UPDATE_WINDOW_PAYLOAD', id: windowItem.id, payload: nextPayload }), showToast });
    case 'settings': return h(SettingsApp, { state, onTheme: (value) => dispatch({ type: 'SET_THEME', value }), onWallpaper: (value) => dispatch({ type: 'SET_WALLPAPER', value }), onLogout: () => { clearStoredAccount(); clearStoredWorkspace(); dispatch({ type: 'RESET_ACCOUNT' }); showToast('Signed out', 'Set up a new account to continue.'); }, showToast });
    case 'calc': return h(CalculatorApp, { payload, onUpdate: (nextPayload) => dispatch({ type: 'UPDATE_WINDOW_PAYLOAD', id: windowItem.id, payload: nextPayload }) });
    case 'terminal': return h(TerminalApp, { payload, userName: state.account?.userName || 'guest', onUpdate: (nextPayload) => dispatch({ type: 'UPDATE_WINDOW_PAYLOAD', id: windowItem.id, payload: nextPayload }), openApp, showToast, onTheme: (value) => dispatch({ type: 'SET_THEME', value }), onWallpaper: (value) => dispatch({ type: 'SET_WALLPAPER', value }) });
    case 'trash': return h(TrashApp, { trash: state.trash, onRestore: (id) => dispatch({ type: 'RESTORE_TRASH_ITEM', id }), onEmpty: () => { const count = state.trash.length; dispatch({ type: 'EMPTY_TRASH' }); showToast('Trash emptied', `${count} item${count === 1 ? '' : 's'} deleted for good.`); } });
    default: return h(ExplorerApp, { payload, filesystem: state.filesystem, onUpdate: (nextPayload) => dispatch({ type: 'UPDATE_WINDOW_PAYLOAD', id: windowItem.id, payload: nextPayload }), openApp, openDesktopItem, showToast });
  }
}
