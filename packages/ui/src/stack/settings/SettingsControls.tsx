import { cn } from "../../utils";

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
  className,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]",
        checked ? "bg-ink" : "bg-line-strong",
        disabled && "opacity-40 pointer-events-none",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block size-3.5 rounded-full bg-paper shadow-sm transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}

export function SelectControl({
  value,
  placeholder,
  className,
}: {
  value?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[120px] items-center justify-between gap-2 rounded-control",
        "border border-line bg-field px-2.5 py-1.5 text-[13px]",
        value ? "text-ink" : "text-ink-faint",
        className,
      )}
    >
      {value ?? placeholder}
      <svg viewBox="0 0 16 16" className="size-3.5 text-ink-faint" aria-hidden>
        <path fill="currentColor" d="M4.5 6 8 9.5 11.5 6z" />
      </svg>
    </span>
  );
}

export function CopyField({
  value,
  onCopy,
  className,
}: {
  value: string;
  onCopy?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        readOnly
        value={value}
        className="min-w-0 flex-1 rounded-control border border-line bg-field px-3 py-2 text-[13px] text-ink-mute outline-none"
      />
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 rounded-control border border-line bg-field px-3 py-2 text-[13px] font-medium text-ink hover:bg-paper-2 transition-colors"
      >
        Copy
      </button>
    </div>
  );
}
