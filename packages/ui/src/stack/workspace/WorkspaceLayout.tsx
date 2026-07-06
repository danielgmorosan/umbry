import type { ReactNode } from "react";
import { cn } from "../../utils";

/** Three-pane workspace shell: sidebar · list · content. */
export function WorkspaceShell({
  sidebar,
  list,
  content,
  dock,
  footer,
  className,
}: {
  sidebar: ReactNode;
  list?: ReactNode;
  content: ReactNode;
  dock?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-[560px] flex-col bg-paper font-stack text-ink", className)}>
      <div className="relative flex min-h-0 flex-1">
        <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-line bg-paper-2">
          {sidebar}
        </aside>
        {list && (
          <div className="flex w-[300px] shrink-0 flex-col border-r border-line bg-paper">
            {list}
          </div>
        )}
        <main className="relative flex min-w-0 flex-1 flex-col bg-paper">{content}</main>
        {dock}
      </div>
      {footer}
    </div>
  );
}

export function WorkspacePaneHeader({
  title,
  actions,
  className,
}: {
  title: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line px-4",
        className,
      )}
    >
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {actions && <div className="flex items-center gap-1 text-ink-mute">{actions}</div>}
    </header>
  );
}

export function WorkspaceContentHeader({
  title,
  tabs,
  actions,
  className,
}: {
  title?: string;
  tabs?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("shrink-0 border-b border-line px-6 pt-5 pb-0", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        {title && <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>}
        {actions && <div className="flex items-center gap-1 text-ink-mute">{actions}</div>}
      </div>
      {tabs}
    </header>
  );
}

/** Centered empty state inside a list or content pane. */
export function PaneEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-5 text-ink-faint [&_svg]:size-12" aria-hidden>
          {icon}
        </div>
      )}
      <p className="text-[15px] font-medium text-ink-mute">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-ink-faint">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
