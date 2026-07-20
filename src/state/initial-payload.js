// Builds the default per-window payload for a freshly opened app instance.
import { NOTE_TEXT } from '../lib/constants.js';

export function initialPayload(appKey, state, extras = {}) {
  switch (appKey) {
    case 'notes': return { text: extras.text ?? state.notesText };
    case 'browser': return { address: extras.address || 'webos://home', history: [{ kind: 'internal', page: extras.page || 'home' }], historyIndex: 0 };
    case 'settings': return { section: 'appearance' };
    case 'calc': return { expression: '', result: '0' };
    case 'terminal': return { lines: [{ type: 'system', text: 'WebOS Terminal ready. Type help to list commands.' }], input: '' };
    default: return { path: extras.path || ['root'], view: 'grid', selectedId: null, previewId: null };
  }
}
