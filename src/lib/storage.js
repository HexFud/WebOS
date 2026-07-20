// Best-effort localStorage persistence for the account and the workspace (files, notes, theme, wallpaper, trash). Every call is guarded: environments that block localStorage silently fall back to an in-memory-only session.
const ACCOUNT_STORAGE_KEY = 'webos.account.v1';


export function loadStoredAccount() {
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

export function persistAccount(account) {
  try {
    window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  } catch {
    /* storage unavailable: session stays in-memory only */
  }
}

export function clearStoredAccount() {
  try {
    window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}


const STATE_STORAGE_KEY = 'webos.workspace.v1';


export function loadStoredWorkspace() {
  try {
    const raw = window.localStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistWorkspace(partial) {
  try {
    const raw = window.localStorage.getItem(STATE_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify({ ...existing, ...partial }));
  } catch {
    /* storage unavailable: session stays in-memory only */
  }
}

export function clearStoredWorkspace() {
  try {
    window.localStorage.removeItem(STATE_STORAGE_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}

export function isValidStoredFilesystem(value) {
  return !!value && typeof value === 'object' && value.id === 'root' && value.type === 'folder' && Array.isArray(value.children);
}
