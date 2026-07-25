import { h, useEffect, useRef, useState } from "../lib/dom.js";

import { APPS } from "../lib/apps-registry.js";

import { WALLPAPERS, resolveWallpaper } from "../lib/wallpapers.js";

import { evaluateExpression, uptime } from "../lib/utils.js";

const HELP_TEXT = [ "Comandi disponibili:", "  help                mostra questo elenco", "  ls                  elenca gli elementi sul desktop", "  pwd                  mostra la cartella corrente", "  echo <testo>         ripete il testo", "  whoami               mostra l'utente collegato", "  sysinfo               riepilogo del sistema (tema, sfondo, uptime)", "  open <app>            apre un'app (explorer, notes, browser, settings, calc, trash)", "  theme <light|dark>    cambia il tema", "  wallpaper <nome>       cambia lo sfondo", "  calc <espressione>     valuta un'espressione matematica", "  history               mostra i comandi digitati in questa sessione", "  clear                 pulisce lo schermo", "", "Suggerimento: usa le frecce ↑ ↓ per richiamare i comandi precedenti." ].join("\n");

export function TerminalApp({payload: payload, userName: userName, theme: theme, wallpaper: wallpaper, customWallpaper: customWallpaper, sessionStartedAt: sessionStartedAt, onUpdate: onUpdate, openApp: openApp, showToast: showToast, onTheme: onTheme, onWallpaper: onWallpaper}) {
  const prompt = `${(userName || "guest").toLowerCase().replace(/\s+/g, "")}@WebOS`;
  const inputRef = useRef(null);
  const [historyIndex, setHistoryIndex] = useState(null);
  const commandHistory = payload.commandHistory || [];
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  function execute(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const commandLine = `${prompt}$ ${trimmed}`;
    const lines = [ ...payload.lines, {
      type: "command",
      text: commandLine
    } ];
    const nextHistory = [ ...commandHistory, trimmed ].slice(-50);
    setHistoryIndex(null);
    const [command, ...rest] = trimmed.split(/\s+/);
    const args = rest.join(" ");
    let next = lines;
    switch (command.toLowerCase()) {
     case "help":
      next = [ ...lines, {
        type: "output",
        text: HELP_TEXT
      } ];
      break;

     case "ls":
      next = [ ...lines, {
        type: "output",
        text: [ "Documents", "Projects", "Welcome.txt", "Terminal" ].join("    ")
      } ];
      break;

     case "clear":
      onUpdate({
        lines: [],
        input: "",
        commandHistory: nextHistory
      });
      return;

     case "date":
      next = [ ...lines, {
        type: "output",
        text: (new Date).toString()
      } ];
      break;

     case "whoami":
      next = [ ...lines, {
        type: "output",
        text: userName || "guest"
      } ];
      break;

     case "pwd":
      next = [ ...lines, {
        type: "output",
        text: "/desktop"
      } ];
      break;

     case "echo":
      next = [ ...lines, {
        type: "output",
        text: args || ""
      } ];
      break;

     case "history":
      next = [ ...lines, {
        type: "output",
        text: nextHistory.length ? nextHistory.map((cmd, index) => `  ${index + 1}  ${cmd}`).join("\n") : "Nessun comando ancora digitato."
      } ];
      break;

     case "sysinfo":
      next = [ ...lines, {
        type: "output",
        text: [ `WebOS · sessione di ${userName || "guest"}`, `Tema: ${theme}`, `Sfondo: ${resolveWallpaper(wallpaper, customWallpaper).label}`, `Finestre nel terminale: ancora una in meno se chiudi questa`, `Uptime: ${uptime(sessionStartedAt)}` ].join("\n")
      } ];
      break;

     case "open":
      {
        if (APPS[args.toLowerCase()]) {
          openApp(args.toLowerCase());
          next = [ ...lines, {
            type: "output",
            text: `Opened ${APPS[args.toLowerCase()].title}.`
          } ];
        } else next = [ ...lines, {
          type: "error",
          text: `Unknown app: ${args}`
        } ];
        break;
      }

     case "theme":
      {
        const nextTheme = args.toLowerCase();
        if (nextTheme === "dark" || nextTheme === "light") {
          onTheme(nextTheme);
          next = [ ...lines, {
            type: "output",
            text: `Theme set to ${nextTheme}.`
          } ];
        } else next = [ ...lines, {
          type: "error",
          text: "Usage: theme light|dark"
        } ];
        break;
      }

     case "wallpaper":
      {
        const nextWallpaper = args.toLowerCase();
        if (WALLPAPERS[nextWallpaper]) {
          onWallpaper(nextWallpaper);
          next = [ ...lines, {
            type: "output",
            text: `Wallpaper set to ${WALLPAPERS[nextWallpaper].label}.`
          } ];
        } else next = [ ...lines, {
          type: "error",
          text: `Unknown wallpaper: ${args}`
        } ];
        break;
      }

     case "calc":
      next = [ ...lines, {
        type: "output",
        text: evaluateExpression(args)
      } ];
      break;

     default:
      next = [ ...lines, {
        type: "error",
        text: `Command not found: ${command}. Digita "help" per l'elenco dei comandi.`
      } ];
    }
    onUpdate({
      ...payload,
      lines: next,
      input: "",
      commandHistory: nextHistory
    });
  }
  function onInputKeyDown(event) {
    if (event.key === "ArrowUp") {
      if (!commandHistory.length) return;
      event.preventDefault();
      const nextIndex = historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      onUpdate({
        ...payload,
        input: commandHistory[nextIndex]
      });
    }
    if (event.key === "ArrowDown") {
      if (historyIndex === null) return;
      event.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(null);
        onUpdate({
          ...payload,
          input: ""
        });
      } else {
        setHistoryIndex(nextIndex);
        onUpdate({
          ...payload,
          input: commandHistory[nextIndex]
        });
      }
    }
  }
  return h("div", {
    className: "terminal-app"
  }, h("div", {
    className: "terminal-output"
  }, payload.lines.map((line, index) => h("div", {
    key: index,
    className: `terminal-line terminal-line--${line.type}`
  }, line.text))), h("form", {
    className: "terminal-input-row",
    onSubmit: event => {
      event.preventDefault();
      execute(payload.input);
    }
  }, h("span", {
    className: "terminal-prompt"
  }, `${prompt}$`), h("input", {
    ref: inputRef,
    className: "terminal-input",
    value: payload.input,
    onChange: event => onUpdate({
      ...payload,
      input: event.target.value
    }),
    onKeyDown: onInputKeyDown,
    spellCheck: false,
    autoComplete: "off"
  })));
}
