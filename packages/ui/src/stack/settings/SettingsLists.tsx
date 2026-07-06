import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "../../utils";

export function IntegrationGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>{children}</div>
  );
}

export function IntegrationCard({
  icon,
  title,
  description,
  onClick,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      {icon && (
        <div className="mb-3 flex size-8 items-center justify-center rounded-control bg-field text-ink [&_svg]:size-4">
          {icon}
        </div>
      )}
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-mute">{description}</p>
    </>
  );

  const shell = cn(
    "rounded-card border border-line bg-paper p-4 text-left",
    "transition-colors hover:border-line-strong hover:bg-paper-2",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(shell, "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]")}>
        {inner}
      </button>
    );
  }

  return <div className={shell}>{inner}</div>;
}

export function EmptySettingsBox({
  label,
  actionLabel = "New",
  onAction,
  className,
}: {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-card border border-line bg-paper px-4 py-3",
        className,
      )}
    >
      <span className="text-[14px] text-ink-mute">{label}</span>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-[13px] font-medium text-ink hover:bg-field transition-colors"
        >
          <Plus className="size-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function StatusListRow({
  dot,
  label,
  onClick,
  className,
}: {
  dot?: string;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      {dot && <span className="size-2 rounded-full" style={{ backgroundColor: dot }} />}
      <span className="text-[14px] text-ink">{label}</span>
    </>
  );

  const shell = cn("flex items-center gap-2.5 px-4 py-2.5", className);

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(shell, "w-full hover:bg-paper-2 transition-colors")}>
        {inner}
      </button>
    );
  }

  return <div className={shell}>{inner}</div>;
}

export function SettingsListRow({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
  className,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      {icon && <span className="shrink-0 text-ink-mute [&_svg]:size-4">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium text-ink">{title}</span>
        {subtitle && <span className="block text-[12px] text-ink-mute">{subtitle}</span>}
      </span>
      {trailing}
    </>
  );

  const shell = cn(
    "flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0",
    onClick && "hover:bg-paper-2 transition-colors",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(shell, "w-full text-left outline-none")}>
        {inner}
      </button>
    );
  }

  return <div className={shell}>{inner}</div>;
}
