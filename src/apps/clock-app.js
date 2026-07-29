import { h, useEffect, useState } from "../lib/dom.js";

export function ClockApp() {
  const [now, setNow] = useState(new Date());
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(id); }, []);
  useEffect(() => { if (!running) return undefined; const id = window.setInterval(() => setElapsed(value => value + 10), 10); return () => window.clearInterval(id); }, [running]);
  const stopwatch = `${String(Math.floor(elapsed / 60000)).padStart(2, "0")}:${String(Math.floor(elapsed / 1000) % 60).padStart(2, "0")}.${String(Math.floor(elapsed / 10) % 100).padStart(2, "0")}`;
  return h("div", { className: "clock-app" },
    h("div", { className: "clock-app__time" }, new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now)),
    h("div", { className: "clock-app__date" }, new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(now)),
    h("div", { className: "clock-app__zone" }, Intl.DateTimeFormat().resolvedOptions().timeZone),
    h("div", { className: "clock-stopwatch" }, h("div", { className: "clock-stopwatch__label" }, "STOPWATCH"), h("div", { className: "clock-stopwatch__value" }, stopwatch), h("div", { className: "clock-stopwatch__actions" }, h("button", { type: "button", className: "app-toolbar-chip", onClick: () => setRunning(value => !value) }, running ? "Pause" : "Start"), h("button", { type: "button", className: "app-toolbar-chip", onClick: () => { setRunning(false); setElapsed(0); } }, "Reset")))
  );
}
