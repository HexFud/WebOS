import { h } from "../lib/dom.js";

export function Icon({icon: icon, level: level, charging: charging}) {
  switch (icon) {
   case "paint":
    return h("svg", { viewBox: "0 0 24 24", className: "app-icon-svg", "aria-hidden": "true" }, h("path", { d: "M12 3.8a8.2 8.2 0 1 0 0 16.4h1.1a1.8 1.8 0 0 0 1.1-3.2 1.8 1.8 0 0 1 1.1-3.2h.9A3.9 3.9 0 0 0 20 9.9c0-3.4-3.6-6.1-8-6.1Z", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round" }), h("circle", { cx: "7.9", cy: "10.3", r: "1", fill: "currentColor" }), h("circle", { cx: "10.8", cy: "7.5", r: "1", fill: "currentColor" }), h("circle", { cx: "14.7", cy: "8.1", r: "1", fill: "currentColor" }));

   case "clock":
    return h("svg", { viewBox: "0 0 24 24", className: "app-icon-svg", "aria-hidden": "true" }, h("circle", { cx: "12", cy: "12", r: "8.3", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }), h("path", { d: "M12 7.2v5l3.3 2", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }));

   case "calendar":
    return h("svg", { viewBox: "0 0 24 24", className: "app-icon-svg", "aria-hidden": "true" }, h("rect", { x: "4.2", y: "5.5", width: "15.6", height: "14", rx: "2.4", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }), h("path", { d: "M7.5 3.8v3.5M16.5 3.8v3.5M4.2 9.4h15.6", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }), h("path", { d: "M8 13h.01M12 13h.01M16 13h.01M8 16.2h.01M12 16.2h.01", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }));

   case "media":
    return h("svg", { viewBox: "0 0 24 24", className: "app-icon-svg", "aria-hidden": "true" }, h("rect", { x: "3.7", y: "5.2", width: "16.6", height: "13.6", rx: "3", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }), h("path", { d: "m10 9 5 3-5 3Z", fill: "currentColor" }));

   case "notes":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "app-icon-svg",
      "aria-hidden": "true"
    }, h("path", {
      d: "M7 3.5h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6"
    }), h("path", {
      d: "M8.2 8h7.6M8.2 11h7.6M8.2 14h5.4",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round"
    }));

   case "folder":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "app-icon-svg",
      "aria-hidden": "true"
    }, h("path", {
      d: "M3.8 7.5A2.2 2.2 0 0 1 6 5.3h4.2l1.8 2h6a2.2 2.2 0 0 1 2.2 2.2v6.7A2.2 2.2 0 0 1 18 18.4H6A2.2 2.2 0 0 1 3.8 16.2Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), h("path", {
      d: "M4.5 9.3h15",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round"
    }));

   case "browser":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "app-icon-svg",
      "aria-hidden": "true"
    }, h("rect", {
      x: "3.5",
      y: "5",
      width: "17",
      height: "14",
      rx: "3",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6"
    }), h("path", {
      d: "M3.5 9.2h17M7.5 7.2h.01M10 7.2h.01M12.5 7.2h.01",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round"
    }));

   case "settings":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "app-icon-svg",
      "aria-hidden": "true"
    }, h("path", {
      d: "M10.2 3.8h3.6l.5 2.1a7.5 7.5 0 0 1 1.7.7l2-1.1 2.6 2.6-1.1 2a7.5 7.5 0 0 1 .7 1.7l2.1.5v3.6l-2.1.5a7.5 7.5 0 0 1-.7 1.7l1.1 2-2.6 2.6-2-1.1a7.5 7.5 0 0 1-1.7.7l-.5 2.1h-3.6l-.5-2.1a7.5 7.5 0 0 1-1.7-.7l-2 1.1-2.6-2.6 1.1-2a7.5 7.5 0 0 1-.7-1.7l-2.1-.5v-3.6l2.1-.5a7.5 7.5 0 0 1 .7-1.7l-1.1-2 2.6-2.6 2 1.1a7.5 7.5 0 0 1 1.7-.7Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.3",
      strokeLinejoin: "round"
    }), h("circle", {
      cx: "12",
      cy: "12",
      r: "3.1",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6"
    }));

   case "calc":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "app-icon-svg",
      "aria-hidden": "true"
    }, h("rect", {
      x: "5",
      y: "3.5",
      width: "14",
      height: "17",
      rx: "3",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6"
    }), h("path", {
      d: "M8.2 7h7.6M8 11h2M12 11h2M16 11h0M8 14.7h2M12 14.7h2M16 14.7h0M8 18h2M12 18h2M16 18h0",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round"
    }));

   case "terminal":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "app-icon-svg",
      "aria-hidden": "true"
    }, h("rect", {
      x: "3.5",
      y: "5",
      width: "17",
      height: "14",
      rx: "3",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6"
    }), h("path", {
      d: "M7 10.2 9.8 12 7 13.8M11 14.5h5.5",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }));

   case "wifi":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "tray-icon",
      "aria-hidden": "true"
    }, h("path", {
      d: "M4 8.8a12 12 0 0 1 16 0M7.3 12a7.4 7.4 0 0 1 9.4 0M10.6 15.1a2.2 2.2 0 0 1 2.8 0",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round"
    }), h("circle", {
      cx: "12",
      cy: "18.3",
      r: "1.1",
      fill: "currentColor"
    }));

   case "volume":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "tray-icon",
      "aria-hidden": "true"
    }, h("path", {
      d: "M5.8 10.2H8.8L13 6.8v10.4l-4.2-3.4H5.8a1.2 1.2 0 0 1-1.2-1.2v-1.2a1.2 1.2 0 0 1 1.2-1.2Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), h("path", {
      d: "M15.6 9.6a3.7 3.7 0 0 1 0 4.8M17.8 7.4a6.8 6.8 0 0 1 0 9.2",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round"
    }));

   case "battery":
    {
      const fillLevel = typeof level === "number" ? Math.max(0.06, Math.min(1, level)) : 1;
      return h("svg", {
        viewBox: "0 0 24 24",
        className: "tray-icon",
        "aria-hidden": "true"
      }, h("rect", {
        x: "4",
        y: "7",
        width: "15.5",
        height: "10",
        rx: "2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.6"
      }), h("path", {
        d: "M19.5 10h.9v4h-.9",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round"
      }), h("rect", {
        x: "6",
        y: "9",
        width: 9 * fillLevel,
        height: "6",
        rx: "1.4",
        fill: "currentColor",
        opacity: fillLevel < 0.2 ? 0.9 : 0.85
      }), charging && h("path", {
        d: "M12.6 8.5 9.8 12.4h2.1l-1.1 3.1 3.4-4.4h-2.2Z",
        fill: "#0a0f1a",
        stroke: "none"
      }));
    }

   case "start":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "tray-icon",
      "aria-hidden": "true"
    }, h("path", {
      d: "M4 5.6 11 4v8l-7 .4ZM13 3.8 20 2.9V12l-7-.2ZM4 13.2l7 .2V21l-7-1.6ZM13 13.4l7-.2V21l-7-.8Z",
      fill: "currentColor",
      opacity: .92
    }));

   case "close":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "control-svg",
      "aria-hidden": "true"
    }, h("path", {
      d: "M6 6 18 18M18 6 6 18",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round"
    }));

   case "minus":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "control-svg",
      "aria-hidden": "true"
    }, h("path", {
      d: "M6 12h12",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round"
    }));

   case "maximize":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "control-svg",
      "aria-hidden": "true"
    }, h("path", {
      d: "M6.5 6.5h11v11h-11Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }));

   case "restore":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "control-svg",
      "aria-hidden": "true"
    }, h("path", {
      d: "M8.5 7.5h8v8h-8Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), h("path", {
      d: "M6.5 10.5V6.5h4",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.4",
      strokeLinecap: "round"
    }));

   case "logo":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "menu-bar-logo-svg",
      "aria-hidden": "true"
    }, h("circle", {
      cx: "12",
      cy: "12",
      r: "8.4",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7"
    }), h("path", {
      d: "M8.4 10.2c0-2 1.6-3.6 3.6-3.6s3.6 1.6 3.6 3.6-1.6 3.6-3.6 3.6",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round"
    }), h("circle", {
      cx: "12",
      cy: "16.2",
      r: "1.1",
      fill: "currentColor"
    }));

   case "search":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "tray-icon",
      "aria-hidden": "true"
    }, h("circle", {
      cx: "10.8",
      cy: "10.8",
      r: "6.3",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7"
    }), h("path", {
      d: "M15.6 15.6 20 20",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      strokeLinecap: "round"
    }));

   case "launchpad":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "app-icon-svg",
      "aria-hidden": "true"
    }, [ [ 5.2, 5.2 ], [ 12, 5.2 ], [ 18.8, 5.2 ], [ 5.2, 12 ], [ 12, 12 ], [ 18.8, 12 ], [ 5.2, 18.8 ], [ 12, 18.8 ], [ 18.8, 18.8 ] ].map(([cx, cy], index) => h("circle", {
      key: index,
      cx: cx,
      cy: cy,
      r: "1.9",
      fill: "currentColor"
    })));

   case "trash":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "tray-icon",
      "aria-hidden": "true"
    }, h("path", {
      d: "M5.5 7.5h13M9.5 7.5V5.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7M7.3 7.5l.8 11.3a1.5 1.5 0 0 0 1.5 1.4h4.8a1.5 1.5 0 0 0 1.5-1.4l.8-11.3",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }));

   case "sliders":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "tray-icon",
      "aria-hidden": "true"
    }, h("path", {
      d: "M5 6.5h14M5 12h14M5 17.5h14",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round"
    }), h("circle", {
      cx: "9",
      cy: "6.5",
      r: "2",
      fill: "currentColor"
    }), h("circle", {
      cx: "16",
      cy: "12",
      r: "2",
      fill: "currentColor"
    }), h("circle", {
      cx: "10.5",
      cy: "17.5",
      r: "2",
      fill: "currentColor"
    }));

   case "moon":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "tray-icon",
      "aria-hidden": "true"
    }, h("path", {
      d: "M18.4 14.2A7.6 7.6 0 1 1 9.8 5.6a6 6 0 0 0 8.6 8.6Z",
      fill: "currentColor"
    }));

   case "check":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "tray-icon",
      "aria-hidden": "true"
    }, h("path", {
      d: "M5 12.5 9.5 17 19 7",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }));

   case "grid":
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "app-icon-svg",
      "aria-hidden": "true"
    }, h("rect", { x: "3.5", y: "3.5", width: "7", height: "7", rx: "1.6", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }), h("rect", { x: "13.5", y: "3.5", width: "7", height: "7", rx: "1.6", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }), h("rect", { x: "3.5", y: "13.5", width: "7", height: "7", rx: "1.6", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }), h("rect", { x: "13.5", y: "13.5", width: "7", height: "7", rx: "1.6", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }));

   default:
    return h("svg", {
      viewBox: "0 0 24 24",
      className: "app-icon-svg",
      "aria-hidden": "true"
    }, h("circle", {
      cx: "12",
      cy: "12",
      r: "8",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6"
    }));
  }
}
