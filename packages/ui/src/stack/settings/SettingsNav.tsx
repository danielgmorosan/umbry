import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../utils";

export function SettingsBackLink({
  label = "Back to app",
  onClick,
  className,
}: {
  label?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mb-2 flex w-full items-center gap-2 rounded-control px-3 py-2 text-left",
        "text-[13px] text-ink-mute hover:bg-field hover:text-ink transition-colors",
        "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]",
        className,
      )}
    >
      <ChevronRight className="size-3.5 rotate-180" />
      {label}
    </button>
  );
}

export function SettingsNavSection({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-2 py-1", className)}>
      {label && (
        <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          {label}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function SettingsNavItem({
  icon,
  label,
  active,
  onClick,
  className,
}: {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-[13px]",
        "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]",
        active ? "bg-field font-medium text-ink" : "text-ink-mute hover:bg-field/60 hover:text-ink",
        className,
      )}
    >
      {icon && <span className="shrink-0 text-ink-mute [&_svg]:size-4">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
}
