// Settings app: appearance (theme/wallpaper), system info and account logout.
import { h } from '../lib/dom.js';
import { WALLPAPERS } from '../lib/wallpapers.js';
import { uptime } from '../lib/utils.js';

export function SettingsApp({ state, onTheme, onWallpaper, onLogout, showToast }) {
  const userName = state.account?.userName || 'Guest';
  return h('div', { className: 'settings-app' },
    h('div', { className: 'settings-panel' },
      h('div', { className: 'settings-section-title' }, 'Appearance'),
      h('div', { className: 'settings-toggle-row' }, h('button', { type: 'button', className: `settings-toggle ${state.theme === 'dark' ? 'settings-toggle--active' : ''}`, onClick: () => onTheme('dark') }, 'Dark'), h('button', { type: 'button', className: `settings-toggle ${state.theme === 'light' ? 'settings-toggle--active' : ''}`, onClick: () => onTheme('light') }, 'Light')),
      h('div', { className: 'settings-section-title' }, 'Wallpaper'),
      h('div', { className: 'wallpaper-grid' }, Object.entries(WALLPAPERS).map(([key, wallpaper]) => h('button', { key, type: 'button', className: `wallpaper-card ${state.wallpaper === key ? 'wallpaper-card--active' : ''}`, style: { backgroundImage: wallpaper.background }, onClick: () => { onWallpaper(key); showToast('Wallpaper changed', wallpaper.label); } }, h('span', { className: 'wallpaper-card-label' }, wallpaper.label))))
    ),
    h('div', { className: 'settings-panel settings-panel--info' },
      h('div', { className: 'settings-section-title' }, 'System info'),
      h('dl', { className: 'settings-info-list' }, h('div', null, h('dt', null, 'User'), h('dd', null, userName)), h('div', null, h('dt', null, 'Theme'), h('dd', null, state.theme)), h('div', null, h('dt', null, 'Wallpaper'), h('dd', null, WALLPAPERS[state.wallpaper].label)), h('div', null, h('dt', null, 'Windows'), h('dd', null, String(state.windows.length))), h('div', null, h('dt', null, 'Uptime'), h('dd', null, uptime(state.sessionStartedAt)))),
      h('div', { className: 'settings-section-title' }, 'Account'),
      h('button', { type: 'button', className: 'settings-toggle', onClick: onLogout }, 'Log out & reset account')
    )
  );
}
