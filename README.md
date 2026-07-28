# WebOS

```
 __        __   _      ___  ____
 \ \      / /__| |__  / _ \/ ___|
  \ \ /\ / / _ \ '_ \| | | \___ \
   \ V  V /  __/ |_) | |_| |___) |
    \_/\_/ \___|_.__/ \___/|____/
```

A macOS-style desktop recreated entirely in the browser, with no build framework: draggable and resizable windows, a Finder, a text editor, a terminal, a working web browser, and more.

## Quick Start

This project uses ES modules (`import`/`export`), so it must be served by a small local server — opening `index.html` directly as a file (`file://`) will not work in modern browsers.

```bash
# from the project folder
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

> On Windows, if `.js` files are served with the wrong MIME type, use the included `serve.py` script instead of `python -m http.server`.

## Features

- **Windows** — drag, resize from corners/edges, window snapping to screen edges, Mission Control (`F3`) to view all open windows, Alt+Tab to switch between them.
- **Finder (File Explorer)** — nested folders, grid/list views, real-time search, file preview.
- **Text Editor** — actually opens and saves files to the virtual "disk" (persistent via `localStorage`).
- **Browser** — browse real websites via iframe, with back/forward history (some websites block iframes for their own security reasons — in that case, there is an "Open in a new tab" button).
- **Terminal** — a minimal shell with a handful of commands (type `help` for the list), command history with ↑ ↓ arrows.
- **Calculator**, **Trash**, **Settings** (light/dark theme, wallpapers).
- **Spotlight** (`Ctrl/Cmd+K`), **Control Center**, **Notification Center**.
- Multi-selection of desktop icons with a selection rectangle (marquee), use the Delete key to trash them.
- Local account with a password, everything is saved entirely in the browser's `localStorage` — no server, no data sent anywhere.

## Project Structure

```
index.html          HTML entry point
main.css             imports all CSS modules in css/
css/                  one file per area (windows, dock, each app, animations...)
src/
  main.js             mounts the React app
  App.js               root component: global state, keyboard shortcuts
  lib/                  constants, storage, utilities, app registry, wallpapers
  state/                reducer and initial state
  components/           system shell (dock, menu bar, windows, overlays...)
  apps/                  individual apps (Finder, editor, browser, terminal...)
```

Each file has a single responsibility: JS modules use real `import`/`export` (no bundler required, works natively with `<script type="module">`), and the CSS is split by component area instead of a single monolithic stylesheet.

## Technical Notes

- No dependencies to install: React and ReactDOM are loaded via CDN (`unpkg`) as UMD scripts, and the rest of the code relies on native browser ES modules.
- The entire system state lives in a single `useReducer` (`src/state/reducer.js`).
- Persistence (account, filesystem, notes, theme, wallpaper, trash) is *best-effort*: if the browser blocks `localStorage`, the app will still function in-memory for the current session.
- The battery shown in the menu bar uses the browser's Battery Status API when available; otherwise, it shows a generic icon instead of making up a fake value.

## Known Limitations

- The internal browser cannot load websites that explicitly forbid iframe embedding (e.g., Google) — this is a security restriction enforced by the website itself and cannot be bypassed on the client side.
- The Battery Status API is not supported by all browsers (e.g., Firefox and Safari have removed it): in that case, the battery indicator will remain generic.

## AI Declaration

I made very limited use of AI during this project. It was only used to help create the initial structure of the code.
