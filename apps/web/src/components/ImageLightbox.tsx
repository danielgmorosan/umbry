import { useEffect } from "react";
import { create } from "zustand";
import { X, ExternalLink } from "lucide-react";

/**
 * Image lightbox (T3): clicking any inline image opens it in an in-app
 * overlay instead of a new tab. One global instance (mounted in main.tsx);
 * any image render site calls useLightbox.getState().open(...).
 */
interface LightboxImage {
  src: string;
  alt?: string;
  /** Original URL for "open in new tab" (defaults to src). */
  href?: string;
}

export const useLightbox = create<{
  image: LightboxImage | null;
  open: (image: LightboxImage) => void;
  close: () => void;
}>((set) => ({
  image: null,
  open: (image) => set({ image }),
  close: () => set({ image: null }),
}));

export function ImageLightbox() {
  const image = useLightbox((s) => s.image);
  const { close } = useLightbox.getState();

  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [image, close]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-6 font-stack backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        <a
          href={image.href ?? image.src}
          target="_blank"
          rel="noopener noreferrer"
          title="Open original in a new tab"
          className="grid size-9 place-items-center rounded-control bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ExternalLink className="size-4" />
        </a>
        <button
          onClick={close}
          aria-label="Close"
          className="grid size-9 place-items-center rounded-control bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X className="size-4" />
        </button>
      </div>
      <img
        src={image.src}
        alt={image.alt ?? ""}
        className="max-h-[calc(100vh-96px)] max-w-[calc(100vw-48px)] rounded-card object-contain shadow-2xl"
      />
      {image.alt && <div className="absolute bottom-4 max-w-[80vw] truncate text-[13px] text-white/70">{image.alt}</div>}
    </div>
  );
}
