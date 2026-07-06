import type { ReactNode } from "react";
import { cn } from "../../utils";

export function PropertiesPanel({
  children,
  actions,
  className,
}: {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      {actions && (
        <div className="flex items-center justify-end gap-1 border-b border-line px-3 py-2">
          {actions}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-3 py-4">{children}</div>
    </div>
  );
}

export function PropertySection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-6", className)}>
      <h3 className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

export function PropertyRow({
  icon,
  label,
  value,
  onClick,
  className,
}: {
  icon?: ReactNode;
  label: string;
  value?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      {icon && <span className="shrink-0 text-ink-faint [&_svg]:size-4">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{value ?? label}</span>
    </>
  );

  const base = cn(
    "flex w-full items-center gap-2.5 rounded-control px-2 py-1.5 text-left text-[13px]",
    value ? "text-ink" : "text-ink-mute",
    "transition-colors",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(base, "hover:bg-field outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]")}
      >
        {content}
      </button>
    );
  }

  return <div className={base}>{content}</div>;
}
