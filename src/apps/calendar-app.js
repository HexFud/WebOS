import { h, useState } from "../lib/dom.js";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarApp() {
  const [view, setView] = useState(() => { const date = new Date(); return new Date(date.getFullYear(), date.getMonth(), 1); });
  const year = view.getFullYear(); const month = view.getMonth();
  const firstDay = (view.getDay() + 6) % 7;
  const dayCount = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const cells = Array.from({ length: 42 }, (_, index) => index - firstDay + 1);
  const previous = () => setView(new Date(year, month - 1, 1));
  const next = () => setView(new Date(year, month + 1, 1));
  const reset = () => { const date = new Date(); setView(new Date(date.getFullYear(), date.getMonth(), 1)); };
  return h("div", { className: "calendar-app" },
    h("div", { className: "calendar-toolbar" }, h("button", { type: "button", className: "app-toolbar-chip", onClick: previous, "aria-label": "Previous month" }, "‹"), h("button", { type: "button", className: "app-toolbar-chip", onClick: reset }, "Today"), h("button", { type: "button", className: "app-toolbar-chip", onClick: next, "aria-label": "Next month" }, "›")),
    h("h2", { className: "calendar-title" }, new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(view)),
    h("div", { className: "calendar-grid" },
      ...WEEKDAYS.map(day => h("div", { className: "calendar-weekday", key: day }, day)),
      ...cells.map((day, index) => {
        const isCurrent = day > 0 && day <= dayCount;
        const isToday = isCurrent && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
        return h("div", { key: index, className: `calendar-day ${isToday ? "calendar-day--today" : ""} ${isCurrent ? "" : "calendar-day--outside"}` }, isCurrent ? day : "");
      })
    )
  );
}
