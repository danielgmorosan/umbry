import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { Track, RemoteParticipant, type Participant } from "livekit-client";
import {
  VideoTrack,
  isTrackReference,
  useIsMuted,
  useIsSpeaking,
  useRoomContext,
  useTracks,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, MessageSquareText, VolumeX, Volume2, X, Maximize, Minimize, Settings2, Headphones, MonitorPlay } from "lucide-react";
import { CallReactionOverlay, CallReactionButton } from "@/components/call/CallReactions";
import { Tooltip } from "@umbry/ui/stack";
import { UserAvatar } from "@/components/UserAvatar";
import { useCall, type CallTarget } from "@/stores/useCall";
import { useSession } from "@/stores/useSession";
import { ChannelView } from "@/pages/ChannelView";
import { RealDmView } from "@/components/chat/RealDmView";
import { ParticipantMenu } from "./ParticipantMenu";
import { DevicePicker } from "./DevicePicker";
import { CameraSettingsDialog } from "./CameraSettingsDialog";
import { useCallVolumes, effectiveMicVolume } from "@/stores/useCallVolumes";
import { longPressProps } from "@/lib/longPress";
import { cn, truncateHandle } from "@/lib/utils";
import { needsSourcePicker } from "@/lib/desktopScreenPicker";

/**
 * Custom in-call surface (T2-06). Discord-style layout: a dark stage with a
 * compact strip of fixed-size participant tiles (a screenshare gets a large
 * focus area above the strip), the control tray below, and the text chat
 * (channel or E2EE DM) docked at the bottom, full-width. The stage stays dark
 * in both themes - video surfaces read as a stage, not a document.
 *
 * Must render inside RoomContext.Provider (the Room lives in useCall, T-14).
 */
export function CallStage({ target }: { target: CallTarget }) {
  const mic = useCall((s) => s.mic);
  const cam = useCall((s) => s.cam);
  const screen = useCall((s) => s.screen);
  const deafened = useCall((s) => s.deafened);
  const screenAudioMissing = useCall((s) => s.screenAudioMissing);
  const { toggleMic, toggleCam, toggleScreen, toggleDeafen, leave } = useCall.getState();
  const [chatOpen, setChatOpen] = useState(true);
  // Whose screenshare we're actively watching (Discord-style: don't auto-open).
  const [watching, setWatching] = useState<string | null>(null);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [camSettingsOpen, setCamSettingsOpen] = useState(false);
  const devicesBtn = useRef<HTMLButtonElement>(null);
  const room = useRoomContext();
  // Right-click volume menu (T3): { cursor position, whose audio }.
  const [menu, setMenu] = useState<{ x: number; y: number; participant: Participant } | null>(null);
  const openMenuAt = (x: number, y: number, participant: Participant) => setMenu({ x, y, participant });
  const openMenu = (e: React.MouseEvent, participant: Participant) => {
    e.preventDefault();
    openMenuAt(e.clientX, e.clientY, participant);
  };

  // Screenshare area is resizable (T3): drag the handle under it; the size
  // sticks. Double duty: a fullscreen button on the share itself.
  const [shareVh, setShareVh] = useState(() => {
    const saved = Number(localStorage.getItem("gossip-share-vh"));
    return saved >= 15 && saved <= 75 ? saved : 38;
  });
  const shareRef = useRef<HTMLDivElement>(null);
  // Track fullscreen so the button toggles + swaps its icon, and stays correct
  // when the user exits with Esc/F11 (which don't go through our button).
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onFs = () => setIsFullscreen(document.fullscreenElement === shareRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  const startShareResize = (e: React.PointerEvent) => {
    e.preventDefault();
    const top = shareRef.current?.getBoundingClientRect().top ?? 0;
    const move = (ev: PointerEvent) => {
      const vh = Math.min(75, Math.max(15, ((ev.clientY - top) / window.innerHeight) * 100));
      setShareVh(vh);
      localStorage.setItem("gossip-share-vh", String(Math.round(vh)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  const screenShare = tracks.filter(isTrackReference).find((t) => t.source === Track.Source.ScreenShare);
  const cameras = tracks.filter((t) => t.source === Track.Source.Camera);
  // Tiles grow a bit when they have the room to themselves.
  const large = !chatOpen && !screenShare;

  // The hide-chat control only exists while sharing; when it vanishes, make sure
  // the chat comes back so it can't get stuck hidden with nothing to show.
  useEffect(() => {
    if (!screen && !screenShare) setChatOpen(true);
  }, [screen, screenShare]);

  // Stop watching a stream the moment it ends (the sharer stopped).
  useEffect(() => {
    if (watching && screenShare?.participant.identity !== watching) setWatching(null);
  }, [watching, screenShare]);

  // Stream viewer bits: whose share, its display name, whether we're watching,
  // and whether its audio is muted (reuses the per-user screen-volume store).
  const streamHandle = screenShare ? screenShare.participant.identity.split("#")[0] : "";
  const streamMuted = useCallVolumes((s) => (streamHandle ? (s.volumes[streamHandle]?.screen ?? 1) === 0 : false));
  const streamerName = screenShare
    ? screenShare.participant.name || truncateHandle(screenShare.participant.identity, 10, 4)
    : "";
  const isWatching = !!screenShare && watching === screenShare.participant.identity;
  const toggleStreamMute = () => {
    if (streamHandle) useCallVolumes.getState().setVolume(streamHandle, "screen", streamMuted ? 1 : 0);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Remote audio is rendered ONCE by the always-mounted CallDock (outside
          the router), so navigating never mounts/unmounts a second renderer -
          that churn caused leaked audio elements and the double-audio echo. */}

      <div className={cn("relative flex min-h-0 flex-col bg-[#101014]", chatOpen ? "shrink-0" : "flex-1 justify-center")}>
        <CallReactionOverlay />
        {screenShare &&
          (isWatching ? (
            <>
              <div
                ref={shareRef}
                className={cn("group/share relative min-h-0 p-3 pb-0", !chatOpen && "min-h-[38vh] flex-1")}
                style={chatOpen ? { height: `${shareVh}vh` } : undefined}
                onContextMenu={(e) => openMenu(e, screenShare.participant)}
                title="Right-click for volume"
              >
                <VideoTrack trackRef={screenShare} className="h-full w-full rounded-card object-contain" />
                {/* Viewer controls: mute the stream's audio, fullscreen, stop watching. */}
                <div
                  className={cn(
                    "absolute right-5 top-5 flex items-center gap-2 transition-opacity",
                    isFullscreen ? "opacity-100" : "opacity-0 group-hover/share:opacity-100",
                  )}
                >
                  <button
                    onClick={toggleStreamMute}
                    title={streamMuted ? "Unmute stream audio" : "Mute stream audio"}
                    aria-label={streamMuted ? "Unmute stream audio" : "Mute stream audio"}
                    className="grid size-9 place-items-center rounded-control bg-black/60 text-white hover:bg-black/80"
                  >
                    {streamMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
                      else void shareRef.current?.requestFullscreen().catch(() => {});
                    }}
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen screenshare"}
                    className="grid size-9 place-items-center rounded-control bg-black/60 text-white hover:bg-black/80"
                  >
                    {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                  </button>
                  <button
                    onClick={() => setWatching(null)}
                    title="Stop watching"
                    aria-label="Stop watching stream"
                    className="grid size-9 place-items-center rounded-control bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              {chatOpen && (
                <div
                  onPointerDown={startShareResize}
                  title="Drag to resize the screenshare"
                  className="group/handle flex h-4 shrink-0 cursor-row-resize items-center justify-center"
                >
                  <span className="h-1.5 w-20 rounded-full bg-white/35 transition-colors group-hover/handle:bg-white/70" />
                </div>
              )}
            </>
          ) : (
            // Discord-style: don't auto-open. Show who's streaming + a click to watch.
            <div className={cn("grid place-items-center p-4", !chatOpen ? "min-h-[38vh] flex-1" : "")} style={chatOpen ? { height: `${shareVh}vh` } : undefined}>
              <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-paper-2 px-6 py-8 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-field text-ink">
                  <MonitorPlay className="size-6" />
                </span>
                <div className="text-[14px] font-medium text-ink">{streamerName} is streaming</div>
                <button
                  onClick={() => setWatching(screenShare.participant.identity)}
                  className="rounded-control bg-ink px-4 py-2 text-[13px] font-medium text-paper transition-opacity hover:opacity-90"
                >
                  Watch Stream
                </button>
              </div>
            </div>
          ))}
        <div className="flex max-h-[38vh] shrink-0 flex-wrap items-center justify-center gap-2 overflow-y-auto px-4 py-3">
          {cameras.map((t) => (
            <ParticipantCard
              key={`${t.participant.identity}:${t.source}`}
              trackRef={t}
              large={large}
              onMenu={openMenu}
              onMenuAt={openMenuAt}
            />
          ))}
        </div>
      </div>

      {menu && (
        <ParticipantMenu
          x={menu.x}
          y={menu.y}
          participant={menu.participant}
          onClose={() => setMenu(null)}
          onCameraSettings={() => setCamSettingsOpen(true)}
        />
      )}
      {camSettingsOpen && <CameraSettingsDialog room={room} onClose={() => setCamSettingsOpen(false)} />}

      {/* Sharer-side heads-up: this share carries NO audio (browser/picker
          choice) - better than mystery silence on the other end (T3). */}
      {screenAudioMissing && (
        <div className="flex shrink-0 items-center gap-2.5 border-t border-line bg-paper-2 px-4 py-2 text-[12.5px] text-ink-mute">
          <VolumeX className="size-4 shrink-0 text-negative" />
          <span className="min-w-0">
            <span className="font-semibold text-ink">Your share has no sound.</span>{" "}
            {needsSourcePicker() ? (
              <>
                Stop sharing and start again with “Share computer audio” ticked. If it stays silent, grant Umbry{" "}
                <span className="font-medium text-ink">Screen Recording</span> access in System Settings → Privacy &
                Security, then restart the app.
              </>
            ) : (
              <>
                To include audio: share a <span className="font-medium text-ink">browser tab</span> and tick “Also share
                tab audio”, or your entire screen with “Share system audio”. Window shares - and Firefox - can't capture
                audio.
              </>
            )}
          </span>
          <button
            onClick={() => useCall.getState().dismissScreenAudioHint()}
            aria-label="Dismiss"
            className="ml-auto grid size-7 shrink-0 place-items-center rounded-control text-ink-faint hover:bg-field hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Control tray. The leave button is pinned OUTSIDE the scroll area so it
          is always reachable - on a narrow phone the other controls scroll
          horizontally rather than pushing Leave off-screen. */}
      <div className="relative flex h-16 shrink-0 items-center gap-2 border-t border-line bg-paper px-3 md:px-4">
        {devicesOpen && <DevicePicker anchor={devicesBtn.current} onClose={() => setDevicesOpen(false)} />}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-x-auto md:gap-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CallButton label={mic ? "Mute microphone" : "Unmute microphone"} off={!mic} onClick={() => void toggleMic()}>
            {mic ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </CallButton>
          <CallButton label={deafened ? "Undeafen" : "Deafen (mute everyone + mic)"} off={deafened} onClick={() => void toggleDeafen()}>
            {deafened ? <VolumeX className="size-5" /> : <Headphones className="size-5" />}
          </CallButton>
          <CallButton ref={devicesBtn} label="Audio & video devices" active={devicesOpen} onClick={() => setDevicesOpen((o) => !o)}>
            <Settings2 className="size-5" />
          </CallButton>
          <CallButton label={cam ? "Turn camera off" : "Turn camera on"} off={!cam} onClick={() => void toggleCam()}>
            {cam ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </CallButton>
          <CallButton label={screen ? "Stop sharing" : "Share screen"} active={screen} onClick={() => void toggleScreen()}>
            <MonitorUp className="size-5" />
          </CallButton>
          <CallReactionButton />
          {/* Hide-chat is a screenshare/theater affordance (Discord-style): only
              offered while someone is sharing. Otherwise the chat always shows. */}
          {(screen || !!screenShare) && (
            <CallButton label={chatOpen ? "Hide chat" : "Show chat"} active={chatOpen} onClick={() => setChatOpen((o) => !o)}>
              <MessageSquareText className="size-5" />
            </CallButton>
          )}
        </div>
        <span aria-hidden className="h-6 w-px shrink-0 bg-line" />
        <Tooltip label="Leave call">
          <button
            onClick={() => void leave()}
            aria-label="Leave call"
            className="grid h-11 w-14 shrink-0 place-items-center rounded-card bg-negative text-white transition-opacity hover:opacity-90 max-md:w-12"
          >
            <PhoneOff className="size-5" />
          </button>
        </Tooltip>
      </div>

      {/* The REAL conversation, not a mini copy (T3): full ChannelView / DM
          view docked under the call - links, previews, threads, attachments,
          edit/delete all behave exactly like on the normal page. */}
      {chatOpen && (
        <div className="flex min-h-0 flex-1 flex-col border-t border-line">
          {target.kind === "channel" ? (
            <ChannelView embedded />
          ) : (
            <RealDmView peerId={target.peerId} peerName={target.label} embedded />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Fixed-size 16:9 participant tile. Camera on fills the tile with video;
 * camera off shows a small circular avatar - never a tile-sized silhouette.
 * Speaking gets the green ring; a muted mic is flagged in the name chip.
 * Right-click opens the per-user volume menu (T3).
 */
function ParticipantCard({
  trackRef,
  large,
  onMenu,
  onMenuAt,
}: {
  trackRef: TrackReferenceOrPlaceholder;
  large: boolean;
  onMenu?: (e: React.MouseEvent, participant: Participant) => void;
  onMenuAt?: (x: number, y: number, participant: Participant) => void;
}) {
  const p = trackRef.participant;
  const speaking = useIsSpeaking(p);
  const micMuted = useIsMuted({ participant: p, source: Track.Source.Microphone });
  const camMuted = useIsMuted(trackRef);
  // Identity carries a per-connection suffix (duplicate-kick fix) - strip it
  // so avatars and handles resolve to the real user. For OUR OWN tile, prefer
  // the session userId: after a refresh the call can reconnect before the
  // session unlocks, giving a "guest#…" identity with no avatar - the session
  // id keeps our local custom pic showing.
  const sessionUserId = useSession((s) => s.userId);
  const rawHandle = p.identity.split("#")[0];
  const handle = p.isLocal && sessionUserId ? sessionUserId : rawHandle;
  const name = p.name || truncateHandle(handle, 8, 4);

  // Apply this listener's saved volume prefs for this person (T3) - voice
  // (incl. per-user mute) and screenshare audio. Re-applied when prefs
  // change or their tracks appear.
  const vol = useCallVolumes((s) => s.volumes[handle]);
  const sharingAudio = !!p.getTrackPublication(Track.Source.ScreenShareAudio);
  useEffect(() => {
    if (!(p instanceof RemoteParticipant)) return;
    p.setVolume(effectiveMicVolume(vol));
    if (sharingAudio) p.setVolume(vol?.screen ?? 1, Track.Source.ScreenShareAudio);
  }, [p, vol, sharingAudio]);

  return (
    <div
      onContextMenu={(e) => onMenu?.(e, p)}
      {...(onMenuAt ? longPressProps((x, y) => onMenuAt(x, y, p)) : {})}
      title="Right-click (or hold) for volume"
      className={cn(
        "relative aspect-video shrink-0 overflow-hidden rounded-card bg-[#1b1c22] transition-shadow duration-200",
        large ? "w-[300px]" : "w-[216px]",
        // Speaking: green ring + a soft audio glow (nicer than the bare ring).
        speaking && "ring-2 ring-positive shadow-[0_0_18px_-2px_var(--st-positive)]",
      )}
    >
      {isTrackReference(trackRef) && !camMuted ? (
        <VideoTrack trackRef={trackRef} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <UserAvatar
            name={name}
            id={handle}
            className={cn("!rounded-full", large ? "!size-16 !text-[20px]" : "!size-12 !text-[15px]")}
          />
        </div>
      )}
      <span className="absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-12px)] items-center gap-1 rounded-control bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
        {micMuted && <MicOff className="size-3 shrink-0 text-white/70" />}
        <span className="truncate">{name}</span>
      </span>
    </div>
  );
}

const CallButton = forwardRef<HTMLButtonElement, {
  label: string;
  /** Device explicitly off (mic muted / cam off) - negative fill, Discord-style. */
  off?: boolean;
  /** Feature engaged (screenshare, chat) - inverse fill. */
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}>(function CallButton({ label, off, active, onClick, children }, ref) {
  return (
    <Tooltip label={label}>
      <button
        ref={ref}
        onClick={onClick}
        aria-label={label}
        aria-pressed={off === undefined ? active : !off}
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-card transition-colors max-md:size-10",
          off ? "bg-negative text-white hover:opacity-90" : active ? "bg-ink text-paper hover:bg-ink-hover" : "bg-field text-ink hover:bg-line",
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
});
