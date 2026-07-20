import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Personal block list — a local, self-service "I don't want to see or hear from
 * this person" (distinct from workspace bans, which are admin governance).
 * v1 is client-side: we decline their DMs and hide their messages/notifications.
 * The relay/SDK still deliver; a true server-side block is a later step.
 */
interface BlocksState {
  blocked: string[]; // gossip userIds
  block: (userId: string) => void;
  unblock: (userId: string) => void;
}

export const useBlocks = create<BlocksState>()(
  persist(
    (set) => ({
      blocked: [],
      block: (userId) => set((s) => (s.blocked.includes(userId) ? s : { blocked: [...s.blocked, userId] })),
      unblock: (userId) => set((s) => ({ blocked: s.blocked.filter((x) => x !== userId) })),
    }),
    { name: "gossip-blocks" },
  ),
);

/** Non-reactive check for enforcement paths (SDK auto-accept, notification gates). */
export function isBlocked(userId: string): boolean {
  return useBlocks.getState().blocked.includes(userId);
}
