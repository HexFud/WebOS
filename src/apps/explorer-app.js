// File Explorer app: breadcrumb navigation, grid/list view and a preview pane.
import { h, Fragment } from '../lib/dom.js';
import { NOTE_TEXT } from '../lib/constants.js';
import { findNodeByPath, findNodeById } from '../lib/utils.js';
import { Icon } from '../components/icon.js';

export function ExplorerApp({ payload, filesystem, onUpdate, openApp, openDesktopItem, showToast }) {
  const currentFolder = findNodeByPath(filesystem, payload.path);
  const preview = payload.previewId ? currentFolder.children.find((child) => child.id === payload.previewId) : null;
  const parentPath = payload.path.length > 1 ? payload.path.slice(0, -1) : ['root'];

  function openNode(node) {
    if (node.type === 'folder') return onUpdate({ ...payload, path: [...payload.path, node.id], selectedId: null, previewId: null });
    if (node.type === 'shortcut') { openApp(node.appKey); showToast('Shortcut launched', node.name); return; }
    if (node.type === 'file') {
      onUpdate({ ...payload, selectedId: node.id, previewId: node.id });
      if (node.name.toLowerCase().endsWith('.txt')) openApp('notes', { text: node.content || NOTE_TEXT });
    }
  }

  return h('div', { className: 'explorer-app' },
    h('div', { className: 'explorer-toolbar' },
      h('button', { type: 'button', className: 'explorer-button', onClick: () => onUpdate({ ...payload, path: parentPath, selectedId: null, previewId: null }) }, 'Up'),
      h('button', { type: 'button', className: 'explorer-button', onClick: () => onUpdate({ ...payload, view: payload.view === 'grid' ? 'list' : 'grid' }) }, payload.view === 'grid' ? 'List view' : 'Grid view'),
      h('div', { className: 'explorer-breadcrumb' }, payload.path.map((part, index) => {
        const node = index === 0 ? filesystem : findNodeById(filesystem, part);
        return h(Fragment, { key: part }, index > 0 && h('span', { className: 'explorer-breadcrumb-separator' }, '/'), h('button', { type: 'button', className: 'explorer-breadcrumb-item', onClick: () => onUpdate({ ...payload, path: payload.path.slice(0, index + 1), selectedId: null, previewId: null }) }, node?.name || 'Desktop'));
      }))
    ),
    h('div', { className: `explorer-layout explorer-layout--${payload.view}` },
      h('div', { className: 'explorer-list' }, currentFolder.children.map((node) => h('button', { key: node.id, type: 'button', className: `explorer-item ${payload.selectedId === node.id ? 'explorer-item--selected' : ''}`, onClick: () => onUpdate({ ...payload, selectedId: node.id, previewId: node.type === 'file' ? node.id : null }), onDoubleClick: () => openNode(node) }, h('span', { className: 'explorer-item-icon' }, h(Icon, { icon: node.icon })), h('span', { className: 'explorer-item-name' }, node.name), h('span', { className: 'explorer-item-meta' }, node.type)))),
      h('aside', { className: 'explorer-preview' }, preview ? h('div', { className: 'explorer-preview-card' }, h('div', { className: 'explorer-preview-title' }, preview.name), h('p', { className: 'explorer-preview-body' }, preview.content || 'No preview available.')) : h('div', { className: 'explorer-preview-empty' }, 'Select an item to preview it. Double click opens a folder or file.'))
    )
  );
}
