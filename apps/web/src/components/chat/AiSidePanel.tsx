import { useState } from "react";
import { Sparkles, X, ArrowUp, ShieldCheck, FileText, ListChecks, Search, Loader2 } from "lucide-react";
import { Badge } from "@gossip/ui";
import { runAiJob } from "@/lib/ai";

const quick: { icon: typeof FileText; label: string; type: "recap" | "notes" | "qa"; prompt?: string }[] = [
  { icon: FileText, label: "Recap this channel", type: "recap" },
  { icon: ListChecks, label: "Extract action items", type: "notes" },
  { icon: Search, label: "What was decided here?", type: "qa", prompt: "What decisions were made in this channel?" },
];

export function AiSidePanel({
  workspaceId,
  channelId,
  channelName,
  onClose,
}: {
  workspaceId: string;
  channelId: string;
  channelName: string;
  onClose: () => void;
}) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");

  const run = async (type: "recap" | "notes" | "qa", prompt?: string) => {
    if (busy) return;
    setBusy(true);
    setAnswer(null);
    try {
      const res = await runAiJob({ workspaceId, channelScope: [channelId], type, prompt });
      setAnswer(res.text);
    } catch (e) {
      setAnswer(`⚠️ ${e instanceof Error ? e.message : "Request failed"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-border bg-surface">
      <header className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="grid size-7 place-items-center rounded-lg bg-accent text-accent-ink">
          <Sparkles className="size-4" />
        </span>
        <div className="leading-tight">
          <div className="text-[14px] font-semibold text-text">OpenClaw</div>
          <div className="font-mono text-[10px] text-faint">local model</div>
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
          Runs locally; reads only this channel's history, never DMs.
        </div>

        <div className="space-y-1.5">
          {quick.map((q) => (
            <button
              key={q.label}
              onClick={() => run(q.type, q.prompt)}
              disabled={busy}
              className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-left text-[13.5px] text-text transition-colors hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent-faint)] disabled:opacity-50"
            >
              <q.icon className="size-4 shrink-0 text-accent" />
              {q.label}
            </button>
          ))}
        </div>

        {busy && (
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <Loader2 className="size-4 animate-spin text-accent" /> Reading #{channelName}…
          </div>
        )}
        {answer && (
          <div className="rounded-xl bg-[color:var(--accent-faint)] p-3">
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">OpenClaw</div>
            <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-text/90">{answer}</p>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-inset px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                run("qa", input.trim());
                setInput("");
              }
            }}
            placeholder="Ask about this channel…"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-text outline-none placeholder:text-faint"
          />
          <button
            onClick={() => {
              if (input.trim()) {
                run("qa", input.trim());
                setInput("");
              }
            }}
            disabled={busy}
            className="grid size-7 place-items-center rounded-lg bg-accent text-accent-ink hover:bg-accent-bright disabled:opacity-50"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
