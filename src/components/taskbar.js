import { h } from "../lib/dom.js";

import { APPS } from "../lib/apps-registry.js";

import { Icon } from "./icon.js";

export function Taskbar({state: state, openApp: openApp, dispatch: dispatch}) {
  const apps = [ "explorer", "notes", "browser", "settings", "calc", "terminal" ];
  function toggleWindow(appKey) {
    const open = state.windows.filter(window => window.appKey === appKey && !window.closing);
    if (!open.length) return openApp(appKey);
    const active = open.find(window => window.id === state.activeWindowId);
    if (active && !active.minimized) return dispatch({
      type: "MINIMIZE_WINDOW",
      id: active.id
    });
    const top = open.slice().sort((a, b) => b.z - a.z)[0];
    dispatch({
      type: "RESTORE_WINDOW",
      id: top.id
    });
  }
  return h("footer", {
    className: "dock-wrap"
  }, h("div", {
    className: "dock"
  }, h("button", {
    type: "button",
    className: "dock-app dock-app--launchpad",
    onClick: () => dispatch({
      type: "OPEN_SPOTLIGHT"
    }),
    title: "Launchpad"
  }, h(Icon, {
    icon: "launchpad"
  })), h("button", {
    type: "button",
    className: "dock-app dock-app--mission-control",
    onClick: () => dispatch({
      type: "TOGGLE_MISSION_CONTROL"
    }),
    title: "Mission Control"
  }, h(Icon, {
    icon: "grid"
  })), h("div", {
    className: "dock-divider"
  }), apps.map(appKey => {
    const open = state.windows.filter(window => window.appKey === appKey && !window.closing);
    const active = open.some(window => window.id === state.activeWindowId && !window.minimized);
    return h("button", {
      key: appKey,
      type: "button",
      className: `dock-app ${open.length ? "dock-app--open" : ""} ${active ? "dock-app--active" : ""}`,
      onClick: () => toggleWindow(appKey),
      title: APPS[appKey].title
    }, h(Icon, {
      icon: APPS[appKey].icon
    }), open.length ? h("span", {
      className: "dock-app-indicator"
    }) : null);
  })));
}
