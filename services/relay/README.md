# Message-transfer relay (optional, enterprise)

`VITE_GOSSIP_API_URL` defaults to `https://api.usegossip.com`. Enterprise customers can point a
workspace at a **self-hosted** relay here so the org controls message transport and the channel
store.

**Important:** E2EE for DMs is unaffected by where the relay lives — DMs ride the `gossip-sdk` E2EE
channel verbatim. The relay only carries **channel** transport (the "workspace-confidential",
non-E2EE v1 channels), LiveKit call tokens, and OpenClaw AI jobs.

## Deploy (Fly.io)

The web app (`apps/web`) deploys to Vercel as a static SPA; this service deploys separately to
Fly.io so it can hold a persistent volume (chat history) and a long-lived process (WebSocket
fan-out, Ollama calls). See `fly.toml` for the app config.

```bash
cd services/relay
fly launch --no-deploy --copy-config     # first time only; pick a unique app name if taken
fly volumes create gossip_relay_data --size 1 --region iad
fly secrets set LIVEKIT_URL=... LIVEKIT_API_KEY=... LIVEKIT_API_SECRET=... CORS_ORIGIN=https://<vercel-domain>
fly deploy
```

Then set `VITE_RELAY_URL=https://<fly-app>.fly.dev` in the Vercel project's env vars so
`apps/web` points at the deployed relay instead of assuming same-origin (see
`apps/web/.env.example`).

`DATA_DIR` (set to `/data` in `fly.toml`/`Dockerfile`) points `.data.json` at the mounted volume so
workspace/channel history survives deploys and restarts. `CORS_ORIGIN` must be set once the web app
and relay are on different origins, otherwise the browser will block the cross-origin requests.

## Running it yourself

For self-hosting, use [`services/selfhost`](../selfhost) rather than this directory directly — it
brings the relay up alongside LiveKit and Ollama on one network, which is what makes calls and AI
work without further wiring. This directory is the relay source that stack builds from.

## Environment

| Var | Default | Notes |
|---|---|---|
| `LIVEKIT_URL` | — | **Client-facing** address, handed to browsers via `/livekit-config`. |
| `LIVEKIT_SERVER_URL` | `LIVEKIT_URL` | Address the relay itself uses for the RoomService admin API. Differs from the above inside a container network (`http://livekit:7880`). |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Resolved **from the relay process** — a hosted relay cannot reach a model on a user's laptop. |
| `AI_MODEL` | `qwen2.5:14b` | Pulled in-app via `POST /openclaw/pull`. |
| `CORS_ORIGIN` | `*` | Pin to real origins to lock HTTP **and** WebSocket upgrades. |

## Status
Actively used (workspaces, channels, LiveKit tokens, OpenClaw AI). The relay URL is chosen at
**runtime** by the client (Settings → Self-hosting), with `VITE_RELAY_URL` only supplying the
managed default — see `apps/web/src/lib/endpoints.ts`.
