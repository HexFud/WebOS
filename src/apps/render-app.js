import { h } from "../lib/dom.js";

import { findNodeById } from "../lib/utils.js";

import { clearStoredAccount, clearStoredWorkspace } from "../lib/storage.js";

import { TrashApp } from "./trash-app.js";

import { NotesApp } from "./notes-app.js";

import { BrowserApp } from "./browser-app.js";

import { SettingsApp } from "./settings-app.js";

import { CalculatorApp } from "./calculator-app.js";

import { TerminalApp } from "./terminal-app.js";

import { ExplorerApp } from "./explorer-app.js";

export function renderApp(windowItem, state, dispatch, openApp, showToast, openDesktopItem) {
  const payload = windowItem.payload || {};
  switch (windowItem.appKey) {
   case "notes":
    return h(NotesApp, {
      value: payload.text || "",
      fileName: payload.fileId ? findNodeById(state.filesystem, payload.fileId)?.name || "Note.txt" : "Note.txt",
      onChange: value => dispatch({
        type: "EDIT_NOTES",
        id: windowItem.id,
        fileId: payload.fileId || null,
        value: value
      })
    });

   case "browser":
    return h(BrowserApp, {
      payload: payload,
      onUpdate: nextPayload => dispatch({
        type: "UPDATE_WINDOW_PAYLOAD",
        id: windowItem.id,
        payload: nextPayload
      }),
      showToast: showToast
    });

   case "settings":
    return h(SettingsApp, {
      state: state,
      onTheme: value => dispatch({
        type: "SET_THEME",
        value: value
      }),
      onWallpaper: value => dispatch({
        type: "SET_WALLPAPER",
        value: value
      }),
      onCustomWallpaper: value => dispatch({
        type: "SET_CUSTOM_WALLPAPER",
        value: value
      }),
      onLogout: () => {
        clearStoredAccount();
        clearStoredWorkspace();
        dispatch({
          type: "RESET_ACCOUNT"
        });
        showToast("Signed out", "Set up a new account to continue.");
      },
      showToast: showToast
    });

   case "calc":
    return h(CalculatorApp, {
      payload: payload,
      onUpdate: nextPayload => dispatch({
        type: "UPDATE_WINDOW_PAYLOAD",
        id: windowItem.id,
        payload: nextPayload
      })
    });

   case "terminal":
    return h(TerminalApp, {
      payload: payload,
      userName: state.account?.userName || "guest",
      theme: state.theme,
      wallpaper: state.wallpaper,
      customWallpaper: state.customWallpaper,
      sessionStartedAt: state.sessionStartedAt,
      onUpdate: nextPayload => dispatch({
        type: "UPDATE_WINDOW_PAYLOAD",
        id: windowItem.id,
        payload: nextPayload
      }),
      openApp: openApp,
      showToast: showToast,
      onTheme: value => dispatch({
        type: "SET_THEME",
        value: value
      }),
      onWallpaper: value => dispatch({
        type: "SET_WALLPAPER",
        value: value
      })
    });

   case "trash":
    return h(TrashApp, {
      trash: state.trash,
      onRestore: id => dispatch({
        type: "RESTORE_TRASH_ITEM",
        id: id
      }),
      onEmpty: () => {
        const count = state.trash.length;
        dispatch({
          type: "EMPTY_TRASH"
        });
        showToast("Trash emptied", `${count} item${count === 1 ? "" : "s"} deleted for good.`);
      }
    });

   default:
    return h(ExplorerApp, {
      payload: payload,
      filesystem: state.filesystem,
      onUpdate: nextPayload => dispatch({
        type: "UPDATE_WINDOW_PAYLOAD",
        id: windowItem.id,
        payload: nextPayload
      }),
      onMoveNode: (nodeId, targetFolderId) => dispatch({
        type: "MOVE_NODE",
        nodeId: nodeId,
        targetFolderId: targetFolderId
      }),
      openApp: openApp,
      openDesktopItem: openDesktopItem,
      showToast: showToast
    });
  }
}
