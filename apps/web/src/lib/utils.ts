// Shared UI helpers live in @gossip/ui; re-exported here for convenience.
export { cn, colorForId, initials } from "@gossip/ui";

/** Shorten a pseudonymous Gossip handle: gossip34ng…l8dhuj */
export function truncateHandle(handle: string, head = 10, tail = 6): string {
  if (handle.length <= head + tail + 1) return handle;
  return `${handle.slice(0, head)}…${handle.slice(-tail)}`;
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
