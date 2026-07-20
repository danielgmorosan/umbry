import { DisconnectReason, Room, RoomEvent, Track, type RoomOptions } from "livekit-client";
import { create } from "zustand";
import { syncNoiseGate, resetNoiseGate } from "@/lib/audioProcessing";
import { playJoinBlip, playLeaveBlip, playCallEnd } from "@/lib/sounds";
import { useAudioSettings } from "@/stores/useAudioSettings";
import { useVideoSettings } from "@/stores/useVideoSettings";
import { applyCameraBackground } from "@/lib/cameraBackground";
import { pickScreenSource } from "@/lib/desktopScreenPicker";
import { canCaptureDesktopAudio, startDesktopShareAudio, type DesktopAudioCapture } from "@/lib/desktopAudioCapture";

// Echo-free screenshare audio: the desktop shell captures process-excluded
// system audio and we publish it as ScreenShareAudio, instead of getDisplayMedia's
// systemAudio loopback (which re-broadcasts the call → everyone hears themselves).
// See docs/screenshare-audio.md. Held module-level so leave()/disable can stop it.
let shareAudioCapture: DesktopAudioCapture | null = null;
function stopShareAudioCapture(room: Room | null): void {
  if (!shareAudioCapture) return;
  const cap = shareAudioCapture;
  shareAudioCapture = null;
  try {
    room?.localParticipant.unpublishTrack(cap.track);
  } catch {
    /* already gone */
  }
  cap.stop();
}

// Reloading mid-call would silently drop the call - ask first (browsers show
// their own generic wording; registering the handler is what arms the prompt).
function guardUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
  e.returnValue = "";
}

// ── Mobile call resilience (T4) ─────────────────────────────────────
// Backgrounding a mobile browser freezes JS and the SFU socket dies after
// ~a minute; idle phone-lock does the same. Two defenses:
// 1. a screen wake lock while in a call, so the phone doesn't idle-lock
//    itself mid-call (platforms release it on hide; we re-request on show);
// 2. auto-rejoin with a FRESH token after an unexpected disconnect -
//    immediately when visible, or the moment the tab is foregrounded.
let rejoinFn: (() => Promise<void>) | null = null;
let pendingRejoin = false;
let rejoinAttempts = 0;
// Mic state captured when deafening, so undeafening can restore it.
let micBeforeDeafen = false;

function shouldAutoRejoin(reason: DisconnectReason | undefined): boolean {
  switch (reason) {
    // Deliberate ends and server-side removals must stay ended.
    case DisconnectReason.CLIENT_INITIATED:
    case DisconnectReason.DUPLICATE_IDENTITY:
    case DisconnectReason.PARTICIPANT_REMOVED:
    case DisconnectReason.ROOM_DELETED:
      return false;
    default:
      return true;
  }
}

async function tryRejoin(): Promise<void> {
  const fn = rejoinFn;
  if (!fn) return;
  if (rejoinAttempts >= 4) {
    rejoinFn = null;
    return;
  }
  rejoinAttempts++;
  try {
    await fn();
    rejoinAttempts = 0;
  } catch {
    setTimeout(() => void tryRejoin(), 2000 * rejoinAttempts);
  }
}

let wakeLock: WakeLockSentinel | null = null;
async function acquireWakeLock(): Promise<void> {
  try {
    if (!("wakeLock" in navigator) || useCall.getState().status === "idle") return;
    wakeLock = await navigator.wakeLock.request("screen");
  } catch {
    /* unsupported or denied - not critical */
  }
}
function releaseWakeLock(): void {
  void wakeLock?.release().catch(() => {});
  wakeLock = null;
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  void acquireWakeLock();
  if (pendingRejoin) {
    pendingRejoin = false;
    void tryRejoin();
  }
});

/**
 * Global call session (T-14). The LiveKit `Room` lives HERE - module scope,
 * above the router - so navigating between channels/DMs/settings never
 * unmounts the media session. Route components only render UI bound to it
 * via RoomContext; the persistent CallDock (mounted beside the router in
 * main.tsx) keeps remote audio playing and offers controls everywhere.
 *
 * Exactly one active session: connecting to a new target tears the previous
 * room down first.
 */
export type CallTarget =
  | { kind: "channel"; workspaceId: string; channelId: string; label: string }
  | { kind: "dm"; peerId: string; label: string };

export function callPath(t: CallTarget): string {
  return t.kind === "channel"
    ? `/w/${t.workspaceId}/call/${t.channelId}`
    : `/home/call/dm/${encodeURIComponent(t.peerId)}`;
}

export function sameTarget(a: CallTarget | null, b: CallTarget | null): boolean {
  return !!a && !!b && callPath(a) === callPath(b);
}

interface CallState {
  room: Room | null;
  status: "idle" | "connecting" | "connected";
  target: CallTarget | null;
  mic: boolean;
  cam: boolean;
  screen: boolean;
  /** Deafened: all incoming call audio muted (and your mic forced off). */
  deafened: boolean;
  /** Sharing without an audio track - the browser/picker choice gave no sound (T3 hint). */
  screenAudioMissing: boolean;
  dismissScreenAudioHint: () => void;
  /** Why the last session ended (server kick, duplicate identity, …); null after a user-initiated leave. */
  lastDisconnectReason: DisconnectReason | null;

  connect: (args: {
    url: string;
    token: string;
    target: CallTarget;
    options: RoomOptions;
    withVideo?: boolean;
    /** Re-fetch a fresh connection (token) for auto-rejoin after network death (T4). */
    refresh?: () => Promise<{ url: string; token: string }>;
  }) => Promise<void>;
  /** Refresh the display label once the channel/contact name resolves (T3). */
  setTargetLabel: (label: string) => void;
  leave: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleCam: () => Promise<void>;
  toggleScreen: () => Promise<void>;
  /** Deafen/undeafen: mute all incoming audio + your mic; undeafen restores it. */
  toggleDeafen: () => Promise<void>;
  /** Switch the active mic/speaker/camera live during a call (T3, Discord-style). */
  switchDevice: (kind: MediaDeviceKind, deviceId: string) => Promise<void>;
}

export const useCall = create<CallState>((set, get) => {
  const syncLocal = () => {
    const p = get().room?.localParticipant;
    if (!p) return;
    set({ mic: p.isMicrophoneEnabled, cam: p.isCameraEnabled, screen: p.isScreenShareEnabled });
  };

  return {
    room: null,
    status: "idle",
    target: null,
    mic: false,
    cam: false,
    screen: false,
    deafened: false,
    screenAudioMissing: false,
    dismissScreenAudioHint: () => set({ screenAudioMissing: false }),
    lastDisconnectReason: null,

    connect: async (args) => {
      const { url, token, target, options, withVideo, refresh } = args;
      const cur = get();
      // Idempotent for the same target (also absorbs StrictMode double-effects).
      if (cur.status !== "idle" && sameTarget(cur.target, target)) return;
      // Exactly one active session - leave the old call before joining a new one.
      if (cur.room) await get().leave();

      const room = new Room(options);
      set({ room, status: "connecting", target, lastDisconnectReason: null });
      window.addEventListener("beforeunload", guardUnload);
      room
        .on(RoomEvent.LocalTrackPublished, syncLocal)
        .on(RoomEvent.LocalTrackUnpublished, syncLocal)
        .on(RoomEvent.TrackMuted, syncLocal)
        .on(RoomEvent.TrackUnmuted, syncLocal)
        .on(RoomEvent.ParticipantConnected, playJoinBlip)
        .on(RoomEvent.ParticipantDisconnected, playLeaveBlip)
        .on(RoomEvent.Disconnected, (reason) => {
          // Covers every path out: dock Leave, in-call leave button, server kick.
          const unexpected = reason !== undefined && reason !== DisconnectReason.CLIENT_INITIATED;
          if (unexpected) {
            console.warn("[call] disconnected by server, reason:", DisconnectReason[reason] ?? reason);
          }
          if (get().room === room) {
            stopShareAudioCapture(room); // was sharing when the socket died
            // T4: network-ish deaths (backgrounded mobile tab, flaky signal)
            // auto-rejoin instead of ending the call for good.
            const willRejoin = unexpected && shouldAutoRejoin(reason) && !!rejoinFn;
            set({
              room: null,
              status: "idle",
              target: null,
              mic: false,
              cam: false,
              screen: false,
              screenAudioMissing: false,
              lastDisconnectReason: reason ?? null,
            });
            resetNoiseGate();
            window.removeEventListener("beforeunload", guardUnload);
            releaseWakeLock();
            if (willRejoin) {
              if (document.hidden) pendingRejoin = true;
              else setTimeout(() => void tryRejoin(), 800);
            } else {
              rejoinFn = null;
              playCallEnd();
            }
          }
        });
      try {
        await room.connect(url, token);
        // Voice call: mic only (no intrusive camera prompt). Video call: also
        // turn the camera on at join (T3). Either way the user can toggle.
        await room.localParticipant.setMicrophoneEnabled(true);
        if (withVideo) {
          try {
            await room.localParticipant.setCameraEnabled(true);
            void applyCameraBackground(room); // T4: blur / virtual background
          } catch {
            /* camera denied - stay voice-only */
          }
        }
        // Only flip to connected if this room is still current (no race with leave()).
        if (get().room === room) {
          set({ status: "connected" });
          syncLocal();
          // T4: arm auto-rejoin (when the caller can mint fresh tokens) + keep
          // the screen awake for the duration of the call.
          rejoinAttempts = 0;
          rejoinFn = refresh
            ? async () => {
                if (get().status !== "idle") return; // already back in
                const fresh = await refresh();
                await get().connect({ ...args, url: fresh.url, token: fresh.token });
              }
            : null;
          void acquireWakeLock();
          // T-15: attach the noise-gate processor if enabled in settings.
          try {
            await syncNoiseGate(room);
          } catch (e) {
            console.error("noise gate attach failed", e);
          }
        }
      } catch (e) {
        try {
          await room.disconnect();
        } catch {
          /* already down */
        }
        if (get().room === room) {
          set({ room: null, status: "idle", target: null, mic: false, cam: false, screen: false, deafened: false, screenAudioMissing: false });
        }
        throw e;
      }
    },

    setTargetLabel: (label) => {
      const t = get().target;
      if (t && label && t.label !== label) set({ target: { ...t, label } });
    },

    leave: async () => {
      const room = get().room;
      const target = get().target;
      const wasAlone = !!room && room.remoteParticipants.size === 0;
      stopShareAudioCapture(room); // release the AudioContext + stop the shell's capture
      // User-initiated: never auto-rejoin after an explicit leave (T4).
      rejoinFn = null;
      pendingRejoin = false;
      releaseWakeLock();
      set({ room: null, status: "idle", target: null, mic: false, cam: false, screen: false, deafened: false, screenAudioMissing: false });
      resetNoiseGate();
      window.removeEventListener("beforeunload", guardUnload);
      if (room) {
        playCallEnd();
        try {
          await room.disconnect(); // stops all local tracks - mic light goes off
        } catch {
          /* already down */
        }
        // Last one out: flip the "call in progress" state immediately instead
        // of waiting for the relay's next LiveKit reconciliation.
        if (wasAlone && target?.kind === "channel") {
          const { useRelay } = await import("./useRelay");
          useRelay.getState().callEndedHint(target.workspaceId, target.channelId);
        }
      }
    },

    toggleMic: async () => {
      const r = get().room;
      if (!r) return;
      const enabling = !get().mic;
      await r.localParticipant.setMicrophoneEnabled(enabling);
      if (enabling && get().deafened) set({ deafened: false }); // unmuting undeafens
      syncLocal();
    },

    toggleDeafen: async () => {
      const r = get().room;
      const next = !get().deafened;
      if (next) {
        // Deafening mutes your mic too; remember its state to restore on undeafen.
        micBeforeDeafen = get().mic;
        if (get().mic && r) await r.localParticipant.setMicrophoneEnabled(false);
        set({ deafened: true });
      } else {
        set({ deafened: false });
        if (micBeforeDeafen && r) await r.localParticipant.setMicrophoneEnabled(true);
      }
      syncLocal();
    },
    toggleCam: async () => {
      const r = get().room;
      if (!r) return;
      const enabling = !get().cam;
      await r.localParticipant.setCameraEnabled(enabling);
      if (enabling) void applyCameraBackground(r); // T4: blur / virtual background
      syncLocal();
    },
    switchDevice: async (kind, deviceId) => {
      const r = get().room;
      if (!r) return;
      try {
        await r.switchActiveDevice(kind, deviceId);
      } catch (e) {
        console.error("switchActiveDevice failed", e);
      }
      // Persist so the choice sticks for the next call too.
      const audio = useAudioSettings.getState();
      if (kind === "audioinput") audio.set({ inputId: deviceId });
      else if (kind === "audiooutput") audio.set({ outputId: deviceId });
      syncLocal();
    },

    toggleScreen: async () => {
      const r = get().room;
      if (!r) return;
      const enabling = !get().screen;

      // Disabling: tear down the native audio capture (if any) first, then stop
      // the video share.
      if (!enabling) {
        stopShareAudioCapture(r);
        try {
          await r.localParticipant.setScreenShareEnabled(false);
        } catch {
          /* nothing to stop */
        }
        syncLocal();
        set({ screenAudioMissing: false });
        return;
      }

      // In the desktop shell the OS picker is unavailable, so ask which source
      // to share with our own dialog first; the shell resolves getDisplayMedia
      // to that pick. "unavailable" means a browser (or enumeration failed) —
      // let getDisplayMedia show the native picker as usual. audioWanted tracks
      // whether audio was actually asked for, so the "no sound" hint below
      // doesn't scold someone who deliberately unticked the box.
      let audioWanted = true;
      const pick = await pickScreenSource();
      if (pick.status === "cancelled") return;
      if (pick.status === "picked") audioWanted = pick.audio;

      // Echo-free path: on the desktop shell we take audio from the native
      // process-excluded capture (published separately below) instead of the
      // browser's systemAudio loopback, which re-broadcasts the call playback.
      const useNative = audioWanted && canCaptureDesktopAudio();
      const loopbackAudio = audioWanted && !useNative; // browser system-audio path

      // T4: user-selected share quality (Settings → Calls). The resolution
      // constraint is an ideal, so oversizing just means "don't downscale".
      const v = useVideoSettings.getState();
      const dims = v.shareRes === "1080" ? { width: 1920, height: 1080 } : v.shareRes === "720" ? { width: 1280, height: 720 } : { width: 3840, height: 2160 };
      try {
        await r.localParticipant.setScreenShareEnabled(true, {
          // Native path shares video only; the loopback path also grabs system
          // audio (tab audio anywhere; system audio on Windows for a screen share).
          audio: loopbackAudio,
          // Let people share the Umbry tab itself (demos) instead of hiding it.
          selfBrowserSurface: "include",
          ...(loopbackAudio ? { systemAudio: "include" as const } : {}),
          resolution: { ...dims, frameRate: v.shareFps },
          contentHint: v.sharePrioritize === "motion" ? "motion" : "detail",
        }, {
          // Cap the encode. Without an explicit ceiling the encoder chases the
          // full captured frame, which is what made sharing feel like it was
          // melting the laptop. Bitrate scales with the chosen resolution.
          screenShareEncoding: {
            maxBitrate: v.shareRes === "720" ? 1_500_000 : v.shareRes === "1080" ? 3_000_000 : 5_000_000,
            maxFramerate: v.shareFps,
            priority: "high",
          },
          // "detail" holds resolution and sheds frames (right for text/code);
          // "motion" does the opposite (right for video/gameplay).
          degradationPreference: v.sharePrioritize === "motion" ? "maintain-framerate" : "maintain-resolution",
        });
      } catch {
        // User cancelled the share picker - not an error.
        return;
      }

      // Publish the native audio track alongside the video share. On failure the
      // video still shares (just no audio) — we never fall back to the echoing
      // loopback.
      if (useNative) {
        try {
          const cap = await startDesktopShareAudio();
          if (cap) {
            await r.localParticipant.publishTrack(cap.track, { source: Track.Source.ScreenShareAudio, name: "screen-audio" });
            shareAudioCapture = cap;
          }
        } catch {
          stopShareAudioCapture(r);
        }
      }

      syncLocal();
      // Sharing but no audio track came with it (window share, unchecked box,
      // Firefox, or native capture failed): tell the sharer, so silence isn't a
      // mystery on the other end.
      const sharingNow = get().screen;
      const hasShareAudio = useNative
        ? !!shareAudioCapture
        : !!r.localParticipant.getTrackPublication(Track.Source.ScreenShareAudio);
      set({ screenAudioMissing: sharingNow && audioWanted && !hasShareAudio });
    },
  };
});
