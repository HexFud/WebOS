Hey everyone! This is my first attempt at building a full-blown desktop environment inside a browser. I've always been fascinated by how operating systems manage windows and state, so I decided to build a "simulated" OS using **React** and **Vite**.

I'm super excited to share this as my first upload to **HackClub**! 

## What's inside?

I tried to pack in as many features as possible:
*   **Window Manager:** You can drag, minimize, maximize, and stack windows. It uses a custom Z-index management system.
*   **Terminal:** Type `help` to see what it can do. It’s got some basic commands like `ls`, `whoami`, and even a theme switcher.
*   **Apps:** A text editor (Notes), a working Calculator, a File Explorer, and a "simulated" Browser.
*   **Persistence:** It uses `localStorage` for your account setup, so it remembers you when you come back.
*   **Eye Candy:** A fresh UI, dynamic wallpapers, and a light/dark mode.

## What i have used

I wanted to keep this as "vanilla" as possible in terms of logic:
- **React 18:** All the state (windows, files, auth) is handled by one giant `useReducer`. It was a great way to learn complex state management.
- **CSS:** No UI libraries here. Everything is custom CSS (lots of `backdrop-filter` and CSS variables).
- **Vite:** Because life is too short for slow build times.

## Getting Started

If you want to run this locally and mess around with the code:

1.  **Clone it:**
    ```bash
    git clone https://github.com/HexFud/WebOS.git
    ```
2. Execute the ```index.html``` file

If you want to run this in the browser just copy this URL https://hexfud.github.io/WebOS/

## Please note

*   **In-Memory Only:** The "files" you create only live in the React state for now. If you refresh, the filesystem resets (except for your account). 
*   **Responsive-ish:** It works best on desktop, mobile devices probably will be supported in the future.

## P.S

I'm still learning, so if you find a bug or have an idea on how to make the window dragging smoother, please open an issue or reach out! 
