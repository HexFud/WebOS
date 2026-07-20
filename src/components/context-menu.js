// Right-click context menu for the desktop and its icons.
import { h, Fragment } from '../lib/dom.js';
import { WALLPAPERS } from '../lib/wallpapers.js';

export function ContextMenu({ menu, trashCount, onAction }) {
  if (!menu) return null;
  if (menu.targetType === 'trash') {
    return h('div', { className: 'context-menu', style: { left: `${menu.x}px`, top: `${menu.y}px` }, onPointerDown: (event) => event.stopPropagation() },
      h('button', { type: 'button', className: 'context-menu-item', onClick: () => onAction('open-item', 'trash') }, 'Open Trash'),
      trashCount ? h('button', { type: 'button', className: 'context-menu-item', onClick: () => onAction('empty-trash') }, 'Empty Trash') : h('div', { className: 'context-menu-subtitle' }, 'Trash is empty')
    );
  }
  if (menu.targetId) {
    return h('div', { className: 'context-menu', style: { left: `${menu.x}px`, top: `${menu.y}px` }, onPointerDown: (event) => event.stopPropagation() },
      h('button', { type: 'button', className: 'context-menu-item', onClick: () => onAction('open-item', menu.targetId) }, 'Open'),
      h('div', { className: 'context-menu-divider' }),
      h('button', { type: 'button', className: 'context-menu-item context-menu-item--danger', onClick: () => onAction('delete-item', menu.targetId) }, 'Move to Trash')
    );
  }
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
