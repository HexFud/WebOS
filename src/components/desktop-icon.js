// A single draggable desktop icon (shortcut, folder or file).
import { h, useRef } from '../lib/dom.js';
import { Icon } from './icon.js';

export function DesktopIcon({ item, selected, onSelect, onOpen, onMove, onEnd, onContextMenu }) {
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

  return h('button', { ref, className: `desktop-icon ${selected ? 'desktop-icon--selected' : ''}`, 'data-desktop-id': item.id, style: { left: `${item.x}px`, top: `${item.y}px` }, type: 'button', onClick: () => onSelect(item.id), onDoubleClick: () => onOpen(item), onPointerDown: startDrag, onContextMenu: (event) => onContextMenu(item, event) }, h('div', { className: 'desktop-icon-visual' }, h(Icon, { icon: item.icon })), h('div', { className: 'desktop-icon-label' }, item.name));
}
