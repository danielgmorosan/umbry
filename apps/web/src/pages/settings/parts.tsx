import type { ReactNode } from "react";
import { Card } from "@gossip/ui";

export function SettingGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section>
      {title && (
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{title}</div>
      )}
      <Card className="divide-y divide-[color:var(--border)]">{children}</Card>
    </section>
  );
}

export function SettingRow({
  label,
  desc,
  control,
  children,
}: {
  label: ReactNode;
  desc?: ReactNode;
  control?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-text">{label}</div>
        {desc && <div className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{desc}</div>}
        {children}
      </div>
      {control && <div className="shrink-0">{control}</div>}
    </div>
  );
}
