import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Mic, Volume2, Video, Check } from "lucide-react";
import { useCall } from "@/stores/useCall";
import { useAudioSettings } from "@/stores/useAudioSettings";
import { cn } from "@/lib/utils";

/**
 * In-call device picker (T3), Discord-style with Stack tokens. Opens from the
 * control-tray gear and is viewport-aware: it flips above/below the anchor
 * depending on room and caps its height so it never runs off-screen.
 */
export function DevicePicker({ anchor, onClose }: { anchor: HTMLElement | null; onClose: () => void }) {
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inputId = useAudioSettings((s) => s.inputId);
  const outputId = useAudioSettings((s) => s.outputId);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; maxHeight: number } | null>(null);

  const refresh = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setMics(devices.filter((d) => d.kind === "audioinput"));
      setSpeakers(devices.filter((d) => d.kind === "audiooutput"));
      setCams(devices.filter((d) => d.kind === "videoinput"));
    } catch {
      /* enumeration blocked */
    }
  };

  useEffect(() => {
    void refresh();
    navigator.mediaDevices?.addEventListener?.("devicechange", refresh);
    const onDown = (e: MouseEvent) =>
      ref.current && !ref.current.contains(e.target as Node) && !anchor?.contains(e.target as Node) && onClose();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", refresh);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Position relative to the anchor: flip to whichever side has more room,
  // clamp height to that room, keep horizontally on screen. Width 288 (w-72).
  useLayoutEffect(() => {
    if (!anchor) return;
    const place = () => {
      const r = anchor.getBoundingClientRect();
      const gap = 10;
      const width = 288;
      const spaceAbove = r.top - gap;
      const spaceBelow = window.innerHeight - r.bottom - gap;
      const openUp = spaceAbove >= spaceBelow;
      const left = Math.min(Math.max(8, r.left + r.width / 2 - width / 2), window.innerWidth - width - 8);
      setPos({
        left,
        ...(openUp ? { bottom: window.innerHeight - r.top + gap } : { top: r.bottom + gap }),
        maxHeight: Math.max(180, (openUp ? spaceAbove : spaceBelow) - 8),
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [anchor]);

  const speakerSelectable = "setSinkId" in HTMLMediaElement.prototype;

  return (
    <div
      ref={ref}
      style={{ left: pos?.left ?? -9999, top: pos?.top, bottom: pos?.bottom, maxHeight: pos?.maxHeight }}
      className="fixed z-[70] flex w-72 flex-col overflow-hidden rounded-card border border-line bg-paper font-stack shadow-[var(--st-shadow-card)]"
    >
      <div className="shrink-0 border-b border-line px-3 py-2 text-[13px] font-semibold text-ink">Audio &amp; video</div>
      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        <DeviceGroup icon={<Mic className="size-4" />} label="Input device" devices={mics} kind="audioinput" activeId={inputId} />
        {speakerSelectable ? (
          <DeviceGroup icon={<Volume2 className="size-4" />} label="Output device" devices={speakers} kind="audiooutput" activeId={outputId} />
        ) : (
          <p className="px-2 py-2 text-[11.5px] leading-relaxed text-ink-faint">
            Speaker selection isn't supported in this browser - it uses your system default.
          </p>
        )}
        {cams.length > 0 && <DeviceGroup icon={<Video className="size-4" />} label="Camera" devices={cams} kind="videoinput" activeId="" />}
      </div>
    </div>
  );
}

function DeviceGroup({
  icon,
  label,
  devices,
  kind,
  activeId,
}: {
  icon: React.ReactNode;
  label: string;
  devices: MediaDeviceInfo[];
  kind: MediaDeviceKind;
  activeId: string;
}) {
  const [current, setCurrent] = useState<string>(activeId);
  return (
    <div className="mb-1 last:mb-0">
      <div className="flex items-center gap-1.5 px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
        {icon} {label}
      </div>
      {devices.length === 0 ? (
        <p className="px-2 py-1.5 text-[12px] text-ink-faint">No devices found.</p>
      ) : (
        devices.map((d) => {
          const selected = current === d.deviceId;
          return (
            <button
              key={d.deviceId}
              onClick={async () => {
                setCurrent(d.deviceId);
                await useCall.getState().switchDevice(kind, d.deviceId);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-[13px] transition-colors",
                selected ? "bg-field text-ink" : "text-ink-mute hover:bg-field/60 hover:text-ink",
              )}
            >
              <span className="grid size-4 shrink-0 place-items-center">
                {selected && <Check className="size-3.5 text-positive" />}
              </span>
              <span className="min-w-0 truncate">{d.label || `${label} ${d.deviceId.slice(0, 6)}`}</span>
            </button>
          );
        })
      )}
    </div>
  );
}
