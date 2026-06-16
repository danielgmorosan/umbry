/**
 * Host <-> mini-app postMessage contract. Mini-apps load in a sandboxed iframe and are
 * treated as untrusted: least-privilege, explicit capability grants only.
 */

export const PROTOCOL_VERSION = 1 as const;

/** Capabilities a mini-app may be granted, per workspace. */
export type Capability =
  | "identity.read" // pseudonymous handle + display name (never the passphrase)
  | "channel.context" // current channel id + name
  | "channel.post" // "share to channel"
  | "notifications.send";

export interface MiniAppManifest {
  id: string;
  name: string;
  entryUrl: string;
  capabilities: Capability[];
}

/** Identity handed to a mini-app. Never includes secrets or DM access. */
export interface HostIdentity {
  handle: string;
  displayName: string;
}

export interface ChannelContext {
  channelId: string;
  channelName: string;
}

/* ---- Messages: Host -> MiniApp ---- */
export type HostMessage =
  | { v: typeof PROTOCOL_VERSION; type: "host:init"; identity: HostIdentity; context: ChannelContext; granted: Capability[] }
  | { v: typeof PROTOCOL_VERSION; type: "host:context"; context: ChannelContext }
  | { v: typeof PROTOCOL_VERSION; type: "host:response"; id: string; ok: true; result: unknown }
  | { v: typeof PROTOCOL_VERSION; type: "host:response"; id: string; ok: false; error: string };

/* ---- Messages: MiniApp -> Host (RPC requests) ---- */
export type MiniAppRequest =
  | { v: typeof PROTOCOL_VERSION; type: "app:ready"; id: string }
  | { v: typeof PROTOCOL_VERSION; type: "app:shareToChannel"; id: string; body: string; attachments?: string[] }
  | { v: typeof PROTOCOL_VERSION; type: "app:notify"; id: string; title: string; body?: string };

export type MiniAppMessage = HostMessage | MiniAppRequest;

export function isMiniAppRequest(m: unknown): m is MiniAppRequest {
  return (
    typeof m === "object" &&
    m !== null &&
    (m as { v?: number }).v === PROTOCOL_VERSION &&
    typeof (m as { type?: string }).type === "string" &&
    (m as { type: string }).type.startsWith("app:")
  );
}

export function isHostMessage(m: unknown): m is HostMessage {
  return (
    typeof m === "object" &&
    m !== null &&
    (m as { v?: number }).v === PROTOCOL_VERSION &&
    typeof (m as { type?: string }).type === "string" &&
    (m as { type: string }).type.startsWith("host:")
  );
}
