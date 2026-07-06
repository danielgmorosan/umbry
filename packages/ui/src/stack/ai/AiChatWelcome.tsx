import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils";

/** Faint circular watermark behind the welcome hero. */
export function AiChatWatermark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2",
        "size-[min(72vw,28rem)] rounded-full",
        "border border-line/40",
        "bg-[radial-gradient(circle_at_30%_30%,var(--st-field)_0%,transparent_65%)]",
        "opacity-60",
        className,
      )}
    />
  );
}

export function AiChatHero({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative text-center", className)}>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-[15px] text-ink-mute">{subtitle}</p>
      )}
    </div>
  );
}

export function AiSuggestionGrid({
  title = "Get started with some examples",
  onDismiss,
  children,
  className,
}: {
  title?: string;
  onDismiss?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-ink-mute">{title}</p>
        {onDismiss && (
          <button
            type="button"
            aria-label="Dismiss suggestions"
            onClick={onDismiss}
            className="rounded-control p-1 text-ink-faint hover:bg-field hover:text-ink transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">{children}</div>
    </div>
  );
}

export function AiSuggestionCard({
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
        <div className="mb-3 text-ink [&_svg]:size-[18px]">{icon}</div>
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

/** Three-column onboarding tip row (final step pattern). */
export function AiOnboardingTips({
  items,
  className,
}: {
  items: Array<{ icon: ReactNode; title: string; description: ReactNode }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid overflow-hidden rounded-card border border-line sm:grid-cols-3",
        className,
      )}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "p-5 sm:p-6",
            i > 0 && "border-t border-line sm:border-t-0 sm:border-l",
          )}
        >
          <div className="mb-3 flex size-8 items-center justify-center rounded-control bg-field text-ink [&_svg]:size-4">
            {item.icon}
          </div>
          <p className="text-[14px] font-semibold text-ink">{item.title}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-mute">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
