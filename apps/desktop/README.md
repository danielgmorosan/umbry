# @umbry/desktop

Electron desktop shell for Umbry. **D1:** loads the existing web app in a
hardened window. Later phases add the self-hosting toggle (D3) and signed
installers (CI matrix).

## Run

```bash
pnpm --filter @umbry/desktop build     # compile main + preload -> dist/
pnpm --filter @umbry/desktop start     # launch Electron
# or, one shot:
pnpm --filter @umbry/desktop dev
```

By default it loads the deployed web app (`https://umbry.chat`),
whose origin the relay already allowlists. To run against a local dev server:

```bash
# terminal 1: the web app
pnpm --filter @umbry/web dev
# terminal 2: the shell pointed at it
UMBRY_DESKTOP_URL=http://localhost:5173 pnpm --filter @umbry/desktop dev
```

## Security

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` — the
  renderer never gets Node.
- The preload exposes only a read-only `window.umbryDesktop` marker (no generic
  `ipcRenderer`).
- Navigation is pinned to the app origin; external links / `window.open` open in
  the system browser.

## Not yet (roadmap)

- **D3:** bundle a local web build + a `LocalServices` supervisor (spawn/manage
  Ollama, `livekit-server`, and the relay) + a strict renderer CSP for the
  bundled content, and a Settings → Self-hosting toggle.
- **Installers:** `electron-builder` + a GitHub Actions matrix (mac/linux/win),
  signed + notarized.
