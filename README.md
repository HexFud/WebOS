```text
 __        __   _      ___  ____
 \ \      / /__| |__  / _ \/ ___|
  \ \ /\ / / _ \ '_ \| | | \___ \
   \ V  V /  __/ |_) | |_| |___) |
    \_/\_/ \___|_.__/ \___/|____/
```

I built a macOS-inspired desktop environment that runs entirely in your browser. No Webpack, no Vite, no build steps—just plain HTML, CSS, and native ES modules. It comes with a window manager, a virtual file system, a terminal, and a few basic apps.

## How to run it

Because the code uses native JavaScript modules (`import`/`export`), you can't just double-click `index.html` to open it. You'll need a quick local web server. 

If you have Python installed, open your terminal in the project folder and run:

```bash
python3 -m http.server 8000
```
Then just go to `http://localhost:8000` in your browser.

> **Windows users:** Sometimes Python's default server messes up the MIME types for `.js` files, which will break the app. If you get a blank screen, stop the server and run `python serve.py` instead (I included this script in the repo to fix that exact issue).

## What can it do?

*   **Window Management:** You can drag windows around, resize them from the edges, and snap them to the sides of the screen. I also added a Mission Control overview (hit `F3`) and Alt+Tab support.
*   **Finder & Files:** A working file explorer. It supports nested folders, grid/list views, and a desktop where you can drag a marquee box to select multiple icons (hit Delete to trash them).
*   **Text Editor:** You can actually write and save files. They are saved to your browser's `localStorage`, so they'll still be there when you refresh.
*   **Web Browser:** An iframe-based browser to surf the web inside the web. *(Note: lots of sites block iframes for security, so there's an "Open in new tab" fallback button).*
*   **Terminal:** A basic shell. Type `help` to see what you can do. You can use the up/down arrows for command history.
*   **The OS Experience:** Spotlight search (`Cmd/Ctrl+K`), a Control Center, a Notification Center, a Trash can, and a Settings app to change your wallpaper and toggle dark mode.
*   **Privacy:** Everything happens locally. There is no backend server, and your files/passwords never leave your browser.

## How it's built

I wanted to keep this project completely dependency-free on the tooling side. React and ReactDOM are just pulled in via CDN as UMD scripts in the HTML file. 

The state for the entire operating system is managed by one giant `useReducer` inside `src/state/reducer.js`. 

Here is how the code is organized:

```text
index.html          # The main entry point
main.css            # Imports the other CSS files
css/                # Split up logically (dock, windows, apps) 
src/
  main.js           # Mounts the React app
  App.js            # The root component (handles global keyboard shortcuts)
  lib/              # Utilities, virtual file system logic, wallpapers
  state/            # OS state and reducer
  components/       # The OS shell (menu bar, dock, desktop)
  apps/             # The actual programs (Finder, Terminal, etc.)
```

## Quirks & Limitations

*   **Iframe blocking:** As mentioned above, sites like Google or GitHub will refuse to load inside the WebOS browser because of `X-Frame-Options` headers. There's no way to bypass this from the client side.
*   **Battery icon:** The menu bar tries to use your device's actual Battery Status API. Firefox and Safari killed this API for privacy reasons. If you're using those browsers, the OS will just show a static, generic battery icon rather than making up a fake percentage. 
*   **Storage:** If you use strict browser privacy settings that wipe your data on exit, your WebOS files, settings, and local account won't survive a browser restart.

## AI Declaration

AI helped me to build the initial structure of the WebOs
