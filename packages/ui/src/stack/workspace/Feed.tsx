import type { ReactNode } from "react";
import { ArrowRight, Paperclip, Sparkles } from "lucide-react";
import { cn } from "../../utils";
import { Avatar } from "./Avatar";

export function StatusPill({
  label,
  tone = "neutral",
  icon,
  className,
}: {
  label: string;
  tone?: "positive" | "warning" | "neutral";
  icon?: ReactNode;
  className?: string;
}) {
  const tones = {
    positive: "text-positive",
    warning: "text-ink-mute",
    neutral: "text-ink-mute",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-control bg-field px-2 py-0.5",
        "text-[12px] font-medium",
        tones[tone],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}

export function PulseUpdateCard({
  title,
  status,
  author,
  time,
  children,
  statusTransition,
  reply,
  className,
}: {
  title: string;
  status?: ReactNode;
  author: string;
  time: string;
  children: ReactNode;
  statusTransition?: ReactNode;
  reply?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-card border border-line bg-paper p-5 shadow-[var(--st-shadow-card)]",
        className,
      )}
    >
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {status}
      </header>
      <div className="mb-4 flex items-center gap-2 text-[12px] text-ink-mute">
        <Avatar name={author} size="sm" />
        <span>{author}</span>
        <span className="text-ink-faint">·</span>
        <span>{time}</span>
      </div>
      <div className="space-y-3 text-[14px] leading-relaxed text-ink-soft">{children}</div>
      {statusTransition && (
        <div className="mt-4 flex items-center gap-2 text-[12px] text-ink-mute">
          {statusTransition}
        </div>
      )}
      {reply && <div className="mt-4 border-t border-line pt-4">{reply}</div>}
    </article>
  );
}

export function StatusTransition({
  from,
  to,
  className,
}: {
  from: ReactNode;
  to: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-ink-faint">Status</span>
      {from}
      <ArrowRight className="size-3 text-ink-faint" />
      {to}
    </div>
  );
}

/** Compact inline reply field at the bottom of feed cards. */
export function InlineReplyComposer({
  placeholder = "Leave a reply…",
  onSubmit,
  className,
}: {
  placeholder?: string;
  onSubmit?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-card border border-line bg-field px-3 py-2.5",
        className,
      )}
    >
      <input
        type="text"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-faint outline-none"
      />
      <button
        type="button"
        aria-label="Attach"
        className="text-ink-faint hover:text-ink transition-colors"
      >
        <Paperclip className="size-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Send reply"
        onClick={onSubmit}
        className="inline-flex size-7 items-center justify-center rounded-full bg-ink text-paper"
      >
        <svg viewBox="0 0 16 16" aria-hidden className="size-3.5">
          <path
            fill="currentColor"
            d="M8 3.5a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L7.5 9.793V4a.5.5 0 0 1 .5-.5Z"
          />
        </svg>
      </button>
    </div>
  );
}

/** Horizontal AI-generated draft card (Drafts view). */
export function DraftUpdateCard({
  title,
  preview,
  time,
  onClick,
  className,
}: {
  title: string;
  preview: string;
  time: string;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="size-3.5 text-positive" strokeWidth={1.75} />
        <span className="truncate text-[13px] font-semibold text-ink">{title}</span>
        <span className="ml-auto shrink-0 text-[11px] text-ink-faint">{time}</span>
      </div>
      <p className="line-clamp-3 text-[12px] leading-relaxed text-ink-mute">{preview}</p>
    </>
  );

  const shell = cn(
    "w-[220px] shrink-0 rounded-card border border-line bg-paper p-3 text-left",
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

export function MetadataRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]", className)}>
      <span className="text-ink-faint">{label}</span>
      {children}
    </div>
  );
}
