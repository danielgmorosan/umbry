import { useState } from "react";
import { Sparkles, ArrowUp, ShieldCheck, FileText, ListChecks, Search, Cpu, Cloud, Hash } from "lucide-react";
import { PaneHeader } from "@/components/chat/PaneHeader";
import { Badge, Segmented } from "@gossip/ui";
import { aiConversation } from "@/data/mock";
import { cn } from "@/lib/utils";

const prompts = [
  { icon: FileText, label: "Recap #marketing-launch this week" },
  { icon: ListChecks, label: "Action items from #engineering" },
  { icon: Search, label: "Find the decision we made about pricing" },
  { icon: Hash, label: "Summarize what shipped across my channels" },
];

export function AiPage() {
  const [route, setRoute] = useState<"local" | "cloud">("local");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeader
        icon={
          <span className="grid size-7 place-items-center rounded-lg bg-accent text-accent-ink glow-accent">
            <Sparkles className="size-4" />
          </span>
        }
        title="OpenClaw"
        subtitle="Self-hosted assistant · reads only channels you can access"
        badge={
          <Badge tone="accent" className="ml-1" dot>
            {route === "local" ? "local model" : "cloud · Claude"}
          </Badge>
        }
        actions={
          <Segmented
            value={route}
            onChange={setRoute}
            size="sm"
            options={[
              { value: "local", label: "Local", icon: <Cpu className="size-3.5" /> },
              { value: "cloud", label: "Cloud", icon: <Cloud className="size-3.5" /> },
            ]}
          />
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {/* Hero */}
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border bg-surface-raised/60 p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
            <div className="text-[13.5px] leading-relaxed text-muted">
              <span className="font-medium text-text">Privacy boundary.</span> OpenClaw runs as a
              workspace member with its own identity. It can read channels it's been added to —{" "}
              <span className="text-text">never your DMs</span> — and answers are scoped to what you
              can already see.{" "}
              {route === "local" ? (
                <>Reasoning stays on this machine via Ollama.</>
              ) : (
                <>Cloud route sends channel context to the Claude API (opt-in).</>
              )}
            </div>
          </div>

          {/* Conversation */}
          <div className="space-y-5">
            {aiConversation.map((t, i) =>
              t.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[14.5px] text-accent-ink">
                    {t.body}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[28%] bg-accent text-accent-ink">
                    <Sparkles className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-text">OpenClaw</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                        {t.route ?? route} route
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 text-[14.5px] leading-relaxed text-text/90">
                      {t.body}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Suggested prompts */}
          <div className="mt-8">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">
              Try
            </div>
            <div className="grid grid-cols-2 gap-2">
              {prompts.map((p) => (
                <button
                  key={p.label}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-raised px-3.5 py-3 text-left text-[13.5px] text-text transition-colors hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent-faint)]"
                >
                  <p.icon className="size-4 shrink-0 text-accent" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="px-4 pb-5">
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-border bg-surface-inset px-4 py-2.5 focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent-glow)]">
          <Sparkles className="size-4 shrink-0 text-accent" />
          <input
            placeholder="Ask OpenClaw to recap, summarize, or find something…"
            className="min-w-0 flex-1 bg-transparent py-1 text-[14.5px] text-text outline-none placeholder:text-faint"
          />
          <span className="hidden font-mono text-[10px] text-faint sm:block">
            {route === "local" ? "qwen2.5:14b" : "claude"}
          </span>
          <button className="grid size-8 place-items-center rounded-lg bg-accent text-accent-ink hover:bg-accent-bright">
            <ArrowUp className="size-4" />
          </button>
        </div>
        <p className={cn("mx-auto mt-2 max-w-3xl text-center text-[11px]", "text-faint")}>
          OpenClaw can make mistakes. Recaps cover only channels you have access to.
        </p>
      </div>
    </div>
  );
}
