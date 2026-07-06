import { cn } from "../../utils";

export function TabPills({
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
    <div className={cn("flex flex-wrap gap-1 pb-3", className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          onClick={() => onChange?.(item.id)}
          className={cn(
            "rounded-control px-2.5 py-1 text-[13px] transition-colors outline-none",
            "focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]",
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
