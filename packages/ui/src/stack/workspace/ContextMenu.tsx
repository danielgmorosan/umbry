import type { ReactNode } from "react";
import { cn } from "../../utils";

export function ContextMenu({
  items,
  className,
}: {
  items: Array<{
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    destructive?: boolean;
  }>;
  className?: string;
}) {
  return (
    <div
      role="menu"
      className={cn(
        "min-w-[200px] overflow-hidden rounded-card border border-line bg-paper py-1",
        "shadow-[var(--st-shadow-card)]",
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          onClick={item.onClick}
          className={cn(
            "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px]",
            "transition-colors hover:bg-field outline-none",
            item.destructive ? "text-negative" : "text-ink",
          )}
        >
          {item.icon && (
            <span className="shrink-0 text-ink-mute [&_svg]:size-4">{item.icon}</span>
          )}
          {item.label}
        </button>
      ))}
    </div>
  );
}
