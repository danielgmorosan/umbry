import { cn } from "./utils";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-surface-inset p-1",
        size === "sm" ? "text-[13px]" : "text-sm",
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 font-medium transition-colors",
              size === "sm" ? "h-7" : "h-8",
              active
                ? "bg-surface-raised text-text shadow-sm border border-border"
                : "text-muted hover:text-text",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
