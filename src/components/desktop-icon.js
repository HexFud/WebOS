import { h, useRef } from "../lib/dom.js";

import { Icon } from "./icon.js";

export function DesktopIcon({item: item, items: items, selected: selected, selectedIds: selectedIds, isDropTarget: isDropTarget, onSelect: onSelect, onOpen: onOpen, onMove: onMove, onEnd: onEnd, onContextMenu: onContextMenu}) {
  const ref = useRef(null);
  function startDrag(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      onSelect(item.id, { toggle: true });
      return;
    }
    const groupIds = selected && selectedIds.length > 1 ? selectedIds : [ item.id ];
    if (!(selected && selectedIds.length > 1)) onSelect(item.id, { toggle: false });
    const origins = {};
    groupIds.forEach(id => {
      const found = id === item.id ? item : items.find(candidate => candidate.id === id);
      if (found) origins[id] = {
        x: found.x,
        y: found.y
      };
    });
    const startX = event.clientX;
    const startY = event.clientY;
    let finished = false;
    const move = moveEvent => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      onMove(groupIds.filter(id => origins[id]).map(id => ({
        id: id,
        x: origins[id].x + dx,
        y: origins[id].y + dy
      })));
    };
    const finish = upEvent => {
      if (finished) return;
      finished = true;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("blur", finish);
      const dx = (upEvent?.clientX ?? startX) - startX;
      const dy = (upEvent?.clientY ?? startY) - startY;
      onEnd(groupIds.filter(id => origins[id]).map(id => ({
        id: id,
        x: origins[id].x + dx,
        y: origins[id].y + dy
      })));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("blur", finish);
  }
  return h("button", {
    ref: ref,
    className: `desktop-icon ${selected ? "desktop-icon--selected" : ""} ${isDropTarget ? "desktop-icon--drop-target" : ""}`,
    "data-desktop-id": item.id,
    style: {
      left: `${item.x}px`,
      top: `${item.y}px`
    },
    type: "button",
    onClick: event => {
      if (!event.shiftKey && !event.metaKey && !event.ctrlKey) onSelect(item.id, {
        toggle: false
      });
    },
    onDoubleClick: () => onOpen(item),
    onPointerDown: startDrag,
    onContextMenu: event => onContextMenu(item, event)
  }, h("div", {
    className: "desktop-icon-visual"
  }, h(Icon, {
    icon: item.icon
  })), h("div", {
    className: "desktop-icon-label"
  }, item.name));
}
