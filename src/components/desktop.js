import { h, useState } from '../lib/dom.js';
import { resolveWallpaper } from '../lib/wallpapers.js';
import { TASKBAR_HEIGHT, NOTE_TEXT } from '../lib/constants.js';
import { clamp } from '../lib/utils.js';
import { DesktopIcon } from './desktop-icon.js';
import { StickyNote } from './sticky-note.js';
import { Icon } from './icon.js';
import { WindowFrame } from './window-frame.js';

const ICON_WIDTH = 92;
const ICON_HEIGHT = 102;

function normalizeRect(x1, y1, x2, y2) {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1)
  };
}

function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function Desktop({ state, dispatch, openApp, showToast }) {
  const [marquee, setMarquee] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const desktopItems = state.filesystem.children.filter((item) => item.showOnDesktop);

  function openDesktopItem(item) {
    const originRect = document.querySelector(`[data-desktop-id="${item.id}"]`)?.getBoundingClientRect() || null;
    if (item.type === 'shortcut') return openApp(item.appKey, { originRect });
    if (item.type === 'folder') return openApp('explorer', { path: ['root', item.id], originRect });
    if (item.type === 'file') return openApp('notes', { text: item.content || NOTE_TEXT, fileId: item.id, originRect });
  }

  function openIconContextMenu(item, event) {
    event.preventDefault();
    event.stopPropagation();
    dispatch({ type: 'OPEN_CONTEXT_MENU', value: { x: clamp(event.clientX, 12, window.innerWidth - 180), y: clamp(event.clientY, 12, window.innerHeight - 200), targetId: item.id, targetType: item.type } });
  }

  function selectItem(id, meta = {}) {
    if (meta.toggle) return dispatch({ type: 'TOGGLE_DESKTOP_SELECTION_ITEM', id });
    dispatch({ type: 'SET_DESKTOP_SELECTION', value: [id] });
  }

  function findHoveredFolder(updates) {
    const draggedIds = updates.map((u) => u.id);
    let hovered = null;
    updates.forEach((update) => {
      const centerX = update.x + ICON_WIDTH / 2;
      const centerY = update.y + ICON_HEIGHT / 2;
      const found = desktopItems.find((item) => item.type === 'folder' && !draggedIds.includes(item.id) && centerX >= item.x && centerX <= item.x + ICON_WIDTH && centerY >= item.y && centerY <= item.y + ICON_HEIGHT);
      if (found) hovered = found;
    });
    return hovered;
  }

  function applyMoves(updates) {
    setDropTargetId(findHoveredFolder(updates)?.id || null);
    dispatch({ type: 'UPDATE_FILESYSTEM', value: { ...state.filesystem, children: state.filesystem.children.map((child) => {
      const update = updates.find((u) => u.id === child.id);
      return update ? { ...child, x: update.x, y: update.y } : child;
    }) } });
  }

  function applyMovesEnd(updates) {
    setDropTargetId(null);
    const targetFolder = findHoveredFolder(updates);
    if (targetFolder) {
      updates.forEach((update) => {
        dispatch({ type: 'MOVE_NODE', nodeId: update.id, targetFolderId: targetFolder.id });
      });
      showToast('Spostato', updates.length > 1 ? `${updates.length} elementi spostati in "${targetFolder.name}".` : `Elemento spostato in "${targetFolder.name}".`);
      return;
    }
    dispatch({ type: 'UPDATE_FILESYSTEM', value: { ...state.filesystem, children: state.filesystem.children.map((child) => {
      const update = updates.find((u) => u.id === child.id);
      if (!update) return child;
      return { ...child, x: Math.round(clamp(update.x, 16, window.innerWidth - 140)), y: Math.round(clamp(update.y, 96, window.innerHeight - TASKBAR_HEIGHT - 120)) };
    }) } });
  }

  function onDesktopPointerDown(event) {
    dispatch({ type: 'CLOSE_OVERLAYS' });
    if (event.button !== 0) return;
    if (event.target.closest('.desktop-icon') || event.target.closest('.sticky-note')) return;
    const startX = event.clientX;
    const startY = event.clientY;
    let moved = false;
    let finished = false;
    setMarquee({ x1: startX, y1: startY, x2: startX, y2: startY });

    const move = (moveEvent) => {
      moved = true;
      setMarquee({ x1: startX, y1: startY, x2: moveEvent.clientX, y2: moveEvent.clientY });
    };
    const finish = (endEvent) => {
      if (finished) return;
      finished = true;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      window.removeEventListener('blur', finish);
      const endX = endEvent?.clientX ?? startX;
      const endY = endEvent?.clientY ?? startY;
      const rect = normalizeRect(startX, startY, endX, endY);
      if (moved && (rect.width > 4 || rect.height > 4)) {
        const ids = desktopItems.filter((item) => rectsIntersect(rect, { x: item.x, y: item.y, width: ICON_WIDTH, height: ICON_HEIGHT })).map((item) => item.id);
        dispatch({ type: 'SET_DESKTOP_SELECTION', value: ids });
      } else {
        dispatch({ type: 'SET_DESKTOP_SELECTION', value: [] });
      }
      setMarquee(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    window.addEventListener('blur', finish);
  }

  const marqueeRect = marquee ? normalizeRect(marquee.x1, marquee.y1, marquee.x2, marquee.y2) : null;

  return h('main', {
    className: `desktop desktop--${state.phase}`,
    style: { backgroundImage: resolveWallpaper(state.wallpaper, state.customWallpaper).background, backgroundSize: 'cover', backgroundPosition: 'center' },
    role: 'application',
    'aria-label': 'Desktop',
    onContextMenu: (event) => {
      event.preventDefault();
      dispatch({ type: 'OPEN_CONTEXT_MENU', value: { x: clamp(event.clientX, 12, window.innerWidth - 180), y: clamp(event.clientY, 12, window.innerHeight - 340) } });
    },
    onPointerDown: onDesktopPointerDown
  },
    h('div', { className: 'desktop-overlay' }),
    h('div', { className: 'desktop-icons' },
      desktopItems.map((item) => h(DesktopIcon, {
        key: item.id,
        item,
        items: desktopItems,
        selected: state.selectedDesktopItemIds.includes(item.id),
        selectedIds: state.selectedDesktopItemIds,
        isDropTarget: dropTargetId === item.id,
        onSelect: selectItem,
        onOpen: openDesktopItem,
        onContextMenu: openIconContextMenu,
        onMove: applyMoves,
        onEnd: applyMovesEnd
      }))
    ),
    marqueeRect && h('div', { className: 'marquee-select', style: { left: `${marqueeRect.x}px`, top: `${marqueeRect.y}px`, width: `${marqueeRect.width}px`, height: `${marqueeRect.height}px` } }),
    h('div', { className: 'sticky-notes-layer' },
      state.stickyNotes.map((note) => h(StickyNote, {
        key: note.id,
        note,
        onFocus: () => dispatch({ type: 'FOCUS_STICKY_NOTE', id: note.id }),
        onChange: (id, value) => dispatch({ type: 'EDIT_STICKY_NOTE', id, value }),
        onMove: (id, x, y) => dispatch({ type: 'MOVE_STICKY_NOTE', id, x: Math.round(clamp(x, 0, window.innerWidth - 220)), y: Math.round(clamp(y, 40, window.innerHeight - TASKBAR_HEIGHT - 200)) }),
        onColorChange: (id, color) => dispatch({ type: 'SET_STICKY_NOTE_COLOR', id, color }),
        onDelete: (id) => dispatch({ type: 'DELETE_STICKY_NOTE', id })
      }))
    ),
    h('button', {
      type: 'button',
      className: `desktop-icon desktop-icon--trash ${state.selectedDesktopItemIds.includes('trash') ? 'desktop-icon--selected' : ''}`,
      onClick: () => dispatch({ type: 'SET_DESKTOP_SELECTION', value: ['trash'] }),
      onDoubleClick: () => openApp('trash'),
      onContextMenu: (event) => openIconContextMenu({ id: 'trash', type: 'trash' }, event)
    }, h('div', { className: 'desktop-icon-visual' }, h(Icon, { icon: 'trash' })), h('div', { className: 'desktop-icon-label' }, 'Trash')),
    state.phase !== 'boot' && h('div', { className: 'window-layer' }, state.windows.slice().sort((a, b) => a.z - b.z).map((windowItem) => h(WindowFrame, { key: windowItem.id, windowItem, state, dispatch, openApp, showToast, openDesktopItem }))),
    state.snapPreview && h('div', { className: `snap-preview snap-preview--${state.snapPreview}` })
  );
}
