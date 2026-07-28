import { h, useRef } from '../lib/dom.js';
import { Icon } from './icon.js';

export const STICKY_COLORS = ['#ffe066', '#a8e6a1', '#8ecbff', '#ffb3c1', '#d9c2ff'];

export function StickyNote({ note, onChange, onMove, onDelete, onColorChange, onFocus }) {
  const ref = useRef(null);

  function startDrag(event) {
    if (event.button !== 0) return;
    if (event.target.closest('.sticky-note-body') || event.target.closest('.sticky-note-swatch') || event.target.closest('.sticky-note-delete')) return;
    event.preventDefault();
    event.stopPropagation();
    onFocus();
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = note.x;
    const originY = note.y;
    let finished = false;
    const move = (moveEvent) => {
      onMove(note.id, originX + (moveEvent.clientX - startX), originY + (moveEvent.clientY - startY));
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      window.removeEventListener('blur', finish);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    window.addEventListener('blur', finish);
  }

  return h('div', {
    ref,
    className: 'sticky-note',
    style: { left: `${note.x}px`, top: `${note.y}px`, background: note.color },
    onPointerDown: startDrag
  },
    h('div', { className: 'sticky-note-toolbar' },
      STICKY_COLORS.map((color) => h('button', {
        key: color,
        type: 'button',
        className: `sticky-note-swatch ${note.color === color ? 'sticky-note-swatch--active' : ''}`,
        style: { background: color },
        title: 'Cambia colore',
        onClick: () => onColorChange(note.id, color)
      })),
      h('button', {
        type: 'button',
        className: 'sticky-note-delete',
        title: 'Elimina nota',
        onClick: () => onDelete(note.id)
      }, h(Icon, { icon: 'close' }))
    ),
    h('textarea', {
      className: 'sticky-note-body',
      value: note.text,
      placeholder: 'Scrivi qualcosa…',
      spellCheck: false,
      onChange: (event) => onChange(note.id, event.target.value)
    })
  );
}
