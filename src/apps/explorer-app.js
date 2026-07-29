import { h, Fragment, useState } from "../lib/dom.js";

import { NOTE_TEXT } from "../lib/constants.js";

import { findNodeByPath, findNodeById } from "../lib/utils.js";

import { Icon } from "../components/icon.js";

export function ExplorerApp({payload: payload, filesystem: filesystem, onUpdate: onUpdate, onMoveNode: onMoveNode, openApp: openApp, openDesktopItem: openDesktopItem, showToast: showToast}) {
  const currentFolder = findNodeByPath(filesystem, payload.path);
  const query = payload.query || "";
  const visibleChildren = query.trim() ? currentFolder.children.filter(node => node.name.toLowerCase().includes(query.trim().toLowerCase())) : currentFolder.children;
  const preview = payload.previewId ? currentFolder.children.find(child => child.id === payload.previewId) : null;
  const parentPath = payload.path.length > 1 ? payload.path.slice(0, -1) : [ "root" ];
  const [dragOverId, setDragOverId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  function openNode(node) {
    if (node.type === "folder") return onUpdate({
      ...payload,
      path: [ ...payload.path, node.id ],
      selectedId: null,
      previewId: null
    });
    if (node.type === "shortcut") {
      openApp(node.appKey);
      showToast("Shortcut launched", node.name);
      return;
    }
    if (node.type === "file") {
      onUpdate({
        ...payload,
        selectedId: node.id,
        previewId: node.id
      });
      if (node.name.toLowerCase().endsWith(".txt")) openApp("notes", {
        text: node.content || NOTE_TEXT,
        fileId: node.id
      });
    }
  }
  return h("div", {
    className: "explorer-app"
  }, h("div", {
    className: "explorer-toolbar"
  }, h("button", {
    type: "button",
    className: `explorer-button ${dragOverId === "__up__" ? "explorer-button--drop-target" : ""}`,
    onClick: () => onUpdate({
      ...payload,
      path: parentPath,
      selectedId: null,
      previewId: null
    }),
    onDragOver: event => {
      if (!draggingId) return;
      event.preventDefault();
      setDragOverId("__up__");
    },
    onDragLeave: () => setDragOverId(current => current === "__up__" ? null : current),
    onDrop: event => {
      event.preventDefault();
      const sourceId = event.dataTransfer.getData("text/plain") || draggingId;
      const targetId = parentPath[parentPath.length - 1];
      if (sourceId && targetId) onMoveNode(sourceId, targetId);
      setDragOverId(null);
      setDraggingId(null);
    }
  }, "Up"), h("button", {
    type: "button",
    className: "explorer-button",
    onClick: () => onUpdate({
      ...payload,
      view: payload.view === "grid" ? "list" : "grid"
    })
  }, payload.view === "grid" ? "List view" : "Grid view"), h("input", {
    type: "text",
    className: "explorer-search",
    placeholder: "Cerca in questa cartella…",
    value: query,
    onChange: event => onUpdate({
      ...payload,
      query: event.target.value
    })
  }), h("div", {
    className: "explorer-breadcrumb"
  }, payload.path.map((part, index) => {
    const node = index === 0 ? filesystem : findNodeById(filesystem, part);
    return h(Fragment, {
      key: part
    }, index > 0 && h("span", {
      className: "explorer-breadcrumb-separator"
    }, "/"), h("button", {
      type: "button",
      className: "explorer-breadcrumb-item",
      onClick: () => onUpdate({
        ...payload,
        path: payload.path.slice(0, index + 1),
        selectedId: null,
        previewId: null
      })
    }, node?.name || "Desktop"));
  }))), h("div", {
    className: `explorer-layout explorer-layout--${payload.view}`
  }, h("div", {
    className: "explorer-list"
  }, visibleChildren.length ? visibleChildren.map(node => h("button", {
    key: node.id,
    type: "button",
    className: `explorer-item ${payload.selectedId === node.id ? "explorer-item--selected" : ""} ${dragOverId === node.id ? "explorer-item--drop-target" : ""} ${draggingId === node.id ? "explorer-item--dragging" : ""}`,
    draggable: true,
    onDragStart: event => {
      setDraggingId(node.id);
      event.dataTransfer.setData("text/plain", node.id);
      event.dataTransfer.effectAllowed = "move";
    },
    onDragEnd: () => {
      setDraggingId(null);
      setDragOverId(null);
    },
    onDragOver: event => {
      if (node.type !== "folder" || !draggingId || draggingId === node.id) return;
      event.preventDefault();
      setDragOverId(node.id);
    },
    onDragLeave: () => setDragOverId(current => current === node.id ? null : current),
    onDrop: event => {
      if (node.type !== "folder") return;
      event.preventDefault();
      const sourceId = event.dataTransfer.getData("text/plain") || draggingId;
      if (sourceId && sourceId !== node.id) {
        onMoveNode(sourceId, node.id);
        showToast("Moved", `Item moved to "${node.name}".`);
      }
      setDragOverId(null);
      setDraggingId(null);
    },
    onClick: () => onUpdate({
      ...payload,
      selectedId: node.id,
      previewId: node.type === "file" ? node.id : null
    }),
    onDoubleClick: () => openNode(node)
  }, h("span", {
    className: "explorer-item-icon"
  }, h(Icon, {
    icon: node.icon
  })), h("span", {
    className: "explorer-item-name"
  }, node.name), h("span", {
    className: "explorer-item-meta"
  }, node.type))) : h("div", {
    className: "explorer-empty-search"
  }, `Nessun risultato per "${query}".`)), h("aside", {
    className: "explorer-preview"
  }, preview ? h("div", {
    className: "explorer-preview-card"
  }, h("div", {
    className: "explorer-preview-title"
  }, preview.name), h("p", {
    className: "explorer-preview-body"
  }, preview.content || "No preview available.")) : h("div", {
    className: "explorer-preview-empty"
  }, "Select an item to preview it. Double click opens a folder or file."))));
}
