import type { ReactNode } from "react";
import { Clock, Sparkles } from "lucide-react";
import { cn } from "../../utils";

/** Bottom-right "Ask Umbry" trigger docked over workspace content. */
export function AskDock({
  label = "Ask Umbry",
  onAsk,
  onHistory,
  className,
}: {
  label?: string;
  onAsk?: () => void;
  onHistory?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-4 right-4 z-10 flex items-center gap-2",
        className,
      )}
    >
      <button
        type="button"
        onClick={onAsk}
        className={cn(
          "pointer-events-auto inline-flex items-center gap-2 rounded-control",
          "bg-paper/90 px-3 py-1.5 text-[13px] font-medium text-ink-mute backdrop-blur-sm",
          "border border-line shadow-[var(--st-shadow-card)]",
          "transition-colors hover:bg-field hover:text-ink",
          "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]",
        )}
      >
        <Sparkles className="size-3.5" strokeWidth={1.75} />
        {label}
      </button>
      {onHistory && (
        <button
          type="button"
          aria-label="Chat history"
          onClick={onHistory}
          className={cn(
            "pointer-events-auto inline-flex size-8 items-center justify-center rounded-control",
            "bg-paper/90 text-ink-mute backdrop-blur-sm border border-line",
            "transition-colors hover:bg-field hover:text-ink",
            "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]",
          )}
        >
          <Clock className="size-3.5" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

/** Icon-only header action button for pane toolbars. */
export function PaneIconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-control",
        "text-ink-faint hover:bg-field hover:text-ink transition-colors",
        "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
