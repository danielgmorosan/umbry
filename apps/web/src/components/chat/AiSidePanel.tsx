import { Sparkles, X, ArrowUp, ShieldCheck, FileText, ListChecks, Search } from "lucide-react";
import { Badge } from "@gossip/ui";

const quick = [
  { icon: FileText, label: "Recap this channel this week" },
  { icon: ListChecks, label: "Extract action items" },
  { icon: Search, label: "Find the pricing decision" },
];

export function AiSidePanel({ channelName, onClose }: { channelName: string; onClose: () => void }) {
  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-border bg-surface">
      <header className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="grid size-7 place-items-center rounded-lg bg-accent text-accent-ink">
          <Sparkles className="size-4" />
        </span>
        <div className="leading-tight">
          <div className="text-[14px] font-semibold text-text">OpenClaw</div>
          <div className="font-mono text-[10px] text-faint">model: qwen2.5:14b · local</div>
        </div>
        <Badge tone="accent" className="ml-1" dot>
          private
        </Badge>
        <button onClick={onClose} className="ml-auto grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-raised hover:text-text">
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="rounded-xl border border-border bg-surface-inset p-3 text-[13px] leading-relaxed text-muted">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-text">
            <ShieldCheck className="size-4 text-accent" /> Scoped to #{channelName}
          </div>
          I only read channels you can access, never DMs. Answers are grounded in this channel's
          history.
        </div>

        <div className="space-y-1.5">
          {quick.map((q) => (
            <button
              key={q.label}
              className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-left text-[13.5px] text-text transition-colors hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent-faint)]"
            >
              <q.icon className="size-4 shrink-0 text-accent" />
              {q.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-[color:var(--accent-faint)] p-3">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">Recap · this week</div>
          <p className="text-[13.5px] leading-relaxed text-text/90">
            The team aligned on a dark + mint theme, monospace for cryptographic identity, and
            distinct header treatments for E2E DMs vs. workspace-confidential channels.
            <span className="text-muted"> Action: Mara to ship header variants.</span>
          </p>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-inset px-3 py-2">
          <input
            placeholder="Ask about this channel…"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-text outline-none placeholder:text-faint"
          />
          <button className="grid size-7 place-items-center rounded-lg bg-accent text-accent-ink hover:bg-accent-bright">
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
