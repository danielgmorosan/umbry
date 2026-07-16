/**
 * Preload — the ONLY bridge between the hardened renderer and the main process.
 *
 * D1: exposes a tiny, read-only marker so the web app can feature-detect that
 * it's running inside the desktop shell (needed for the D3 self-hosting toggle,
 * which is desktop-only). No generic ipcRenderer is exposed; when D3 adds
 * local-services control it will go through a narrow, explicitly-typed channel.
 */
import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("gossipDesktop", {
  isDesktop: true,
  platform: process.platform,
  electron: process.versions.electron,
});
