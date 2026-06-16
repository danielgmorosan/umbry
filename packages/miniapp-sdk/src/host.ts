import {
  PROTOCOL_VERSION,
  isMiniAppRequest,
  type Capability,
  type ChannelContext,
  type HostIdentity,
  type MiniAppRequest,
} from "./protocol";

export interface HostBridgeOptions {
  iframe: HTMLIFrameElement;
  origin: string; // expected origin of the mini-app
  identity: HostIdentity;
  context: ChannelContext;
  granted: Capability[];
  handlers: {
    shareToChannel?: (body: string, attachments?: string[]) => Promise<void> | void;
    notify?: (title: string, body?: string) => Promise<void> | void;
  };
}

/** Creates the host side of the bridge for a single sandboxed mini-app iframe. */
export function createHostBridge(opts: HostBridgeOptions) {
  const { iframe, origin, identity, context, granted, handlers } = opts;

  const send = (msg: object) => iframe.contentWindow?.postMessage(msg, origin);

  const can = (cap: Capability) => granted.includes(cap);

  const onMessage = async (e: MessageEvent) => {
    if (e.origin !== origin || e.source !== iframe.contentWindow) return;
    if (!isMiniAppRequest(e.data)) return;
    const req = e.data as MiniAppRequest;

    const reply = (ok: boolean, payload: unknown) =>
      send(
        ok
          ? { v: PROTOCOL_VERSION, type: "host:response", id: req.id, ok: true, result: payload }
          : { v: PROTOCOL_VERSION, type: "host:response", id: req.id, ok: false, error: String(payload) },
      );

    try {
      switch (req.type) {
        case "app:ready":
          send({ v: PROTOCOL_VERSION, type: "host:init", identity, context, granted });
          return;
        case "app:shareToChannel":
          if (!can("channel.post")) return reply(false, "capability not granted: channel.post");
          await handlers.shareToChannel?.(req.body, req.attachments);
          return reply(true, null);
        case "app:notify":
          if (!can("notifications.send")) return reply(false, "capability not granted: notifications.send");
          await handlers.notify?.(req.title, req.body);
          return reply(true, null);
      }
    } catch (err) {
      reply(false, err instanceof Error ? err.message : "error");
    }
  };

  window.addEventListener("message", onMessage);

  return {
    /** Push a new channel context to the mini-app (e.g. user switched channels). */
    updateContext(next: ChannelContext) {
      send({ v: PROTOCOL_VERSION, type: "host:context", context: next });
    },
    destroy() {
      window.removeEventListener("message", onMessage);
    },
  };
}
