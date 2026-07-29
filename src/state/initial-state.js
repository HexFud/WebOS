import { NOTE_TEXT } from "../lib/constants.js";

import { WALLPAPERS } from "../lib/wallpapers.js";

import { loadStoredAccount, loadStoredWorkspace, isValidStoredFilesystem } from "../lib/storage.js";

import { initialChildren } from "./filesystem-data.js";

const STORED_ACCOUNT = loadStoredAccount();

const STORED_WORKSPACE = loadStoredWorkspace();

function initialFilesystem() {
  const stored = STORED_WORKSPACE?.filesystem;
  if (!isValidStoredFilesystem(stored)) return { id: "root", type: "folder", name: "Desktop", children: initialChildren };
  const missingApps = initialChildren.filter(item => item.type === "shortcut" && ["paint", "clock", "calendar", "media"].includes(item.appKey) && !stored.children.some(child => child.appKey === item.appKey));
  return missingApps.length ? { ...stored, children: [ ...stored.children, ...missingApps ] } : stored;
}

export const INITIAL_STATE = {
  phase: "boot",
  bootProgress: 0,
  unlocking: false,
  account: STORED_ACCOUNT,
  setupName: "",
  setupPassword: "",
  setupPasswordConfirm: "",
  setupError: null,
  loginPassword: "",
  loginError: null,
  authShake: false,
  theme: STORED_WORKSPACE?.theme === "light" ? "light" : "dark",
  language: STORED_WORKSPACE?.language === "it" ? "it" : "en",
  wallpaper: STORED_WORKSPACE?.wallpaper === "custom" && typeof STORED_WORKSPACE?.customWallpaper === "string" ? "custom" : STORED_WORKSPACE?.wallpaper && WALLPAPERS[STORED_WORKSPACE.wallpaper] ? STORED_WORKSPACE.wallpaper : "aurora",
  customWallpaper: typeof STORED_WORKSPACE?.customWallpaper === "string" ? STORED_WORKSPACE.customWallpaper : null,
  spotlightOpen: false,
  notificationCenterOpen: false,
  controlCenterOpen: false,
  appleMenuOpen: false,
  doNotDisturb: false,
  notifications: [],
  trash: Array.isArray(STORED_WORKSPACE?.trash) ? STORED_WORKSPACE.trash : [],
  contextMenu: null,
  selectedDesktopItemIds: [],
  missionControlOpen: false,
  activeWindowId: null,
  windowZ: 20,
  windows: [],
  toasts: [],
  snapPreview: null,
  filesystem: initialFilesystem(),
  notesText: typeof STORED_WORKSPACE?.notesText === "string" ? STORED_WORKSPACE.notesText : NOTE_TEXT,
  stickyNotes: Array.isArray(STORED_WORKSPACE?.stickyNotes) ? STORED_WORKSPACE.stickyNotes.filter(note => note && typeof note.id === "string") : [],
  clock: new Date,
  sessionStartedAt: Date.now()
};
