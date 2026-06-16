import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PaneHeader({
  icon,
  title,
  subtitle,
  badge,
  actions,
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-canvas/80 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <h1 className="truncate font-display text-[16px] font-bold text-text">{title}</h1>
        {badge}
      </div>
      {subtitle && (
        <>
          <div className="h-4 w-px bg-border" />
          <div className="hidden min-w-0 truncate text-[13px] text-muted md:block">{subtitle}</div>
        </>
      )}
      <div className="ml-auto flex items-center gap-1.5">{actions}</div>
    </header>
  );
}

export function HeaderIconButton({
  children,
  active,
  label,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={cn(
        "grid size-9 place-items-center rounded-lg border transition-colors",
        active
          ? "border-[color:var(--accent)]/40 bg-[color:var(--accent-faint)] text-accent"
          : "border-transparent text-muted hover:border-border hover:bg-surface-raised hover:text-text",
      )}
    >
      {children}
    </button>
  );
}
