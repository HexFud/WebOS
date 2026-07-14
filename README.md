# WebOS

A desktop operating system, simulated entirely in the browser — boot screen, account setup, a window manager with draggable/resizable windows, a taskbar, and a handful of built-in apps. No backend, no build step: just React and plain JS/CSS.

> My first web OS, built for HackClub! 🚀

## ✨ Features

**Boot & accounts**
- Animated boot sequence on load
- First visit → guided setup screen to choose a display name and password
- Returning visits → password-protected login screen (checked against the account you created)
- Wrong-password / invalid-setup feedback with an inline error and a shake animation
- "Log out & reset account" from Settings to start over

**Desktop**
- Draggable desktop icons and a right-click context menu
- 4 built-in wallpapers, dark/light theme toggle
- Toast notifications

**Window manager**
- Drag, resize, minimize, maximize/restore — each with its own animation
- Edge snapping when dragging windows to the sides of the screen
- `Alt` + `Tab` to cycle open windows, `Esc` to close menus/the active window

**Built-in apps**
| App | Description |
|---|---|
| 🗂️ File Explorer | Browse a simulated file/folder structure |
| 📝 Text Editor | A simple notes app |
| 🌐 Browser | A simulated browser with a few static pages |
| ⚙️ Settings | Theme, wallpaper, account info, log out |
| 🧮 Calculator | A working calculator |
| 💻 Terminal | `help`, `ls`, `clear`, `date`, `whoami`, `pwd`, `echo`, `open`, `theme`, `wallpaper`, `calc` |

## 🛠️ Tech stack

- [React 18](https://react.dev/) loaded straight from a CDN (UMD build) — no bundler, no JSX, no build step
- Plain JavaScript (`React.createElement` via a small `h()` helper) and plain CSS
- A single `index.html` entry point

## 🚀 Getting started

Dowload the repo or paste `https://hexfud.github.io/WebOS/` into the browser

## 📁 Project structure

```
.
├── index.html    # entry point, loads React + app.js
├── app.js        # the entire app: state, reducer, components
├── style.css     # all styling and animations
├── README.md
└── .gitignore
```

## 🔒 Data & privacy

- Your account (display name + password) is saved with `localStorage`, on your device only — nothing is sent anywhere.
- Everything else (open windows, notes, terminal history, filesystem changes) lives only in memory and resets on reload.
