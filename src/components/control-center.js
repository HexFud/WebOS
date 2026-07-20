// Quick-toggle panel: Do Not Disturb, theme and wallpaper picker.
import { h } from '../lib/dom.js';
import { WALLPAPERS } from '../lib/wallpapers.js';
import { Icon } from './icon.js';

export function ControlCenter({ state, dispatch, onClose }) {
  return h('div', { className: 'control-center-overlay', onPointerDown: onClose },
    h('div', { className: 'control-center-panel', onPointerDown: (event) => event.stopPropagation() },
      h('div', { className: 'control-tile-row' },
        h('button', { type: 'button', className: `control-tile ${state.doNotDisturb ? 'control-tile--on' : ''}`, onClick: () => dispatch({ type: 'TOGGLE_DND' }) }, h(Icon, { icon: 'moon' }), h('span', null, 'Do Not Disturb')),
        h('button', { type: 'button', className: `control-tile ${state.theme === 'light' ? 'control-tile--on' : ''}`, onClick: () => dispatch({ type: 'SET_THEME', value: state.theme === 'dark' ? 'light' : 'dark' }) }, h(Icon, { icon: 'sliders' }), h('span', null, state.theme === 'dark' ? 'Dark Mode' : 'Light Mode'))
      ),
      h('div', { className: 'control-center-label' }, 'Wallpaper'),
      h('div', { className: 'control-wallpaper-grid' }, Object.entries(WALLPAPERS).map(([key, wallpaper]) => h('button', {
        type: 'button',
        key,
        className: `control-wallpaper-swatch ${state.wallpaper === key ? 'control-wallpaper-swatch--active' : ''}`,
        style: { backgroundImage: wallpaper.background },
        onClick: () => dispatch({ type: 'SET_WALLPAPER', value: key }),
        title: wallpaper.label
      }, state.wallpaper === key ? h(Icon, { icon: 'check' }) : null)))
    )
  );
}
