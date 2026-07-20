// Stack of auto-dismissing toast notifications, corner-anchored.
import { h } from '../lib/dom.js';

export function ToastStack({ toasts }) {
  return h('div', { className: 'toast-stack' }, toasts.map((toast) => h('div', { className: `toast toast--${toast.variant || 'info'}`, key: toast.id }, h('div', { className: 'toast-title' }, toast.title), h('div', { className: 'toast-body' }, toast.message))));
}
