import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../utils";

/** Breadcrumb trail above an active thread — "Ask Gossip › …". */
export function AiChatBreadcrumb({
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
        "flex items-center justify-between gap-4 border-b border-line px-1 pb-4",
        className,
      )}
    >
      <nav aria-label="Conversation" className="flex min-w-0 items-center gap-1 text-[13px]">
        {items.map((item, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-ink-faint" aria-hidden />}
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="truncate text-ink-mute hover:text-ink transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="truncate font-medium text-ink">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
      {actions}
    </header>
  );
}

/** Right-aligned user turn — light gray bubble in light mode, raised field in dark. */
export function AiUserBubble({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex justify-end", className)}>
      <div
        className={cn(
          "max-w-[min(100%,42rem)] rounded-card bg-field px-4 py-3",
          "text-[15px] leading-relaxed text-ink whitespace-pre-wrap",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Attachment preview inside a user bubble. */
export function AiAttachmentPreview({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("mt-3 overflow-hidden rounded-control border border-line", className)}>
      <img src={src} alt={alt} className="block max-h-64 w-full object-cover" />
    </div>
  );
}

/** Processing label — "Thinking…" or "Worked for 13 seconds". */
export function AiWorkingIndicator({
  label,
  onToggle,
  className,
}: {
  label: string;
  onToggle?: () => void;
  className?: string;
}) {
  const content = (
    <>
      {onToggle && (
        <ChevronRight className="size-3.5 text-ink-faint transition-transform group-data-[open=true]:rotate-90" />
      )}
      <span>{label}</span>
    </>
  );

  const base = cn(
    "inline-flex items-center gap-1.5 text-[13px] text-ink-mute",
    onToggle && "group cursor-pointer hover:text-ink transition-colors",
    className,
  );

  if (onToggle) {
    return (
      <button type="button" onClick={onToggle} className={cn(base, "group outline-none")}>
        {content}
      </button>
    );
  }

  return <p className={base}>{content}</p>;
}

/**
 * Assistant output — no bubble; structured prose on the page.
 * Use markdown-like children or compose with AiProse blocks.
 */
export function AiAssistantBlock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-[min(100%,48rem)] text-[15px] leading-relaxed text-ink-soft", className)}>
      {children}
    </div>
  );
}

/** Typography primitives for structured assistant replies. */
export function AiProse({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 [&_strong]:font-semibold [&_strong]:text-ink",
        "[&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2",
        "[&_p]:text-ink-soft [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5",
        "[&_li]:text-ink-soft [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Follow-up suggestions at the end of an assistant turn. */
export function AiNextSteps({ title = "Possible next steps", children, className }: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-8 border-t border-line pt-6", className)}>
      <p className="mb-3 text-[13px] font-semibold text-ink">{title}</p>
      <ul className="space-y-2 text-[15px] text-ink-soft [&_li]:leading-relaxed">
        {children}
      </ul>
    </div>
  );
}
