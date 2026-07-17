/**
 * Umbry desktop — Electron main process.
 *
 * D1: a hardened shell that loads the existing web app in a BrowserWindow.
 * By default it points at the deployed web app (whose origin the relay already
 * allowlists); set UMBRY_DESKTOP_URL to run against a local dev server
 * (http://localhost:5173) or, later, a bundled local build.
 *
 * Security posture (see also preload.ts):
 * - contextIsolation on, nodeIntegration off, sandbox on — the renderer never
 *   touches Node.
 * - Navigation is pinned to the app origin; everything else (external links,
 *   window.open) opens in the system browser instead of an in-app window.
 * We deliberately do NOT inject a CSP here: the renderer is our own trusted
 * origin and ships its own headers, and the app legitimately connects to the
 * relay / LiveKit / Massa. A strict CSP belongs with the bundled local build
 * (D3), where we control the content.
 */
import { app, BrowserWindow, shell } from "electron";
import * as path from "node:path";

const APP_URL = process.env.UMBRY_DESKTOP_URL ?? "https://umbry.chat";

function appOrigin(): string | null {
  try {
    return new URL(APP_URL).origin;
  } catch {
    return null;
  }
}

// Single-instance: focus the existing window instead of opening a second one.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let win: BrowserWindow | null = null;

  const createWindow = () => {
    win = new BrowserWindow({
      width: 1280,
      height: 860,
      minWidth: 900,
      minHeight: 600,
      backgroundColor: "#0b0b0f",
      title: "Umbry",
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
      },
    });

    win.once("ready-to-show", () => win?.show());
    win.webContents.on("did-fail-load", (_e, code, desc, url) => {
      console.error(`[desktop] failed to load ${url}: ${desc} (${code})`);
    });

    void win.loadURL(APP_URL);
    win.on("closed", () => {
      win = null;
    });
  };

  // Keep the app inside its own origin; open anything else in the real browser.
  app.on("web-contents-created", (_e, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (/^https?:/.test(url)) void shell.openExternal(url);
      return { action: "deny" };
    });
    contents.on("will-navigate", (event, url) => {
      const origin = appOrigin();
      let target: string | null = null;
      try {
        target = new URL(url).origin;
      } catch {
        /* invalid url */
      }
      if (origin && target !== origin) {
        event.preventDefault();
        if (/^https?:/.test(url)) void shell.openExternal(url);
      }
    });
  });

  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
