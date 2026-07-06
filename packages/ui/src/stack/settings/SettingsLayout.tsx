import type { ReactNode } from "react";
import { cn } from "../../utils";

/** Settings shell: narrow nav sidebar + scrollable content. */
export function SettingsLayout({
  sidebar,
  children,
  className,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-[560px] bg-paper font-stack text-ink", className)}>
      <aside className="w-[220px] shrink-0 overflow-y-auto border-r border-line bg-paper-2 py-3">
        {sidebar}
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}

export function SettingsPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 flex items-start justify-between gap-4", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-ink-mute">{description}</p>
        )}
      </div>
      {actions}
    </header>
  );
}

export function SettingsGroup({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 text-[13px] text-ink-mute">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function SettingsCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-card border border-line bg-paper", className)}>
      {children}
    </div>
  );
}

export function SettingsRow({
  label,
  description,
  control,
  onClick,
  className,
}: {
  label: string;
  description?: ReactNode;
  control?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-ink">{label}</p>
        {description && (
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-mute">{description}</p>
        )}
      </div>
      {control && <div className="shrink-0">{control}</div>}
    </>
  );

  const shell = cn(
    "flex items-center justify-between gap-4 border-b border-line px-4 py-3.5 last:border-b-0",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(shell, "w-full text-left hover:bg-paper-2 transition-colors outline-none focus-visible:bg-field")}>
        {inner}
      </button>
    );
  }

  return <div className={shell}>{inner}</div>;
}
