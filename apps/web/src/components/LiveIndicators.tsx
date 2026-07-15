import { cn } from "@/lib/utils";

/**
 * Live-state indicators (T3). One visual language for "a call is live":
 * animated equalizer bars, phase-shifted so they read as audio. Replaces the
 * various animate-ping dots, which read more "alarm" than "live".
 */
export function LiveBars({
  className,
  bar,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { bar?: string }) {
  return (
    <span className={cn("inline-flex h-3 shrink-0 items-end gap-[2px]", className)} {...rest}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className={cn("w-[3px] origin-bottom rounded-full bg-positive", bar)}
          style={{ animation: `eq-bar 1.1s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
    </span>
  );
}

/** Small status dot that breathes gently (live/E2E pills). */
export function BreathingDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("size-1.5 shrink-0 rounded-full bg-positive", className)}
      style={{ animation: "soft-breathe 2.4s ease-in-out infinite" }}
    />
  );
}
