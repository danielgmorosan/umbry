import { Track, type LocalVideoTrack, type Room } from "livekit-client";
import { BackgroundBlur, VirtualBackground, supportsBackgroundProcessors } from "@livekit/track-processors";
import { useVideoSettings } from "@/stores/useVideoSettings";

/**
 * Camera background effects (T4): blur or a custom image, via LiveKit's
 * MediaPipe track processors. Runs entirely on-device (the segmentation
 * never leaves the GPU), which fits the privacy posture. Chromium-only in
 * practice - unsupported browsers silently keep the raw camera.
 */

export function backgroundEffectsSupported(): boolean {
  try {
    return supportsBackgroundProcessors();
  } catch {
    return false;
  }
}

/** Apply the persisted background choice to the live camera track, if any. */
export async function applyCameraBackground(room: Room): Promise<void> {
  const track = room.localParticipant.getTrackPublication(Track.Source.Camera)?.track as LocalVideoTrack | undefined;
  if (!track) return;
  const v = useVideoSettings.getState();
  try {
    if (v.background === "blur" && backgroundEffectsSupported()) {
      await track.setProcessor(BackgroundBlur(10));
    } else if (v.background === "image" && v.backgroundImage && backgroundEffectsSupported()) {
      await track.setProcessor(VirtualBackground(v.backgroundImage));
    } else {
      await track.stopProcessor();
    }
  } catch (e) {
    console.error("camera background effect failed", e);
    try {
      await track.stopProcessor();
    } catch {
      /* raw camera it is */
    }
  }
}

/** Compress an uploaded background to a reasonable data-URI (persisted locally). */
export async function fileToBackgroundDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const MAX_W = 1600;
  const scale = Math.min(1, MAX_W / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process that image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}
