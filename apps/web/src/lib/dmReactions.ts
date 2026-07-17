/**
 * DM emoji reactions (T4). There is no server in the DM path, so - like call
 * signals - a reaction is a tiny marker message sent over the E2EE channel
 * itself. Clients fold the markers into { messageId → emoji → reactors } and
 * never render them as chat bubbles. SDK message ids are protocol-level
 * (edit/delete already target them cross-device), so they're stable anchors.
 */

const PREFIX = "[[react:";
const SUFFIX = "]]";

export interface DmReactionSignal {
  op: "add" | "del";
  messageId: string;
  emoji: string;
}

export function dmReactionBody(s: DmReactionSignal): string {
  return `${PREFIX}${s.op}:${s.messageId}:${s.emoji}${SUFFIX}`;
}

/** The reaction signal, if `body` is exactly a reaction marker; null otherwise. */
export function parseDmReaction(body: string | null | undefined): DmReactionSignal | null {
  if (!body || !body.startsWith(PREFIX) || !body.endsWith(SUFFIX)) return null;
  const inner = body.slice(PREFIX.length, -SUFFIX.length);
  const a = inner.indexOf(":");
  const b = inner.indexOf(":", a + 1);
  if (a < 0 || b < 0) return null;
  const op = inner.slice(0, a);
  const messageId = inner.slice(a + 1, b);
  const emoji = inner.slice(b + 1);
  if ((op !== "add" && op !== "del") || !messageId || !emoji || emoji.length > 16) return null;
  return { op, messageId, emoji };
}

/**
 * Fold a DM thread's reaction markers into per-message reaction maps.
 * Later markers win (add then del cancels). `reactorOf` maps each marker
 * message to who sent it (me or the peer).
 */
export function foldDmReactions<M>(
  messages: M[],
  contentOf: (m: M) => string | null | undefined,
  reactorOf: (m: M) => string,
): Map<string, Record<string, string[]>> {
  const acc = new Map<string, Map<string, Set<string>>>();
  for (const m of messages) {
    const sig = parseDmReaction(contentOf(m));
    if (!sig) continue;
    const byEmoji = acc.get(sig.messageId) ?? new Map<string, Set<string>>();
    const users = byEmoji.get(sig.emoji) ?? new Set<string>();
    if (sig.op === "add") users.add(reactorOf(m));
    else users.delete(reactorOf(m));
    byEmoji.set(sig.emoji, users);
    acc.set(sig.messageId, byEmoji);
  }
  const out = new Map<string, Record<string, string[]>>();
  for (const [msgId, byEmoji] of acc) {
    const rec: Record<string, string[]> = {};
    for (const [emoji, users] of byEmoji) {
      if (users.size > 0) rec[emoji] = [...users];
    }
    if (Object.keys(rec).length > 0) out.set(msgId, rec);
  }
  return out;
}
