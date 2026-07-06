import type { ReactNode } from "react";
import { cn } from "../utils";

/**
 * Centered focal state — "Check your email", "Welcome to …".
 * One icon (or app tile), a bold title, one line of support text,
 * then stacked actions.
 */
export function EmptyState({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {icon && <div className="mb-5 text-ink [&_svg]:size-10">{icon}</div>}
      <h2 className="text-2xl font-bold tracking-tight text-ink">{title}</h2>
      {description && (
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-mute">{description}</p>
      )}
      {children && <div className="mt-7 w-full max-w-xs space-y-3">{children}</div>}
    </div>
  );
}

/** Rounded app-icon tile used above welcome/confirmation states. */
export function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "size-16 rounded-card border border-line bg-paper shadow-[var(--st-shadow-card)]",
        "flex items-center justify-center text-ink [&_svg]:size-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
