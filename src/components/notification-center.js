// Notification history panel opened from the tray.
import { h } from '../lib/dom.js';
import { Icon } from './icon.js';

export function NotificationCenter({ notifications, onClear, onClose }) {
  return h('div', { className: 'notification-overlay', onPointerDown: onClose },
    h('div', { className: 'notification-panel', onPointerDown: (event) => event.stopPropagation() },
      h('div', { className: 'notification-panel-header' },
        h('div', { className: 'notification-panel-title' }, 'Notification Center'),
        notifications.length ? h('button', { type: 'button', className: 'notification-clear', onClick: onClear }, h(Icon, { icon: 'trash' }), 'Clear') : null
      ),
      notifications.length
        ? h('div', { className: 'notification-list' }, notifications.map((toast, index) => h('div', { className: `notification-item notification-item--${toast.variant || 'info'}`, key: `${toast.id}-${index}` },
            h('div', { className: 'notification-item-title' }, toast.title),
            h('div', { className: 'notification-item-body' }, toast.message),
            h('div', { className: 'notification-item-time' }, new Date(toast.time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }))
          )))
        : h('div', { className: 'notification-empty' }, 'No notifications yet.')
    )
  );
}
