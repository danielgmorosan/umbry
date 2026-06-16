import { cn } from "./utils";

export function Toggle({
  checked,
  onChange,
  disabled,
  size = "md",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? { w: 36, h: 20, k: 14 } : { w: 44, h: 24, k: 18 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative shrink-0 rounded-full transition-colors duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]",
        checked ? "bg-accent" : "bg-slate",
        disabled && "opacity-45 pointer-events-none",
      )}
      style={{ width: dims.w, height: dims.h }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200"
        style={{
          width: dims.k,
          height: dims.k,
          left: checked ? dims.w - dims.k - 3 : 3,
        }}
      />
    </button>
  );
}
