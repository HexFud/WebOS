// Cmd/Ctrl+Space style search launcher over desktop items and apps.
import { h, useEffect, useRef, useState } from '../lib/dom.js';
import { Icon } from './icon.js';

export function Spotlight({ items, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = query.trim()
    ? items.filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase()))
    : items;

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') { event.preventDefault(); setIndex((value) => Math.min(value + 1, Math.max(results.length - 1, 0))); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setIndex((value) => Math.max(value - 1, 0)); }
    else if (event.key === 'Enter') { event.preventDefault(); if (results[index]) onSelect(results[index]); }
    else if (event.key === 'Escape') { event.preventDefault(); onClose(); }
  }

  return h('div', { className: 'spotlight-overlay', onPointerDown: onClose },
    h('div', { className: 'spotlight-panel', onPointerDown: (event) => event.stopPropagation() },
      h('div', { className: 'spotlight-input-row' },
        h(Icon, { icon: 'search' }),
        h('input', {
          ref: inputRef,
          className: 'spotlight-input',
          value: query,
          placeholder: 'Search apps and files',
          onChange: (event) => { setQuery(event.target.value); setIndex(0); },
          onKeyDown: handleKeyDown
        })
      ),
      results.length
        ? h('div', { className: 'spotlight-results' }, results.map((item, itemIndex) => h('button', {
            type: 'button',
            key: item.key,
            className: `spotlight-result ${itemIndex === index ? 'spotlight-result--active' : ''}`,
            onMouseEnter: () => setIndex(itemIndex),
            onClick: () => onSelect(item)
          }, h('span', { className: 'spotlight-result-icon' }, h(Icon, { icon: item.icon })), h('span', { className: 'spotlight-result-text' }, h('span', { className: 'spotlight-result-title' }, item.title), item.subtitle && h('span', { className: 'spotlight-result-subtitle' }, item.subtitle)))))
        : h('div', { className: 'spotlight-empty' }, 'No matches')
    )
  );
}
