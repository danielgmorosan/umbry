import type { ReactNode } from "react";
import { cn } from "../../utils";
import { Avatar } from "./Avatar";

export function InboxRow({
  icon,
  title,
  subtitle,
  time,
  unread,
  trailing,
  active,
  onClick,
  className,
}: {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  time: string;
  unread?: boolean;
  trailing?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-2.5 border-b border-line px-3 py-3 text-left",
        "transition-colors outline-none focus-visible:bg-field",
        active ? "bg-field" : "hover:bg-paper-2",
        className,
      )}
    >
      <span className="mt-2 flex w-2 shrink-0 justify-center">
        {unread && <span className="size-1.5 rounded-full bg-ink-mute" aria-label="Unread" />}
      </span>
      {icon && (
        <span className="mt-0.5 shrink-0 text-ink-mute [&_svg]:size-4">{icon}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-ink">{title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-ink-mute">{subtitle}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[11px] tabular-nums text-ink-faint">{time}</span>
        {trailing}
      </span>
    </button>
  );
}

export function IssueTag({
  label,
  dot,
  icon,
  className,
}: {
  label: string;
  dot?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-control bg-field px-1.5 py-0.5",
        "text-[11px] text-ink-mute",
        className,
      )}
    >
      {dot && (
        <span className="size-1.5 rounded-full" style={{ backgroundColor: dot }} aria-hidden />
      )}
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}

export function IssueRow({
  priority,
  id,
  title,
  age,
  tags,
  assignee,
  dateRange,
  onClick,
  className,
}: {
  priority?: ReactNode;
  id: string;
  title: string;
  age?: string;
  tags?: ReactNode;
  assignee?: { name: string; id?: string };
  dateRange?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b border-line px-4 py-2.5 text-left",
        "text-[13px] transition-colors hover:bg-paper-2 outline-none focus-visible:bg-field",
        className,
      )}
    >
      {priority && <span className="shrink-0 text-ink-faint [&_svg]:size-3.5">{priority}</span>}
      <span className="shrink-0 font-mono text-[12px] text-ink-faint">{id}</span>
      {age && <span className="shrink-0 text-[12px] text-ink-faint">{age}</span>}
      <span className="min-w-0 flex-1 truncate font-medium text-ink">{title}</span>
      {tags && <span className="hidden shrink-0 items-center gap-1 sm:flex">{tags}</span>}
      {assignee && <Avatar name={assignee.name} id={assignee.id} size="sm" />}
      {dateRange && (
        <span className="hidden shrink-0 text-[12px] text-ink-faint lg:inline">{dateRange}</span>
      )}
    </button>
  );
}

export function ListGroupHeader({
  label,
  count,
  className,
}: {
  label: string;
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-line bg-paper-2 px-4 py-2",
        "text-[12px] font-medium text-ink-mute",
        className,
      )}
    >
      <span>{label}</span>
      {count !== undefined && <span className="text-ink-faint">{count}</span>}
    </div>
  );
}
