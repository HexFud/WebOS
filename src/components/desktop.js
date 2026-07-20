// The desktop surface: wallpaper, icon grid, the window layer and the edge-snap preview overlay.
import { h } from '../lib/dom.js';
import { WALLPAPERS } from '../lib/wallpapers.js';
import { TASKBAR_HEIGHT, NOTE_TEXT } from '../lib/constants.js';
import { clamp } from '../lib/utils.js';
import { DesktopIcon } from './desktop-icon.js';
import { Icon } from './icon.js';
import { WindowFrame } from './window-frame.js';

export function Desktop({ state, dispatch, openApp, showToast }) {
  const desktopItems = state.filesystem.children.filter((item) => item.showOnDesktop);

  function openDesktopItem(item) {
    const originRect = document.querySelector(`[data-desktop-id="${item.id}"]`)?.getBoundingClientRect() || null;
    if (item.type === 'shortcut') return openApp(item.appKey, { originRect });
    if (item.type === 'folder') return openApp('explorer', { path: ['root', item.id], originRect });
    if (item.type === 'file') return openApp('notes', { text: item.content || NOTE_TEXT, originRect });
  }

  function openIconContextMenu(item, event) {
    event.preventDefault();
    event.stopPropagation();
    dispatch({ type: 'OPEN_CONTEXT_MENU', value: { x: clamp(event.clientX, 12, window.innerWidth - 180), y: clamp(event.clientY, 12, window.innerHeight - 200), targetId: item.id, targetType: item.type } });
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
    onPointerDown: () => dispatch({ type: 'CLOSE_OVERLAYS' })
  },
    h('div', { className: 'desktop-overlay' }),
    h('div', { className: 'desktop-icons' },
      desktopItems.map((item) => h(DesktopIcon, {
        key: item.id,
        item,
        selected: state.selectedDesktopItemId === item.id,
        onSelect: (id) => dispatch({ type: 'SELECT_DESKTOP_ITEM', value: id }),
        onOpen: openDesktopItem,
        onContextMenu: openIconContextMenu,
        onMove: (id, bounds) => dispatch({ type: 'UPDATE_FILESYSTEM', value: { ...state.filesystem, children: state.filesystem.children.map((child) => child.id === id ? { ...child, x: bounds.x, y: bounds.y } : child) } }),
        onEnd: (id, bounds) => dispatch({ type: 'UPDATE_FILESYSTEM', value: { ...state.filesystem, children: state.filesystem.children.map((child) => child.id === id ? { ...child, x: Math.round(clamp(bounds.x, 16, window.innerWidth - 140)), y: Math.round(clamp(bounds.y, 96, window.innerHeight - TASKBAR_HEIGHT - 120)) } : child) } })
      })),
      h('button', {
        type: 'button',
        className: `desktop-icon desktop-icon--trash ${state.selectedDesktopItemId === 'trash' ? 'desktop-icon--selected' : ''}`,
        onClick: () => dispatch({ type: 'SELECT_DESKTOP_ITEM', value: 'trash' }),
        onDoubleClick: () => openApp('trash'),
        onContextMenu: (event) => openIconContextMenu({ id: 'trash', type: 'trash' }, event)
      }, h('div', { className: 'desktop-icon-visual' }, h(Icon, { icon: 'trash' })), h('div', { className: 'desktop-icon-label' }, 'Trash'))
    ),
    state.phase !== 'boot' && h('div', { className: 'window-layer' }, state.windows.slice().sort((a, b) => a.z - b.z).map((windowItem) => h(WindowFrame, { key: windowItem.id, windowItem, state, dispatch, openApp, showToast, openDesktopItem }))),
    state.snapPreview && h('div', { className: `snap-preview snap-preview--${state.snapPreview}` })
  );
}
