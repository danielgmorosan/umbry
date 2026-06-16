# Message-transfer relay (optional, enterprise)

`VITE_GOSSIP_API_URL` defaults to `https://api.usegossip.com`. Enterprise customers can point a
workspace at a **self-hosted** relay here so the org controls message transport and the channel
store.

**Important:** E2E for DMs is unaffected by where the relay lives — DMs ride the `gossip-sdk` E2E
channel verbatim. The relay only carries **channel** transport (the "workspace-confidential",
non-E2E v1 channels) and acts as the channel store/fan-out.

## Status
Placeholder (Phase 8 target). For now the app ships against `api.usegossip.com`; the relay URL is a
per-workspace setting so this can drop in later without client changes.
