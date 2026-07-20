// Trash app: list of deleted items with restore, and empty state.
import { h } from '../lib/dom.js';
import { Icon } from '../components/icon.js';

export function TrashApp({ trash, onRestore, onEmpty }) {
  return h('div', { className: 'trash-app' },
    h('div', { className: 'app-toolbar app-toolbar--compact' },
      h('div', { className: 'app-toolbar-chip' }, `${trash.length} item${trash.length === 1 ? '' : 's'}`),
      trash.length ? h('button', { type: 'button', className: 'app-toolbar-chip app-toolbar-chip--danger', onClick: onEmpty }, 'Empty Trash') : null
    ),
    trash.length
      ? h('div', { className: 'trash-list' }, trash.map((item) => h('div', { className: 'trash-item', key: item.id },
          h('div', { className: 'trash-item-icon' }, h(Icon, { icon: item.icon || 'file' })),
          h('div', { className: 'trash-item-text' }, h('div', { className: 'trash-item-name' }, item.name), h('div', { className: 'trash-item-date' }, `Deleted ${new Date(item.deletedAt).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`)),
          h('button', { type: 'button', className: 'trash-item-restore', onClick: () => onRestore(item.id) }, 'Restore')
        )))
      : h('div', { className: 'trash-empty' }, h(Icon, { icon: 'trash' }), h('div', null, 'Trash is empty'))
  );
}
