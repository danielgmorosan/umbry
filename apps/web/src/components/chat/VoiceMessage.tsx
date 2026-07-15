import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

const BARS = 40;

/** Decode the audio once → BARS peak heights (0..1). Cached per URL. */
const peaksCache = new Map<string, number[]>();
async function computePeaks(url: string): Promise<number[]> {
  const cached = peaksCache.get(url);
  if (cached) return cached;
  try {
    const buf = await fetch(url).then((r) => r.arrayBuffer());
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor!();
    const audio = await ctx.decodeAudioData(buf);
    const data = audio.getChannelData(0);
    const block = Math.floor(data.length / BARS) || 1;
    const peaks: number[] = [];
    let max = 0.0001;
    for (let i = 0; i < BARS; i++) {
      let peak = 0;
      for (let j = 0; j < block; j++) peak = Math.max(peak, Math.abs(data[i * block + j] || 0));
      peaks.push(peak);
      max = Math.max(max, peak);
    }
    void ctx.close();
    const norm = peaks.map((p) => Math.max(0.12, p / max)); // floor so silent bars still show
    peaksCache.set(url, norm);
    return norm;
  } catch {
    // Decode unsupported (some browsers/codecs) → gentle static waveform.
    const fallback = Array.from({ length: BARS }, (_, i) => 0.35 + 0.4 * Math.abs(Math.sin(i * 0.7)));
    peaksCache.set(url, fallback);
    return fallback;
  }
}

function fmt(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/**
 * Voice-message player (T3): a styled play button + real waveform (decoded
 * peaks) with a filled progress overlay you can click to seek. Falls back to
 * a static waveform when the browser can't decode the codec.
 */
export function VoiceMessage({ src, className }: { src: string; className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [peaks, setPeaks] = useState<number[]>(() => Array.from({ length: BARS }, () => 0.3));
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    let on = true;
    void computePeaks(src).then((p) => on && setPeaks(p));
    return () => {
      on = false;
    };
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };

  const progress = dur > 0 ? cur / dur : 0;
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = Math.min(dur, Math.max(0, ((e.clientX - rect.left) / rect.width) * dur));
  };

  return (
    <div
      className={cn(
        "mt-1 flex w-fit max-w-[min(20rem,100%)] items-center gap-3 rounded-full border border-line bg-paper-2 py-2 pl-2 pr-3.5",
        className,
      )}
    >
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-positive text-white shadow-[0_2px_10px_-2px_var(--st-positive)] transition-transform hover:scale-105 active:scale-95"
      >
        {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
      </button>

      <div onClick={seek} className="flex h-8 min-w-[120px] flex-1 cursor-pointer items-center gap-[2px]">
        {peaks.map((h, i) => {
          const played = i / BARS <= progress;
          return (
            <span
              key={i}
              className={cn("w-full rounded-full transition-colors", played ? "bg-positive" : "bg-ink-faint/40")}
              style={{ height: `${Math.round(h * 100)}%`, minHeight: 3 }}
            />
          );
        })}
      </div>

      <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-mute">{fmt(playing || cur ? cur : dur)}</span>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCur(0);
        }}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (isFinite(d)) setDur(d);
        }}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          if (isFinite(d)) setDur(d);
        }}
        className="hidden"
      />
    </div>
  );
}
