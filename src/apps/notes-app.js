// Text Editor app: a simple autosaved textarea with a live word count.
import { h } from '../lib/dom.js';

export function NotesApp({ value, onChange }) {
  return h('div', { className: 'notes-app' }, h('div', { className: 'app-toolbar app-toolbar--compact' }, h('div', { className: 'app-toolbar-chip' }, 'Autosaved locally'), h('div', { className: 'app-toolbar-chip' }, `${value.trim().split(/\s+/).filter(Boolean).length} words`)), h('textarea', { className: 'notes-editor', value, onChange: (event) => onChange(event.target.value), spellCheck: false, placeholder: 'Write your note here...' }));
}

// Feature: real browser. Typed addresses/searches load actual pages in a sandboxed
// iframe (with a DuckDuckGo fallback for plain search terms) instead of only
// switching between three static, hardcoded panels. Some sites still refuse to be
// framed (X-Frame-Options/CSP) — for those we surface a clear "open in new tab" link.
