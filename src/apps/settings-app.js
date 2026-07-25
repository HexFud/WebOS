import { h, useRef, useState } from "../lib/dom.js";

import { WALLPAPERS, resolveWallpaper, CUSTOM_WALLPAPER_KEY } from "../lib/wallpapers.js";

import { uptime } from "../lib/utils.js";

import { readImageAsWallpaper } from "../lib/wallpaper-upload.js";

export function SettingsApp({state: state, onTheme: onTheme, onWallpaper: onWallpaper, onCustomWallpaper: onCustomWallpaper, onLogout: onLogout, showToast: showToast}) {
  const userName = state.account?.userName || "Guest";
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const activeWallpaper = resolveWallpaper(state.wallpaper, state.customWallpaper);
  function handleFileChange(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    readImageAsWallpaper(file).then(dataUrl => {
      onCustomWallpaper(dataUrl);
      showToast("Wallpaper changed", "Immagine personalizzata impostata.");
    }).catch(error => {
      setUploadError(error.message || "Impossibile caricare l'immagine.");
    }).finally(() => {
      setUploading(false);
    });
  }
  return h("div", {
    className: "settings-app"
  }, h("div", {
    className: "settings-panel"
  }, h("div", {
    className: "settings-section-title"
  }, "Appearance"), h("div", {
    className: "settings-toggle-row"
  }, h("button", {
    type: "button",
    className: `settings-toggle ${state.theme === "dark" ? "settings-toggle--active" : ""}`,
    onClick: () => onTheme("dark")
  }, "Dark"), h("button", {
    type: "button",
    className: `settings-toggle ${state.theme === "light" ? "settings-toggle--active" : ""}`,
    onClick: () => onTheme("light")
  }, "Light")), h("div", {
    className: "settings-section-title"
  }, "Wallpaper"), h("div", {
    className: "wallpaper-grid"
  }, Object.entries(WALLPAPERS).map(([key, wallpaper]) => h("button", {
    key: key,
    type: "button",
    className: `wallpaper-card ${state.wallpaper === key ? "wallpaper-card--active" : ""}`,
    style: {
      backgroundImage: wallpaper.background
    },
    onClick: () => {
      onWallpaper(key);
      showToast("Wallpaper changed", wallpaper.label);
    }
  }, h("span", {
    className: "wallpaper-card-label"
  }, wallpaper.label))), h("button", {
    type: "button",
    className: `wallpaper-card wallpaper-card--custom ${state.wallpaper === CUSTOM_WALLPAPER_KEY ? "wallpaper-card--active" : ""}`,
    style: state.customWallpaper ? {
      backgroundImage: `url("${state.customWallpaper}")`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    } : undefined,
    onClick: () => fileInputRef.current?.click()
  }, h("span", {
    className: "wallpaper-card-label"
  }, uploading ? "Caricamento…" : state.customWallpaper ? "Personalizzato" : "+ Carica immagine"))), h("input", {
    ref: fileInputRef,
    type: "file",
    accept: "image/png, image/jpeg, image/webp",
    className: "wallpaper-upload-input",
    onChange: handleFileChange
  }), uploadError && h("div", {
    className: "settings-upload-error"
  }, uploadError), h("div", {
    className: "settings-hint"
  }, "PNG, JPG o WebP · fino a 6 MB · viene ridimensionata automaticamente e salvata solo nel tuo browser.")), h("div", {
    className: "settings-panel settings-panel--info"
  }, h("div", {
    className: "settings-section-title"
  }, "System info"), h("dl", {
    className: "settings-info-list"
  }, h("div", null, h("dt", null, "User"), h("dd", null, userName)), h("div", null, h("dt", null, "Theme"), h("dd", null, state.theme)), h("div", null, h("dt", null, "Wallpaper"), h("dd", null, activeWallpaper.label)), h("div", null, h("dt", null, "Windows"), h("dd", null, String(state.windows.length))), h("div", null, h("dt", null, "Uptime"), h("dd", null, uptime(state.sessionStartedAt)))), h("div", {
    className: "settings-section-title"
  }, "Account"), h("button", {
    type: "button",
    className: "settings-toggle",
    onClick: onLogout
  }, "Log out & reset account")));
}
