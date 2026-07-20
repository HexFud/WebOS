// Small stateless helpers shared across components: id/formatting helpers, geometry math and filesystem-tree traversal.
import { HEADER_HEIGHT, TASKBAR_HEIGHT } from './constants.js';
import { APPS } from './apps-registry.js';

export function initials(name) {
  const trimmed = (name || '').trim();
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : '?';
}


export function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function gridPosition(index) {
  const column = index % 2;
  const row = Math.floor(index / 2);
  return { x: 32 + column * 116, y: 108 + row * 126 };
}

export function formatTime(date) {
  return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: '2-digit', month: 'long' }).format(date);
}

export function uptime(startedAt) {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function sanitizeExpression(expression) {
  return expression.replace(/[^0-9+\-*/().,% ]/g, '');
}

export function evaluateExpression(expression) {
  const safe = sanitizeExpression(expression).replace(/,/g, '.');
  if (!safe.trim()) {
    return '0';
  }
  try {
    return String(Function(`"use strict"; return (${safe});`)());
  } catch {
    return 'Errore';
  }
}

export function getWorkspaceBounds() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    left: 20,
    top: HEADER_HEIGHT + 12,
    width: Math.max(360, width - 40),
    height: Math.max(240, height - HEADER_HEIGHT - TASKBAR_HEIGHT - 24)
  };
}

export function buildWindowBounds(appKey, openIndex, originRect) {
  const size = APPS[appKey]?.size || [640, 460];
  const workspace = getWorkspaceBounds();
  const width = Math.min(size[0], workspace.width - 24);
  const height = Math.min(size[1], workspace.height - 24);
  const offset = openIndex * 26;
  const x = clamp(workspace.left + Math.round((workspace.width - width) / 2) + offset, workspace.left, workspace.left + workspace.width - width);
  const y = clamp(workspace.top + Math.round((workspace.height - height) / 2) + offset, workspace.top, workspace.top + workspace.height - height);

  if (!originRect) {
    return { x, y, width, height, origin: null };
  }

  const originX = originRect.left + originRect.width / 2;
  const originY = originRect.top + originRect.height / 2;
  return {
    x: clamp(Math.round(originX - width / 2), workspace.left, workspace.left + workspace.width - width),
    y: clamp(Math.round(originY - height / 2), workspace.top, workspace.top + workspace.height - height),
    width,
    height,
    origin: { x: originX, y: originY }
  };
}

export function normalizeDesktop(children) {
  return children.map((item, index) => ({ ...item, ...gridPosition(index) }));
}

export function findNodeByPath(root, path) {
  if (!path || path[0] !== 'root') return root;
  let current = root;
  for (let index = 1; index < path.length; index += 1) {
    const next = current.children.find((child) => child.id === path[index] && child.type === 'folder');
    if (!next) return current;
    current = next;
  }
  return current;
}

export function findNodeById(node, id) {
  if (node.id === id) return node;
  if (!node.children) return null;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

export function updateNodeInTree(node, targetId, updater) {
  if (node.id === targetId) return updater(node);
  if (!node.children) return node;
  return { ...node, children: node.children.map((child) => updateNodeInTree(child, targetId, updater)) };
}


export function iconLabel(node) {
  return node.type === 'shortcut' ? (APPS[node.appKey]?.title || node.name) : node.name;
}
