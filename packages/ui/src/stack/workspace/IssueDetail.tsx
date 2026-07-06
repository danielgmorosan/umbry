import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../utils";
import { Avatar } from "./Avatar";

/** Main content + right properties column. */
export function IssueDetailLayout({
  children,
  properties,
  className,
}: {
  children: ReactNode;
  properties?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1", className)}>
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      {properties && (
        <aside className="hidden w-[240px] shrink-0 border-l border-line bg-paper-2 lg:block">
          {properties}
        </aside>
      )}
    </div>
  );
}

export function DetailBreadcrumb({
  items,
  actions,
  className,
}: {
  items: Array<{ label: string; onClick?: () => void }>;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 border-b border-line px-6 py-3",
        className,
      )}
    >
      <nav aria-label="Issue path" className="flex min-w-0 items-center gap-1 text-[13px]">
        {items.map((item, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-ink-faint" />}
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="truncate text-ink-mute hover:text-ink transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="truncate text-ink-mute">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
      {actions}
    </header>
  );
}

export function IssueDetailBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-3xl px-6 py-8", className)}>{children}</div>
  );
}

export function IssueDetailTitle({
  title,
  description,
  meta,
  className,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
      {description && (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{description}</p>
      )}
      {meta && <div className="mt-4 flex items-center gap-3 text-ink-mute">{meta}</div>}
    </div>
  );
}

export function SubIssueSection({
  title = "Sub-issues",
  count,
  children,
  composer,
  className,
}: {
  title?: string;
  count?: number;
  children?: ReactNode;
  composer?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      <h2 className="mb-3 text-[13px] font-semibold text-ink">
        {title}
        {count !== undefined && (
          <span className="ml-1.5 font-normal text-ink-faint">{count}</span>
        )}
      </h2>
      {children && <div className="space-y-1">{children}</div>}
      {composer && <div className="mt-3">{composer}</div>}
    </section>
  );
}

export function SubIssueItem({
  done,
  title,
  tags,
  onToggle,
  className,
}: {
  done?: boolean;
  title: string;
  tags?: ReactNode;
  onToggle?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-control px-2 py-2 hover:bg-field/60 transition-colors",
        className,
      )}
    >
      <button
        type="button"
        aria-label={done ? "Mark incomplete" : "Mark complete"}
        onClick={onToggle}
        className={cn(
          "size-4 shrink-0 rounded-full border border-line-strong",
          done && "border-ink bg-ink",
        )}
      />
      <span className={cn("min-w-0 flex-1 text-[14px]", done ? "text-ink-mute line-through" : "text-ink")}>
        {title}
      </span>
      {tags && <span className="flex shrink-0 items-center gap-1">{tags}</span>}
    </div>
  );
}

/** Attribute chip in sub-issue / project composers. */
export function AttributeChip({
  icon,
  label,
  onClick,
  className,
}: {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      {icon && <span className="text-ink-mute [&_svg]:size-3.5">{icon}</span>}
      <span className="truncate">{label}</span>
    </>
  );

  const shell = cn(
    "inline-flex max-w-[140px] items-center gap-1.5 rounded-control",
    "border border-line bg-field px-2 py-1 text-[12px] text-ink-mute",
    "transition-colors hover:border-line-strong hover:text-ink",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(shell, "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]")}>
        {inner}
      </button>
    );
  }

  return <span className={shell}>{inner}</span>;
}

export function SubIssueComposer({
  titlePlaceholder = "Issue title",
  descriptionPlaceholder = "Add description…",
  chips,
  actions,
  className,
}: {
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  chips?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-paper p-4 shadow-[var(--st-shadow-card)]",
        className,
      )}
    >
      <input
        type="text"
        placeholder={titlePlaceholder}
        className="mb-2 w-full bg-transparent text-[14px] font-medium text-ink placeholder:text-ink-faint outline-none"
      />
      <textarea
        rows={2}
        placeholder={descriptionPlaceholder}
        className="mb-3 w-full resize-none bg-transparent text-[13px] text-ink-soft placeholder:text-ink-faint outline-none"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        {chips && <div className="flex flex-wrap items-center gap-1.5">{chips}</div>}
        {actions}
      </div>
    </div>
  );
}

export function ActivitySection({
  title = "Activity",
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-line pt-8", className)}>
      <h2 className="mb-4 text-[13px] font-semibold text-ink">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function ActivityEvent({
  avatar,
  children,
  className,
}: {
  avatar: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3", className)}>
      <div className="shrink-0">{avatar}</div>
      <div className="min-w-0 flex-1 text-[13px] text-ink-mute">{children}</div>
    </div>
  );
}

export function ActivityMessage({
  author,
  time,
  children,
  attachment,
  reply,
  className,
}: {
  author: string;
  time: string;
  children: ReactNode;
  attachment?: ReactNode;
  reply?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <ActivityEvent avatar={<Avatar name={author} size="sm" />}>
        <span>
          <span className="font-medium text-ink">{author}</span> {children}
          <span className="text-ink-faint"> · {time}</span>
        </span>
      </ActivityEvent>
      {attachment}
      {reply}
    </div>
  );
}

/** Larger comment box at the bottom of issue detail. */
export function CommentComposer({
  placeholder = "Leave a comment…",
  className,
}: {
  placeholder?: string;
  onSubmit?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-field px-4 py-3",
        "focus-within:border-line-strong focus-within:ring-2 focus-within:ring-[color:var(--st-ring)]",
        className,
      )}
    >
      <textarea
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent text-[14px] text-ink placeholder:text-ink-faint outline-none"
      />
      <div className="mt-2 flex justify-end gap-1 text-ink-faint">
        <button type="button" aria-label="Attach" className="rounded-control p-1.5 hover:bg-paper hover:text-ink">
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path fill="currentColor" d="M11.5 4.5 6.2 9.8a1.5 1.5 0 0 0 2.1 2.1l5.3-5.3a3 3 0 0 0-4.2-4.2L4.1 7.6a4.5 4.5 0 0 0 6.4 6.4l5.8-5.8-.7-.7-5.8 5.8a3.5 3.5 0 0 1-5-5l5.3-5.3a2 2 0 1 1 2.8 2.8L7.4 11.1a.5.5 0 1 1-.7-.7l5.3-5.3-.7-.7-5.3 5.3a1.5 1.5 0 0 0 2.1 2.1l5.3-5.3a3 3 0 0 0-4.2-4.2L3.4 8.9a4.5 4.5 0 0 0 6.4 6.4l6.5-6.5-.7-.7-6.5 6.5a3.5 3.5 0 0 1-5-5z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Send"
          className="inline-flex size-7 items-center justify-center rounded-full bg-ink text-paper"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
            <path fill="currentColor" d="M8 3.5a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L7.5 9.793V4a.5.5 0 0 1 .5-.5Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
