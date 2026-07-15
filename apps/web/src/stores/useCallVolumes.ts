import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Per-user call volume preferences (T3), keyed by Gossip handle so they
 * stick across calls and sessions (like Discord's per-user volume). `mic`
 * is the person's voice, `screen` their screenshare audio; 0..1 (element
 * volume can't boost past 100%). Applied by the participant tiles.
 */
interface CallVolumesState {
  volumes: Record<string, { mic?: number; screen?: number }>;
  setVolume: (handle: string, kind: "mic" | "screen", value: number) => void;
}

export const useCallVolumes = create<CallVolumesState>()(
  persist(
    (set) => ({
      volumes: {},
      setVolume: (handle, kind, value) =>
        set((s) => ({
          volumes: {
            ...s.volumes,
            [handle]: { ...s.volumes[handle], [kind]: Math.min(1, Math.max(0, value)) },
          },
        })),
    }),
    { name: "gossip-call-volumes" },
  ),
);
