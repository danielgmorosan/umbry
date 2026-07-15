import { useEffect, useRef } from "react";
import { Track, type Participant } from "livekit-client";
import { Volume2, MonitorUp } from "lucide-react";
import { useCallVolumes } from "@/stores/useCallVolumes";
import { truncateHandle } from "@/lib/utils";

/**
 * Right-click menu on a call participant (T3): per-user volume slider, plus
 * a screenshare-audio slider when they're sharing with sound. Values persist
 * per handle (useCallVolumes) and are applied live by the participant tiles.
 */
export function ParticipantMenu({
  x,
  y,
  participant,
  onClose,
}: {
  x: number;
  y: number;
  participant: Participant;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handle = participant.identity.split("#")[0];
  const name = participant.name || truncateHandle(handle, 8, 4);
  const vol = useCallVolumes((s) => s.volumes[handle]);
  const setVolume = useCallVolumes((s) => s.setVolume);
  const hasShareAudio = !!participant.getTrackPublication(Track.Source.ScreenShareAudio);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Keep the menu on screen near the cursor.
  const width = 240;
  const left = Math.min(x, window.innerWidth - width - 8);
  const top = Math.min(y, window.innerHeight - (hasShareAudio ? 170 : 120) - 8);

  return (
    <div className="fixed inset-0 z-[80]" onMouseDown={onClose} onContextMenu={(e) => e.preventDefault()}>
      <div
        ref={ref}
        style={{ left, top, width }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute rounded-card border border-line bg-paper p-3 font-stack shadow-[var(--st-shadow-card)]"
      >
        <div className="truncate text-[13px] font-semibold text-ink">{name}</div>
        {participant.isLocal ? (
          <p className="mt-1 text-[12px] text-ink-mute">That's you — everyone sets their own listening volume.</p>
        ) : (
          <>
            <VolumeSlider
              icon={<Volume2 className="size-3.5" />}
              label="User volume"
              value={vol?.mic ?? 1}
              onChange={(v) => setVolume(handle, "mic", v)}
            />
            {hasShareAudio && (
              <VolumeSlider
                icon={<MonitorUp className="size-3.5" />}
                label="Screenshare audio"
                value={vol?.screen ?? 1}
                onChange={(v) => setVolume(handle, "screen", v)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function VolumeSlider({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between text-[11.5px] text-ink-mute">
        <span className="inline-flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className="font-mono text-[11px] text-ink-faint">{pct}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="mt-1 w-full accent-[color:var(--st-ink)]"
      />
    </div>
  );
}
