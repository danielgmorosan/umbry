import type { ReactNode } from "react";
import { cn } from "./utils";

type Tone = "neutral" | "accent" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-slate text-muted border-border",
  accent: "bg-[color:var(--accent-faint)] text-accent border-[color:var(--accent)]/25",
  warning: "bg-[color:var(--warning)]/10 text-warning border-[color:var(--warning)]/25",
  danger: "bg-[color:var(--danger)]/10 text-danger border-[color:var(--danger)]/25",
  info: "bg-[color:var(--info)]/10 text-info border-[color:var(--info)]/25",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
