// The full-screen boot progress animation shown on first load / restart.
import { h } from '../lib/dom.js';

export function BootScreen({ progress }) {
  return h('div', { className: 'boot-screen' },
    h('div', { className: 'boot-card' },
      h('div', { className: 'boot-logo-wrap' }, h('div', { className: 'boot-logo-ring' }), h('div', { className: 'boot-logo' }, 'W')),
      h('div', { className: 'boot-title' }, 'WebOS'),
      h('div', { className: 'boot-subtitle' }, 'Initializing desktop environment'),
      h('div', { className: 'boot-progress-track', role: 'progressbar', 'aria-valuenow': progress, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('div', { className: 'boot-progress-fill', style: { width: `${progress}%` } })),
      h('div', { className: 'boot-percent' }, `${Math.round(progress)}%`)
    )
  );
}
