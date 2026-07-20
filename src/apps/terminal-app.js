// Terminal app: a tiny command interpreter (help, ls, theme, wallpaper, calc, ...).
import { h, useEffect, useRef } from '../lib/dom.js';
import { APPS } from '../lib/apps-registry.js';
import { WALLPAPERS } from '../lib/wallpapers.js';
import { evaluateExpression } from '../lib/utils.js';

export function TerminalApp({ payload, userName, onUpdate, openApp, showToast, onTheme, onWallpaper }) {
  const prompt = `${(userName || 'guest').toLowerCase().replace(/\s+/g, '')}@WebOS`;
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  function execute(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const commandLine = `${prompt}$ ${trimmed}`;
    const lines = [...payload.lines, { type: 'command', text: commandLine }];
    const [command, ...rest] = trimmed.split(/\s+/);
    const args = rest.join(' ');
    let next = lines;

    switch (command.toLowerCase()) {
      case 'help': next = [...lines, { type: 'output', text: 'help, ls, clear, date, whoami, pwd, echo, open, theme, wallpaper, calc' }]; break;
      case 'ls': next = [...lines, { type: 'output', text: ['Documents', 'Projects', 'Welcome.txt', 'Terminal'].join('    ') }]; break;
      case 'clear': onUpdate({ lines: [], input: '' }); return;
      case 'date': next = [...lines, { type: 'output', text: new Date().toString() }]; break;
      case 'whoami': next = [...lines, { type: 'output', text: userName || 'guest' }]; break;
      case 'pwd': next = [...lines, { type: 'output', text: '/desktop' }]; break;
      case 'echo': next = [...lines, { type: 'output', text: args || '' }]; break;
      case 'open': {
        if (APPS[args.toLowerCase()]) { openApp(args.toLowerCase()); next = [...lines, { type: 'output', text: `Opened ${APPS[args.toLowerCase()].title}.` }]; }
        else next = [...lines, { type: 'error', text: `Unknown app: ${args}` }];
        break;
      }
      case 'theme': {
        const nextTheme = args.toLowerCase();
        if (nextTheme === 'dark' || nextTheme === 'light') { onTheme(nextTheme); next = [...lines, { type: 'output', text: `Theme set to ${nextTheme}.` }]; }
        else next = [...lines, { type: 'error', text: 'Usage: theme light|dark' }];
        break;
      }
      case 'wallpaper': {
        const nextWallpaper = args.toLowerCase();
        if (WALLPAPERS[nextWallpaper]) { onWallpaper(nextWallpaper); next = [...lines, { type: 'output', text: `Wallpaper set to ${WALLPAPERS[nextWallpaper].label}.` }]; }
        else next = [...lines, { type: 'error', text: `Unknown wallpaper: ${args}` }];
        break;
      }
      case 'calc': next = [...lines, { type: 'output', text: evaluateExpression(args) }]; break;
      default: next = [...lines, { type: 'error', text: `Command not found: ${command}` }];
    }

    onUpdate({ ...payload, lines: next, input: '' });
  }

  return h('div', { className: 'terminal-app' }, h('div', { className: 'terminal-output' }, payload.lines.map((line, index) => h('div', { key: index, className: `terminal-line terminal-line--${line.type}` }, line.text))), h('form', { className: 'terminal-input-row', onSubmit: (event) => { event.preventDefault(); execute(payload.input); } }, h('span', { className: 'terminal-prompt' }, `${prompt}$`), h('input', { ref: inputRef, className: 'terminal-input', value: payload.input, onChange: (event) => onUpdate({ ...payload, input: event.target.value }), spellCheck: false, autoComplete: 'off' })));
}
