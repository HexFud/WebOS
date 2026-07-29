import { h, useRef, useState } from "../lib/dom.js";
import { WALLPAPERS, resolveWallpaper, CUSTOM_WALLPAPER_KEY } from "../lib/wallpapers.js";
import { uptime } from "../lib/utils.js";
import { readImageAsWallpaper } from "../lib/wallpaper-upload.js";
import { t } from "../lib/i18n.js";

export function SettingsApp({ state, onTheme, onWallpaper, onCustomWallpaper, onLanguage, onLogout, showToast }) {
  const inputRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const tr = (key, values) => t(state.language, key, values);
  const wallpaper = resolveWallpaper(state.wallpaper, state.customWallpaper);
  const upload = event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true); setUploadError(null);
    readImageAsWallpaper(file).then(image => {
      onCustomWallpaper(image);
      showToast(tr("wallpaperChanged"), tr("customWallpaperSet"));
    }).catch(error => setUploadError(error.message || tr("unableToUpload"))).finally(() => setUploading(false));
  };
  return h("div", { className: "settings-app" },
    h("div", { className: "settings-panel" },
      h("div", { className: "settings-section-title" }, tr("appearance")),
      h("div", { className: "settings-toggle-row" },
        h("button", { type: "button", className: `settings-toggle ${state.theme === "dark" ? "settings-toggle--active" : ""}`, onClick: () => onTheme("dark") }, tr("dark")),
        h("button", { type: "button", className: `settings-toggle ${state.theme === "light" ? "settings-toggle--active" : ""}`, onClick: () => onTheme("light") }, tr("light"))
      ),
      h("div", { className: "settings-section-title" }, tr("wallpaper")),
      h("div", { className: "wallpaper-grid" },
        ...Object.entries(WALLPAPERS).map(([key, item]) => h("button", { key, type: "button", className: `wallpaper-card ${state.wallpaper === key ? "wallpaper-card--active" : ""}`, style: { backgroundImage: item.background }, onClick: () => { onWallpaper(key); showToast(tr("wallpaperChanged"), item.label); } }, h("span", { className: "wallpaper-card-label" }, item.label))),
        h("button", { type: "button", className: `wallpaper-card wallpaper-card--custom ${state.wallpaper === CUSTOM_WALLPAPER_KEY ? "wallpaper-card--active" : ""}`, style: state.customWallpaper ? { backgroundImage: `url("${state.customWallpaper}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined, onClick: () => inputRef.current?.click() }, h("span", { className: "wallpaper-card-label" }, uploading ? tr("loading") : state.customWallpaper ? tr("custom") : tr("uploadImage")))
      ),
      h("input", { ref: inputRef, type: "file", accept: "image/png, image/jpeg, image/webp", className: "wallpaper-upload-input", onChange: upload }),
      uploadError && h("div", { className: "settings-upload-error" }, uploadError),
      h("div", { className: "settings-hint" }, tr("imageHint"))
    ),
    h("div", { className: "settings-panel settings-panel--info" },
      h("div", { className: "settings-section-title" }, tr("systemInfo")),
      h("dl", { className: "settings-info-list" },
        h("div", null, h("dt", null, tr("user")), h("dd", null, state.account?.userName || "Guest")),
        h("div", null, h("dt", null, tr("theme")), h("dd", null, state.theme)),
        h("div", null, h("dt", null, tr("wallpaper")), h("dd", null, wallpaper.label)),
        h("div", null, h("dt", null, tr("windows")), h("dd", null, String(state.windows.length))),
        h("div", null, h("dt", null, tr("uptime")), h("dd", null, uptime(state.sessionStartedAt)))
      ),
      h("div", { className: "settings-section-title" }, tr("language")),
      h("div", { className: "settings-toggle-row" },
        h("button", { type: "button", className: `settings-toggle ${state.language === "en" ? "settings-toggle--active" : ""}`, onClick: () => onLanguage("en") }, tr("english")),
        h("button", { type: "button", className: `settings-toggle ${state.language === "it" ? "settings-toggle--active" : ""}`, onClick: () => onLanguage("it") }, tr("italian"))
      ),
      h("div", { className: "settings-section-title" }, tr("account")),
      h("button", { type: "button", className: "settings-toggle", onClick: onLogout }, tr("logOut"))
    )
  );
}
