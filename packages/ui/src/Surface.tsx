import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-raised/70 backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-[15px] font-semibold text-text">{title}</h3>
        {desc && <p className="mt-0.5 text-[13px] text-muted leading-relaxed">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}
