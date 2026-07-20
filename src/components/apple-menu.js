// The system dropdown menu (lock, restart, about) opened from the logo.
import { h } from '../lib/dom.js';

export function AppleMenu({ onLock, onRestart, onAbout }) {
  return h('div', { className: 'apple-menu', onPointerDown: (event) => event.stopPropagation() },
    h('button', { type: 'button', className: 'apple-menu-item', onClick: onAbout }, 'About This WebOS'),
    h('div', { className: 'context-menu-divider' }),
    h('button', { type: 'button', className: 'apple-menu-item', onClick: onLock }, 'Lock Screen'),
    h('button', { type: 'button', className: 'apple-menu-item', onClick: onRestart }, 'Restart')
  );
}
