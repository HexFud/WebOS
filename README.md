## WebOA

This is my first project regarding a WebOS, I built a macOS-inspired desktop environment that runs entirely in the browser. 

## How to run it

Because the code uses native JavaScript modules (`import`/`export`), you cant just open index.html so you need to do one of the following things:

If you have Python installed, open your terminal in the project folder and run:

```bash
python3 -m http.server 8000
```
Then just go to `http://localhost:8000` in your browser.

On Windows sometimes Python won't start the server and you will get a blank screen If so stop the server and run `python3 serve.py`

If you want just to see my WebOs you can just visit the GitHub pages site `https://hexfud.github.io/WebOS/`

## What can it do?

*   **Window Management:** You can drag windows around, resize them from the edges, and snap them to the sides of the screen.
*   **Finder & Files:** A working file explorer.
*   **Text Editor:** You can actually write and save files. They are saved to your browser's `localStorage`, so they'll still be there when you refresh.
*   **Web Browser:** Just a browser to load real sites. *(Note: lots of sites block iframes for security, so there's an "Open in new tab" fallback button).*
*   **Terminal:** A basic shell. Type `help` to see what you can do. You can use the up/down arrows for command history.
*   And many more!

## HOW THIS WAS MADE

The goal was to keep this project completely dependency-free on the tooling side. React and ReactDOM are just pulled in via CDN as UMD scripts directly in the index.html file. Everything else is native JavaScript and vanilla CSS.
For state management, the entire operating system relies on one massive useReducer inside src/state/reducer.js.

## Quirks & Limitations

*   **Iframe blocking:** As mentioned above, sites like Google or GitHub will refuse to load inside the WebOS browser because of `X-Frame-Options` headers. There's no way to bypass this from the client side.
*   **Battery icon:** The menu bar tries to use your device's actual Battery Status API. Firefox and Safari killed this API for privacy reasons. If you're using those browsers, the OS will just show a static, generic battery icon rather than making up a fake percentage. 
*   **Storage:** If you use strict browser privacy settings that wipe your data on exit, your WebOS files, settings, and local account won't survive a browser restart.

## AI Declaration

AI helped me to build the initial structure of the WebOs
