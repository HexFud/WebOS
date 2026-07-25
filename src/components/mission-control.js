import { h } from '../lib/dom.js';
import { APPS } from '../lib/apps-registry.js';
import { Icon } from './icon.js';

export function MissionControl({ windows, onSelect, onClose }) {
  const visible = windows.filter((windowItem) => !windowItem.closing);

  return h('div', {
    className: 'mission-control',
    onPointerDown: onClose
  },
    h('div', { className: 'mission-control-hint' }, 'Mission Control · fai clic su una finestra o premi Esc'),
    h('div', { className: 'mission-control-grid' },
      visible.length
        ? visible.map((windowItem) => h('button', {
            key: windowItem.id,
            type: 'button',
            className: `mission-control-card ${windowItem.minimized ? 'mission-control-card--minimized' : ''}`,
            style: { aspectRatio: `${windowItem.width} / ${windowItem.height}` },
            onPointerDown: (event) => event.stopPropagation(),
            onClick: (event) => {
              event.stopPropagation();
              onSelect(windowItem.id);
            }
          },
            h('div', { className: 'mission-control-card-titlebar' },
              h('span', { className: 'mission-control-card-icon' }, h(Icon, { icon: APPS[windowItem.appKey]?.icon })),
              h('span', { className: 'mission-control-card-title' }, windowItem.title)
            ),
            h('div', { className: 'mission-control-card-body' },
              windowItem.minimized && h('span', { className: 'mission-control-card-minimized-label' }, 'Ridotta a icona')
            )
          ))
        : h('div', { className: 'mission-control-empty' }, 'Nessuna finestra aperta.')
    )
  );
}
