// A single draggable/resizable window frame, including edge-snap detection while dragging.
import { h, Fragment, useEffect, useRef } from '../lib/dom.js';
import { MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT, HEADER_HEIGHT } from '../lib/constants.js';
import { APPS } from '../lib/apps-registry.js';
import { Icon } from './icon.js';
import { renderApp } from '../apps/render-app.js';

export function WindowFrame({ windowItem, state, dispatch, openApp, showToast, openDesktopItem }) {
  const frameRef = useRef(null);
  const liveRef = useRef({ x: windowItem.x, y: windowItem.y, width: windowItem.width, height: windowItem.height });
  const interactingRef = useRef(false);

  useEffect(() => {
    if (!windowItem.closing) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'REMOVE_WINDOW', id: windowItem.id }), 240);
    return () => window.clearTimeout(timer);
  }, [dispatch, windowItem.closing, windowItem.id]);

  useEffect(() => {
    if (windowItem.maximized && frameRef.current) frameRef.current.style.transform = 'none';
  }, [windowItem.maximized]);

  // While the user is actively dragging/resizing, ignore incoming prop updates (e.g. the
  // clock ticking every second) so they can't stomp on the live, in-progress position.
  if (!interactingRef.current) {
    liveRef.current = { x: windowItem.x, y: windowItem.y, width: windowItem.width, height: windowItem.height };
  }
  const live = liveRef.current;

  const style = { left: `${live.x}px`, top: `${live.y}px`, width: `${live.width}px`, height: `${live.height}px`, zIndex: windowItem.z, '--spawn-x': windowItem.origin ? `${windowItem.origin.x - live.x}px` : '0px', '--spawn-y': windowItem.origin ? `${windowItem.origin.y - live.y}px` : '0px' };

  return h('section', { ref: frameRef, className: ['window', state.activeWindowId === windowItem.id ? 'window--active' : '', windowItem.minimized ? 'window--minimized' : '', windowItem.maximized ? 'window--maximized' : '', windowItem.closing ? 'window--closing' : '', windowItem.origin ? 'window--spawned' : ''].join(' '), style, 'data-window-id': windowItem.id, onMouseDown: () => dispatch({ type: 'FOCUS_WINDOW', id: windowItem.id }) },
    h('div', { className: 'window-titlebar', onPointerDown: (event) => startWindowDrag(event, windowItem, dispatch, frameRef, liveRef, interactingRef), onDoubleClick: () => dispatch({ type: 'TOGGLE_MAXIMIZE_WINDOW', id: windowItem.id }) },
      h('div', { className: 'window-controls', onPointerDown: (event) => event.stopPropagation() },
        h('button', { type: 'button', className: 'window-control window-control--close', onClick: () => dispatch({ type: 'START_CLOSE_WINDOW', id: windowItem.id }) }, h(Icon, { icon: 'close' })),
        h('button', { type: 'button', className: 'window-control window-control--minimize', onClick: () => dispatch({ type: 'MINIMIZE_WINDOW', id: windowItem.id }) }, h(Icon, { icon: 'minus' })),
        h('button', { type: 'button', className: 'window-control window-control--maximize', onClick: () => dispatch({ type: 'TOGGLE_MAXIMIZE_WINDOW', id: windowItem.id }) }, h(Icon, { icon: windowItem.maximized ? 'restore' : 'maximize' }))
      ),
      h('div', { className: 'window-title-group' }, h('div', { className: 'window-title-icon' }, h(Icon, { icon: APPS[windowItem.appKey]?.icon || 'folder' })), h('div', { className: 'window-title' }, windowItem.title))
    ),
    h('div', { className: 'window-body' }, renderApp(windowItem, state, dispatch, openApp, showToast, openDesktopItem)),
    !windowItem.maximized && h(Fragment, null,
      ...RESIZE_EDGES.map((edge) => h('div', {
        key: edge,
        className: `window-resize-handle window-resize-handle--${edge}`,
        onPointerDown: (event) => startWindowResize(event, edge, windowItem, dispatch, frameRef, liveRef, interactingRef)
      }))
    )
  );
}

const RESIZE_EDGES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

const SNAP_EDGE_THRESHOLD = 22;

export function detectSnapSide(clientX, clientY) {
  if (clientY <= HEADER_HEIGHT + SNAP_EDGE_THRESHOLD) return 'top';
  if (clientX <= SNAP_EDGE_THRESHOLD) return 'left';
  if (clientX >= window.innerWidth - SNAP_EDGE_THRESHOLD) return 'right';
  return null;
}

export function startWindowDrag(event, windowItem, dispatch, frameRef, liveRef, interactingRef) {
  if (event.button !== 0 || windowItem.maximized) return;
  event.preventDefault();
  const startX = event.clientX;
  const startY = event.clientY;
  const originX = windowItem.x;
  const originY = windowItem.y;
  const originW = windowItem.width;
  const originH = windowItem.height;
  interactingRef.current = true;
  const pointerId = event.pointerId;
  let snapSide = null;
  try { event.currentTarget.setPointerCapture(pointerId); } catch { /* ignore unsupported targets */ }

  const move = (moveEvent) => {
    if (moveEvent.pointerId !== undefined && moveEvent.pointerId !== pointerId) return;
    const nextX = originX + (moveEvent.clientX - startX);
    const nextY = originY + (moveEvent.clientY - startY);
    liveRef.current = { x: nextX, y: nextY, width: originW, height: originH };
    const el = frameRef.current;
    if (el) {
      el.style.left = `${nextX}px`;
      el.style.top = `${nextY}px`;
    }
    const nextSnapSide = detectSnapSide(moveEvent.clientX, moveEvent.clientY);
    if (nextSnapSide !== snapSide) {
      snapSide = nextSnapSide;
      dispatch({ type: 'SET_SNAP_PREVIEW', value: snapSide });
    }
  };

  const finish = (endEvent) => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', finish);
    window.removeEventListener('pointercancel', finish);
    interactingRef.current = false;
    if (snapSide) {
      dispatch({ type: 'SNAP_WINDOW', id: windowItem.id, side: snapSide });
      return;
    }
    const finalBounds = { x: originX + (endEvent.clientX - startX), y: originY + (endEvent.clientY - startY), width: originW, height: originH };
    liveRef.current = finalBounds;
    dispatch({ type: 'MOVE_WINDOW', id: windowItem.id, bounds: finalBounds });
  };

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
}

export function startWindowResize(event, edge, windowItem, dispatch, frameRef, liveRef, interactingRef) {
  if (event.button !== 0 || windowItem.maximized) return;
  event.preventDefault();
  event.stopPropagation();
  dispatch({ type: 'FOCUS_WINDOW', id: windowItem.id });

  const startX = event.clientX;
  const startY = event.clientY;
  const originX = windowItem.x;
  const originY = windowItem.y;
  const originW = windowItem.width;
  const originH = windowItem.height;
  const grabsLeft = edge.includes('w');
  const grabsRight = edge.includes('e');
  const grabsTop = edge.includes('n');
  const grabsBottom = edge.includes('s');
  interactingRef.current = true;
  const pointerId = event.pointerId;
  try { event.currentTarget.setPointerCapture(pointerId); } catch { /* ignore unsupported targets */ }

  const computeBounds = (clientX, clientY) => {
    let width = originW;
    let height = originH;
    let x = originX;
    let y = originY;

    if (grabsRight) {
      width = Math.max(MIN_WINDOW_WIDTH, originW + (clientX - startX));
    } else if (grabsLeft) {
      width = Math.max(MIN_WINDOW_WIDTH, originW - (clientX - startX));
      x = originX + (originW - width);
    }

    if (grabsBottom) {
      height = Math.max(MIN_WINDOW_HEIGHT, originH + (clientY - startY));
    } else if (grabsTop) {
      height = Math.max(MIN_WINDOW_HEIGHT, originH - (clientY - startY));
      y = originY + (originH - height);
    }

    return { x, y, width, height };
  };

  const move = (moveEvent) => {
    if (moveEvent.pointerId !== undefined && moveEvent.pointerId !== pointerId) return;
    const bounds = computeBounds(moveEvent.clientX, moveEvent.clientY);
    liveRef.current = bounds;
    const el = frameRef.current;
    if (el) {
      el.style.left = `${bounds.x}px`;
      el.style.top = `${bounds.y}px`;
      el.style.width = `${bounds.width}px`;
      el.style.height = `${bounds.height}px`;
    }
  };

  const finish = (endEvent) => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', finish);
    window.removeEventListener('pointercancel', finish);
    const bounds = computeBounds(endEvent.clientX, endEvent.clientY);
    liveRef.current = bounds;
    interactingRef.current = false;
    dispatch({ type: 'MOVE_WINDOW', id: windowItem.id, bounds });
  };

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
}
