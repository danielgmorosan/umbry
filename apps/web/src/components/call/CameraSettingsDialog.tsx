import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Video, Sparkles, Image as ImageIcon, Ban, Loader2 } from "lucide-react";
import { Button, StackModal, ModalBody } from "@umbry/ui/stack";
import { type Room } from "livekit-client";
import { useVideoSettings, type CamPreset } from "@/stores/useVideoSettings";
import { applyCameraBackground, backgroundEffectsSupported, fileToBackgroundDataUrl } from "@/lib/cameraBackground";
import { useCall } from "@/stores/useCall";
import { cn } from "@/lib/utils";

/**
 * In-call camera settings (T4): reachable by right-clicking your own tile →
 * "Camera settings". Camera device + background apply live to the running
 * call; the capture-quality preset applies on your next call join.
 */
export function CameraSettingsDialog({ room, onClose }: { room: Room; onClose: () => void }) {
  const video = useVideoSettings();
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [busy, setBusy] = useState(false);
  const supported = backgroundEffectsSupported();

  useEffect(() => {
    void navigator.mediaDevices
      ?.enumerateDevices()
      .then((d) => setCams(d.filter((x) => x.kind === "videoinput")))
      .catch(() => {});
  }, []);

  const setBackground = async (bg: "none" | "blur" | "image") => {
    video.set({ background: bg });
    setBusy(true);
    await applyCameraBackground(room);
    setBusy(false);
  };

  const uploadImage = (file: File) => {
    void fileToBackgroundDataUrl(file).then(async (dataUrl) => {
      video.set({ backgroundImage: dataUrl, background: "image" });
      setBusy(true);
      await applyCameraBackground(room);
      setBusy(false);
    });
  };

  const bgOptions = [
    { id: "none" as const, icon: Ban, label: "None" },
    { id: "blur" as const, icon: Sparkles, label: "Blur" },
    { id: "image" as const, icon: ImageIcon, label: "Image" },
  ];

  return (
    <StackModal onClose={onClose} width="md">
      <ModalBody>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
          <Video className="size-4" /> Camera settings
          {busy && <Loader2 className="size-4 animate-spin text-ink-faint" />}
        </h2>
        <p className="mb-4 text-[12.5px] text-ink-mute">Applies to this call right away.</p>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Camera</div>
            <select
              value=""
              onChange={(e) => void useCall.getState().switchDevice("videoinput", e.target.value)}
              className="w-full rounded-control border border-line bg-field px-2.5 py-2 text-[13px] text-ink outline-none focus:border-line-strong"
            >
              <option value="" disabled>
                {cams.length ? "Switch camera…" : "No cameras found"}
              </option>
              {cams.map((c, i) => (
                <option key={c.deviceId || i} value={c.deviceId}>
                  {c.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Capture quality</div>
            <select
              value={video.camPreset}
              onChange={(e) => video.set({ camPreset: e.target.value as CamPreset })}
              className="w-full rounded-control border border-line bg-field px-2.5 py-2 text-[13px] text-ink outline-none focus:border-line-strong"
            >
              <option value="auto">Auto (720p)</option>
              <option value="1080">1080p</option>
              <option value="720">720p</option>
              <option value="360">360p (low bandwidth)</option>
            </select>
            <p className="mt-1 text-[11px] text-ink-faint">Applies to your next call.</p>
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Background</div>
            {supported ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {bgOptions.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => void setBackground(o.id)}
                      disabled={busy}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-control border p-2.5 transition-colors",
                        video.background === o.id ? "border-ink bg-field text-ink" : "border-line text-ink-mute hover:border-line-strong",
                      )}
                    >
                      <o.icon className="size-4" />
                      <span className="text-[12px] font-medium">{o.label}</span>
                    </button>
                  ))}
                </div>
                {video.background === "image" && (
                  <label className="mt-2 flex cursor-pointer items-center gap-2.5">
                    {video.backgroundImage && (
                      <img src={video.backgroundImage} alt="Background" className="h-9 w-14 rounded-control border border-line object-cover" />
                    )}
                    <span className="rounded-control border border-line bg-field px-3 py-1.5 text-[13px] text-ink hover:border-line-strong">
                      {video.backgroundImage ? "Change image…" : "Upload image…"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadImage(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </>
            ) : (
              <p className="text-[12.5px] text-ink-faint">Background effects aren't supported by this browser.</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Link to="/settings/calls" onClick={onClose} className="text-[13px] text-ink-mute underline underline-offset-2 hover:text-ink">
            All call settings
          </Link>
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </ModalBody>
    </StackModal>
  );
}
