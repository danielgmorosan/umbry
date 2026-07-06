import type { ReactNode } from "react";
import { cn } from "../../utils";

export function SearchHeader({
  value,
  onChange,
  placeholder = "Search…",
  tabs,
  actions,
  className,
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  tabs?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b border-line", className)}>
      <div className="px-4 py-3">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint outline-none"
        />
      </div>
      {(tabs || actions) && (
        <div className="flex items-center justify-between gap-3 px-4 pb-2">
          {tabs}
          {actions}
        </div>
      )}
    </header>
  );
}

export function SearchFilterTabs({
  items,
  value,
  onChange,
  className,
}: {
  items: Array<{ id: string; label: string }>;
  value: string;
  onChange?: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1", className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          onClick={() => onChange?.(item.id)}
          className={cn(
            "rounded-control px-2.5 py-1 text-[13px] transition-colors",
            value === item.id
              ? "bg-field font-medium text-ink"
              : "text-ink-mute hover:text-ink",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function SearchResultRow({
  type,
  icon,
  title,
  meta,
  time,
  onClick,
  className,
}: {
  type: string;
  icon?: ReactNode;
  title: string;
  meta?: string;
  time: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left",
        "transition-colors hover:bg-paper-2 outline-none focus-visible:bg-field",
        className,
      )}
    >
      <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        {type}
      </span>
      {icon && <span className="shrink-0 text-ink-mute [&_svg]:size-4">{icon}</span>}
      <span className="min-w-0 flex-1">
        {meta && (
          <span className="mr-2 font-mono text-[12px] text-ink-faint">{meta}</span>
        )}
        <span className="text-[14px] text-ink">{title}</span>
      </span>
      <span className="shrink-0 text-[12px] tabular-nums text-ink-faint">{time}</span>
    </button>
  );
}
