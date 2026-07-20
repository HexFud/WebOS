// Top system menu bar: app title, tray icons and clock.
import { h } from '../lib/dom.js';
import { Icon } from './icon.js';
import { formatTime, formatDate } from '../lib/utils.js';

export function MenuBar({ state, activeAppTitle, dispatch }) {
  return h('header', { className: 'menu-bar' },
    h('div', { className: 'menu-bar-left' },
      h('button', { type: 'button', className: `menu-bar-logo ${state.appleMenuOpen ? 'menu-bar-logo--active' : ''}`, onClick: (event) => { event.stopPropagation(); dispatch({ type: 'TOGGLE_APPLE_MENU' }); }, 'aria-label': 'System menu' }, h(Icon, { icon: 'logo' })),
      h('div', { className: 'menu-bar-app-name' }, activeAppTitle)
    ),
    h('div', { className: 'menu-bar-right' },
      h('button', { type: 'button', className: 'menu-bar-icon-button', onClick: () => dispatch({ type: 'OPEN_SPOTLIGHT' }), title: 'Search (Ctrl+K)', 'aria-label': 'Search' }, h(Icon, { icon: 'search' })),
      h('button', { type: 'button', className: `menu-bar-icon-button ${state.controlCenterOpen ? 'menu-bar-clock--active' : ''}`, onClick: (event) => { event.stopPropagation(); dispatch({ type: 'TOGGLE_CONTROL_CENTER' }); }, title: 'Control Center', 'aria-label': 'Control Center' }, h(Icon, { icon: 'sliders' })),
      h('div', { className: 'menu-bar-tray' }, h(Icon, { icon: state.doNotDisturb ? 'moon' : 'wifi' }), h(Icon, { icon: 'volume' }), h(Icon, { icon: 'battery' })),
      h('button', { type: 'button', className: `menu-bar-clock ${state.notificationCenterOpen ? 'menu-bar-clock--active' : ''}`, onClick: (event) => { event.stopPropagation(); dispatch({ type: 'TOGGLE_NOTIFICATION_CENTER' }); } },
        h('span', { className: 'menu-bar-time' }, formatTime(state.clock)),
        h('span', { className: 'menu-bar-date' }, formatDate(state.clock))
      )
    )
  );
}
