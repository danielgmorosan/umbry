import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Monitor, Volume2, X } from "lucide-react";
import { useScreenPicker } from "@/lib/desktopScreenPicker";
import { useVideoSettings, type ShareRes, type ShareFps } from "@/stores/useVideoSettings";
import { cn } from "@/lib/utils";

/**
 * Desktop-shell replacement for the browser's screen-share picker (see
 * lib/desktopScreenPicker for why we can't use the native one). Mounted once in
 * the app shell; renders only while a share request is pending.
 *
 * Screen-only: per-window capture is unreliable on the Electron/macOS build we
 * ship, so the source list is already filtered to whole screens upstream. When
 * per-app sharing returns (native ScreenCaptureKit) this grows a Window tab
 * back.
 */
export function ScreenSourcePicker() {
  const open = useScreenPicker((s) => s.open);
  const sources = useScreenPicker((s) => s.sources);
  const choose = useScreenPicker((s) => s.choose);
  const [selected, setSelected] = useState<string | null>(null);
  const [audio, setAudio] = useState(true);
  // Quality/FPS chosen at pick time (Discord-style), seeded from the saved prefs.
  const [res, setRes] = useState<ShareRes>(() => useVideoSettings.getState().shareRes);
  const [fps, setFps] = useState<ShareFps>(() => useVideoSettings.getState().shareFps);
  const [priority, setPriority] = useState<"detail" | "motion">(() => useVideoSettings.getState().sharePrioritize);

  // Persist the chosen quality so toggleScreen (which reads useVideoSettings a
  // moment later) applies it, then hand the source back to the caller.
  const share = (id: string | null) => {
    if (id) useVideoSettings.getState().set({ shareRes: res, shareFps: fps, sharePrioritize: priority });
    choose({ id, audio: id ? audio : false });
  };

  // Fresh request → clean slate. One screen? Preselect it so Share is one click.
  useEffect(() => {
    if (!open) return;
    setAudio(true);
    const v = useVideoSettings.getState();
    setRes(v.shareRes);
    setFps(v.shareFps);
    setPriority(v.sharePrioritize);
    setSelected(sources.length === 1 ? sources[0].id : null);
  }, [open, sources]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") choose({ id: null, audio: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, choose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/55 p-4" onMouseDown={() => choose({ id: null, audio: false })}>
      <div
        role="dialog"
        aria-label="Choose a screen to share"
        className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-panel border border-line bg-paper shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3">
          <h2 className="text-[15px] font-semibold text-ink">{sources.length > 1 ? "Choose a screen to share" : "Share your screen"}</h2>
          <button
            onClick={() => choose({ id: null, audio: false })}
            aria-label="Cancel"
            className="ml-auto grid size-7 place-items-center rounded-control text-ink-faint hover:bg-field hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {sources.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-mute">No screen available to share.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  onDoubleClick={() => share(s.id)}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-control border text-left",
                    selected === s.id ? "border-accent ring-2 ring-accent/40" : "border-line hover:border-ink-faint",
                  )}
                >
                  <div className="grid aspect-video place-items-center bg-field">
                    {s.thumbnail ? (
                      <img src={s.thumbnail} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Monitor className="size-8 text-ink-faint" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 border-t border-line px-2 py-1.5">
                    <Monitor className="size-3.5 shrink-0 text-ink-faint" />
                    <span className="truncate text-[12.5px] text-ink">{s.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-line px-4 py-3">
          <label className="flex min-w-0 cursor-pointer items-center gap-2 text-[12.5px] text-ink-mute">
            <input
              type="checkbox"
              checked={audio}
              onChange={(e) => setAudio(e.target.checked)}
              className="size-3.5 shrink-0 accent-accent"
            />
            <span className="inline-flex items-center gap-1 font-medium text-ink">
              <Volume2 className="size-3.5 shrink-0" />
              Share computer audio
            </span>
          </label>

          {/* Quality / FPS / priority, chosen right here (Discord-style). */}
          <select
            value={res}
            onChange={(e) => setRes(e.target.value as ShareRes)}
            title="Resolution"
            className="rounded-control border border-line bg-field px-2 py-1 text-[12.5px] text-ink outline-none"
          >
            <option value="source">Source</option>
            <option value="1080">1080p</option>
            <option value="720">720p</option>
          </select>
          <select
            value={String(fps)}
            onChange={(e) => setFps(Number(e.target.value) as ShareFps)}
            title="Frame rate"
            className="rounded-control border border-line bg-field px-2 py-1 text-[12.5px] text-ink outline-none"
          >
            <option value="60">60 fps</option>
            <option value="30">30 fps</option>
            <option value="15">15 fps</option>
            <option value="5">5 fps</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as "detail" | "motion")}
            title="Optimize for"
            className="rounded-control border border-line bg-field px-2 py-1 text-[12.5px] text-ink outline-none"
          >
            <option value="detail">Text/detail</option>
            <option value="motion">Motion/video</option>
          </select>

          <button
            onClick={() => choose({ id: null, audio: false })}
            className="ml-auto shrink-0 rounded-control px-3 py-1.5 text-[13px] font-medium text-ink-mute hover:bg-field hover:text-ink"
          >
            Cancel
          </button>
          <button
            disabled={!selected}
            onClick={() => selected && share(selected)}
            className="shrink-0 rounded-control bg-accent px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            Share
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
