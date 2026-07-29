import { h, useEffect, useRef, useState } from "../lib/dom.js";

export function MediaApp() {
  const inputRef = useRef(null);
  const [media, setMedia] = useState(null);
  useEffect(() => () => { if (media?.url) URL.revokeObjectURL(media.url); }, [media]);
  const selectFile = event => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    if (media?.url) URL.revokeObjectURL(media.url);
    setMedia({ name: file.name, url: URL.createObjectURL(file), kind: file.type.startsWith("video/") ? "video" : "audio" });
  };
  return h("div", { className: "media-app" },
    h("input", { ref: inputRef, type: "file", accept: "audio/*,video/*", className: "media-input", onChange: selectFile }),
    media ? h("div", { className: "media-player" }, media.kind === "video" ? h("video", { className: "media-video", src: media.url, controls: true, autoPlay: true }) : h("div", { className: "media-audio" }, h("div", { className: "media-audio__art" }, "♫"), h("audio", { src: media.url, controls: true, autoPlay: true })), h("div", { className: "media-name" }, media.name), h("button", { type: "button", className: "app-toolbar-chip", onClick: () => inputRef.current?.click() }, "Choose another file")) : h("div", { className: "media-empty" }, h("div", { className: "media-empty__icon" }, "▶"), h("h2", null, "Media Player"), h("p", null, "Play audio or video from your device."), h("button", { type: "button", className: "app-toolbar-chip", onClick: () => inputRef.current?.click() }, "Open media file"))
  );
}
