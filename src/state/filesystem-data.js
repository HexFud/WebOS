// The starting desktop content: default shortcuts, the "Projects" folder and its files, laid out on a grid.
import { gridPosition } from '../lib/utils.js';

export const BASE_ITEMS = [
  { id: 'shortcut-explorer', type: 'shortcut', name: 'File Explorer', appKey: 'explorer', icon: 'folder', showOnDesktop: true },
  { id: 'shortcut-notes', type: 'shortcut', name: 'Text Editor', appKey: 'notes', icon: 'notes', showOnDesktop: true },
  { id: 'shortcut-browser', type: 'shortcut', name: 'Browser', appKey: 'browser', icon: 'browser', showOnDesktop: true },
  { id: 'shortcut-settings', type: 'shortcut', name: 'Settings', appKey: 'settings', icon: 'settings', showOnDesktop: true },
  { id: 'shortcut-calc', type: 'shortcut', name: 'Calculator', appKey: 'calc', icon: 'calc', showOnDesktop: true },
  { id: 'shortcut-terminal', type: 'shortcut', name: 'Terminal', appKey: 'terminal', icon: 'terminal', showOnDesktop: true },
  {
    id: 'folder-projects',
    type: 'folder',
    name: 'Projects',
    icon: 'folder',
    showOnDesktop: true,
    children: [
      { id: 'file-roadmap', type: 'file', name: 'Roadmap.txt', icon: 'file', content: 'Q3 roadmap\n- Finish WebOS shell\n- Polish apps\n- Add theming and shortcuts' },
      { id: 'file-launch', type: 'file', name: 'Launch notes.txt', icon: 'file', content: 'WebOS launch notes\nDesign: glassmorphism\nBehavior: in-memory only' }
    ]
  },
  { id: 'file-welcome', type: 'file', name: 'Welcome.txt', icon: 'file', showOnDesktop: true, content: 'This desktop is entirely simulated in React and keeps every state change in memory.' }
];

export const initialChildren = BASE_ITEMS.map((item, index) => ({ ...item, ...gridPosition(index) }));
