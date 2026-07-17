# OpenClaw gateway (sidecar)

Self-hosted AI assistant gateway for Umbry. The frontend talks to it **only** through
`@umbry/openclaw-bridge` — model API keys live here, never in the web bundle.

## Responsibilities
- Expose `/health`, `/jobs`, `/jobs/stream` (see `@umbry/openclaw-bridge` for the typed contract).
- Authenticate the requesting member and **enforce channel scope** server-side (defense in depth —
  the client also scopes, but the gateway must re-check). **Never read DMs.**
- Route reasoning per `routing` in `openclaw.config.json`:
  - `default → ollama` (local, native API at `:11434`)
  - `complex → anthropic` (opt-in, key from `ANTHROPIC_API_KEY`)
  - privacy-sensitive jobs (recap/notes) pinned to local when `pinPrivacySensitiveToLocal`.
- Run the **gossip channel plugin** so the bot (its own Gossip identity, added to channels
  explicitly) can read/write channel content. Model this on `massalabs/openclaw-gossip-plugin`.

## Env (not committed)
```
ANTHROPIC_API_KEY=sk-ant-...
OPENCLAW_BOT_HANDLE=gossip-openclaw-bot-...
```

## Status
Config + contract scaffolded (Phase 4 target). Gateway process not yet implemented.
