import type { ReactNode } from "react";
import { cn } from "../../utils";

/**
 * Centered AI workspace shell — max-width column with optional
 * watermark and sticky composer at the bottom.
 */
export function AiChatShell({
  children,
  watermark,
  className,
}: {
  children: ReactNode;
  watermark?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex min-h-full flex-col bg-paper font-stack text-ink", className)}>
      {watermark}
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
        {children}
      </div>
    </div>
  );
}

/** Welcome-state column: hero, composer, optional suggestions. */
export function AiChatWelcomeLayout({
  hero,
  composer,
  suggestions,
  className,
}: {
  hero: ReactNode;
  composer: ReactNode;
  suggestions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center gap-8 py-10", className)}>
      {hero}
      <div className="w-full max-w-2xl">{composer}</div>
      {suggestions && <div className="w-full max-w-2xl">{suggestions}</div>}
    </div>
  );
}

/** Active thread: scrollable messages with composer pinned at bottom. */
export function AiChatThreadLayout({
  header,
  children,
  composer,
  className,
}: {
  header?: ReactNode;
  children: ReactNode;
  composer: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-[32rem] flex-1 flex-col", className)}>
      {header}
      <div className="flex-1 space-y-8 overflow-y-auto py-6 pr-1">{children}</div>
      <div className="sticky bottom-0 bg-paper pt-4 pb-2">
        <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-paper to-transparent" />
        {composer}
      </div>
    </div>
  );
}

/** Step dots for multi-step onboarding beside the composer. */
export function AiStepDots({
  total,
  current,
  className,
}: {
  total: number;
  current: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)} role="tablist">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          role="tab"
          aria-selected={i === current}
          className={cn(
            "size-1.5 rounded-full transition-colors",
            i === current ? "bg-ink-mute" : "bg-line-strong",
          )}
        />
      ))}
    </div>
  );
}
