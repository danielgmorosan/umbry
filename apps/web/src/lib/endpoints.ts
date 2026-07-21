// Runtime-resolved service endpoints — the seam for the self-hosting toggle.
//
// The relay (channels, calls, AI, uploads) and — for advanced users — the Gossip
// DM protocol can be pointed at self-hosted URLs at RUNTIME, without a rebuild.
// Everything in the app reads its base URLs through here (via `relayBase.ts` and
// `sdk.ts`), so flipping to "run it yourself" is just `setOverrides(...)`.
//
// Resolution precedence (first non-empty wins):
//   1. runtime override   — set in Settings → Self-hosting (persisted in localStorage)
//   2. build-time VITE_*   — managed defaults baked at build time
//   3. same-origin / prod  — relay: "" (same host); gossip: api.usegossip.com
//
// Note: DMs are already end-to-end encrypted and decentralized (Gossip/Massa) —
// there is nothing of ours to self-host for them. The relay is what actually
// moves to your hardware, so that's the primary knob; the gossip URL is exposed
// as an advanced override only.

const LS_KEY = "umbry-endpoints";
const MODE_KEY = "umbry-host-mode";

/**
 * Which infrastructure the app is pointed at.
 *  - `managed`    — Umbry's hosted relay (the build-time defaults).
 *  - `selfhosted` — your own relay, local stack or remote.
 *
 * Stored separately from the URLs on purpose: flipping back to managed must not
 * erase the relay URL you configured, so switching modes is reversible in one
 * click instead of making you retype it.
 */
export type HostMode = "managed" | "selfhosted";

/** Default relay for the bundled local stack (services/selfhost). */
export const LOCAL_STACK_RELAY = "http://localhost:8788";

export function getMode(): HostMode {
  try {
    const explicit = localStorage.getItem(MODE_KEY);
    if (explicit !== null) return explicit === "selfhosted" ? "selfhosted" : "managed";
    // Pre-0.4.2 there was no mode — a saved relayBase WAS the opt-in. Without
    // this, upgrading would silently yank those users back onto the managed
    // relay while their configured URL sat there looking active.
    if (readOverrides().relayBase) {
      localStorage.setItem(MODE_KEY, "selfhosted");
      return "selfhosted";
    }
    return "managed";
  } catch {
    return "managed";
  }
}

export function setMode(mode: HostMode): void {
  try {
    if (mode === "selfhosted") localStorage.setItem(MODE_KEY, "selfhosted");
    else localStorage.removeItem(MODE_KEY);
  } catch {
    /* storage disabled — mode just won't persist */
  }
  emit();
}

export interface EndpointOverrides {
  /** Relay base URL, e.g. https://relay.acme.com. Empty string = same origin. */
  relayBase?: string;
  /** Gossip DM protocol base URL (advanced; rarely changed). */
  gossipApiUrl?: string;
}

// Managed defaults baked at build time. `relayBase` empty means "same origin"
// (local dev via the Vite proxy, or a same-origin deploy).
const BUILD_RELAY_BASE = (import.meta.env.VITE_RELAY_URL ?? "").replace(/\/+$/, "");
const BUILD_GOSSIP_API_URL = import.meta.env.VITE_GOSSIP_API_URL ?? "https://api.usegossip.com/api";

function readOverrides(): EndpointOverrides {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as EndpointOverrides;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

// ── pub/sub so React (and the SDK) can react to endpoint changes ──────────────
const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** The current overrides (only the keys the user has explicitly set). */
export function getOverrides(): EndpointOverrides {
  return readOverrides();
}

/** Merge and persist overrides. Pass `""`/undefined to a key to leave managed. */
export function setOverrides(partial: EndpointOverrides): void {
  const next: EndpointOverrides = { ...readOverrides() };
  for (const [k, v] of Object.entries(partial) as [keyof EndpointOverrides, string | undefined][]) {
    const cleaned = (v ?? "").trim().replace(/\/+$/, "");
    if (cleaned) next[k] = cleaned;
    else delete next[k];
  }
  try {
    if (Object.keys(next).length) localStorage.setItem(LS_KEY, JSON.stringify(next));
    else localStorage.removeItem(LS_KEY);
  } catch {
    /* storage disabled — overrides just won't persist */
  }
  emit();
}

/** Drop all overrides and return to the managed defaults. */
export function clearOverrides(): void {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

/** True when the app is pointed away from the managed defaults. */
export function isCustom(): boolean {
  return getMode() === "selfhosted";
}

/**
 * Resolved relay base URL (already trailing-slash-trimmed). "" = same origin.
 * Overrides only apply in self-hosted mode, so the switch is authoritative.
 */
export function getRelayBase(): string {
  if (getMode() === "managed") return BUILD_RELAY_BASE.replace(/\/+$/, "");
  const o = readOverrides();
  return (o.relayBase || LOCAL_STACK_RELAY).replace(/\/+$/, "");
}

/** Resolved Gossip DM protocol base URL. */
export function getGossipApiUrl(): string {
  if (getMode() === "managed") return BUILD_GOSSIP_API_URL;
  const o = readOverrides();
  return o.gossipApiUrl || BUILD_GOSSIP_API_URL;
}

/**
 * Stable per-relay suffix for localStorage keys.
 *
 * Relay-scoped state (the workspace list, most obviously) is meaningless on a
 * different relay: carrying it across a switch shows workspaces that don't
 * resolve. Keying by relay keeps each relay's state separate, and switching
 * back restores it intact.
 */
export function relayKey(): string {
  const base = getRelayBase();
  return base ? base.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9._-]/g, "_") : "same-origin";
}

/** Managed defaults, for display in the settings panel. */
export const defaults = {
  relayBase: BUILD_RELAY_BASE,
  gossipApiUrl: BUILD_GOSSIP_API_URL,
};
