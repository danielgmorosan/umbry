import type { ReactNode } from "react";
import { ChevronDown, GripVertical, X } from "lucide-react";
import { cn } from "../../utils";

export function CustomizeSidebarModal({
  title = "Customize sidebar",
  onClose,
  children,
  className,
}: {
  title?: string;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6">
      <div
        role="dialog"
        aria-modal
        className={cn(
          "w-full max-w-md rounded-card border border-line bg-paper shadow-[var(--st-shadow-card)]",
          className,
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {onClose && (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="rounded-control p-1 text-ink-faint hover:bg-field hover:text-ink"
            >
              <X className="size-4" />
            </button>
          )}
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-3 py-4">{children}</div>
      </div>
    </div>
  );
}

export function CustomizeSection({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-5", className)}>
      <h3 className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

export function CustomizeRow({
  icon,
  label,
  visibility = "Always show",
  muted,
  className,
}: {
  icon?: ReactNode;
  label: string;
  visibility?: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-control px-2 py-2",
        muted && "opacity-50",
        className,
      )}
    >
      <GripVertical className="size-4 shrink-0 cursor-grab text-ink-faint" aria-hidden />
      {icon && <span className="shrink-0 text-ink-mute [&_svg]:size-4">{icon}</span>}
      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{label}</span>
      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-1 rounded-control border border-line bg-field px-2 py-1 text-[11px] text-ink-mute hover:text-ink"
      >
        {visibility}
        <ChevronDown className="size-3" />
      </button>
    </div>
  );
}

export function CustomizeSettingRow({
  label,
  control,
  className,
}: {
  label: string;
  control: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-control px-2 py-2.5",
        className,
      )}
    >
      <span className="text-[13px] text-ink">{label}</span>
      {control}
    </div>
  );
}
