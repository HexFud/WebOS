// Dock/taskbar: pinned + running apps, click to open/focus/minimize.
import { h } from '../lib/dom.js';
import { APPS } from '../lib/apps-registry.js';
import { Icon } from './icon.js';

export function Taskbar({ state, openApp, dispatch }) {
  const apps = ['explorer', 'notes', 'browser', 'settings', 'calc', 'terminal'];

  function toggleWindow(appKey) {
    const open = state.windows.filter((window) => window.appKey === appKey && !window.closing);
    if (!open.length) return openApp(appKey);
    const active = open.find((window) => window.id === state.activeWindowId);
    if (active && !active.minimized) return dispatch({ type: 'MINIMIZE_WINDOW', id: active.id });
    const top = open.slice().sort((a, b) => b.z - a.z)[0];
    dispatch({ type: 'RESTORE_WINDOW', id: top.id });
  }

  return h('footer', { className: 'dock-wrap' },
    h('div', { className: 'dock' },
      h('button', { type: 'button', className: 'dock-app dock-app--launchpad', onClick: () => dispatch({ type: 'OPEN_SPOTLIGHT' }), title: 'Launchpad' }, h(Icon, { icon: 'launchpad' })),
      h('div', { className: 'dock-divider' }),
      apps.map((appKey) => {
        const open = state.windows.filter((window) => window.appKey === appKey && !window.closing);
        const active = open.some((window) => window.id === state.activeWindowId && !window.minimized);
        return h('button', { key: appKey, type: 'button', className: `dock-app ${open.length ? 'dock-app--open' : ''} ${active ? 'dock-app--active' : ''}`, onClick: () => toggleWindow(appKey), title: APPS[appKey].title },
          h(Icon, { icon: APPS[appKey].icon }),
          open.length ? h('span', { className: 'dock-app-indicator' }) : null
        );
      })
    )
  );
}
