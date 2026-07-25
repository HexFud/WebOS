import { h } from "../lib/dom.js";

function downloadTextFile(fileName, text) {
  const blob = new Blob([ text ], {
    type: "text/plain"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function NotesApp({value: value, onChange: onChange, fileName: fileName}) {
  return h("div", {
    className: "notes-app"
  }, h("div", {
    className: "app-toolbar app-toolbar--compact"
  }, h("div", {
    className: "app-toolbar-group"
  }, h("div", {
    className: "app-toolbar-chip"
  }, "Autosaved locally"), h("div", {
    className: "app-toolbar-chip"
  }, `${value.trim().split(/\s+/).filter(Boolean).length} words`)), h("button", {
    type: "button",
    className: "app-toolbar-chip",
    onClick: () => downloadTextFile(fileName || "Note.txt", value)
  }, "Download .txt")), h("textarea", {
    className: "notes-editor",
    value: value,
    onChange: event => onChange(event.target.value),
    spellCheck: false,
    placeholder: "Write your note here..."
  }));
}
