import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils";

export function WorkspaceSidebarHeader({
  workspace,
  actions,
  className,
}: {
  workspace: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-12 items-center justify-between gap-2 px-3", className)}>
      <div className="min-w-0 flex-1">{workspace}</div>
      {actions && <div className="flex shrink-0 items-center gap-0.5">{actions}</div>}
    </div>
  );
}

export function WorkspaceSwitcher({
  name,
  avatar,
  onClick,
  className,
}: {
  name: string;
  avatar?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      {avatar}
      <span className="truncate text-[13px] font-medium text-ink">{name}</span>
      <ChevronDown className="size-3.5 shrink-0 text-ink-faint" />
    </>
  );

  const base = cn(
    "flex min-w-0 items-center gap-2 rounded-control px-2 py-1.5",
    "hover:bg-field transition-colors",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(base, "w-full outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]")}>
        {inner}
      </button>
    );
  }

  return <div className={base}>{inner}</div>;
}

export function NavSection({
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

export function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
  className,
}: {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  badge?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left",
        "text-[13px] transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]",
        active
          ? "bg-field font-medium text-ink"
          : "text-ink-mute hover:bg-field/60 hover:text-ink",
        className,
      )}
    >
      {icon && <span className="shrink-0 text-ink-mute [&_svg]:size-4">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge}
    </button>
  );
}

export function NavBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "ml-auto shrink-0 rounded-full bg-field px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-ink-mute",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SidebarCard({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-2 mb-2 rounded-control border border-line bg-paper p-3",
        className,
      )}
    >
      <p className="text-[12px] font-semibold text-ink">{title}</p>
      <p className="mt-0.5 text-[12px] leading-snug text-ink-mute">{description}</p>
    </div>
  );
}
