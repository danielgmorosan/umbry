import { cn } from "../utils";

/** Hairline divider with an optional centered label — "Or continue with". */
export function LabeledDivider({ label, className }: { label?: string; className?: string }) {
  if (!label) return <hr className={cn("border-line", className)} />;
  return (
    <div className={cn("flex items-center gap-4", className)} role="separator">
      <span className="h-px flex-1 bg-line" />
      <span className="text-sm text-ink-mute">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
