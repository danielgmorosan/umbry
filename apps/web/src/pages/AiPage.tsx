import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, ArrowUp, ShieldCheck, FileText, ListChecks, Search, Cpu, Loader2, AlertTriangle } from "lucide-react";
import { PaneHeader } from "@/components/chat/PaneHeader";
import { Badge } from "@gossip/ui";
import { useRelay } from "@/stores/useRelay";
import { aiHealth, runAiJob, type AiHealth } from "@/lib/ai";

interface Turn {
  role: "user" | "assistant";
  text: string;
  model?: string;
}

const quickPrompts: { icon: typeof FileText; label: string; type: "recap" | "notes" | "qa"; prompt?: string }[] = [
  { icon: FileText, label: "Recap all my channels", type: "recap" },
  { icon: ListChecks, label: "Extract action items", type: "notes" },
  { icon: Search, label: "What decisions were made?", type: "qa", prompt: "What decisions have been made, and by whom?" },
];

export function AiPage() {
  const { workspaceId = "" } = useParams();
  const workspace = useRelay((s) => s.workspace);
  const channelIds = workspace?.channels.map((c) => c.id) ?? [];
  const [health, setHealth] = useState<AiHealth | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiHealth().then(setHealth).catch(() => setHealth(null));
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns, busy]);

  const ask = async (type: "recap" | "notes" | "qa", prompt?: string, label?: string) => {
    if (busy) return;
    const userText = label ?? prompt ?? "";
    setTurns((t) => [...t, { role: "user", text: userText }]);
    setBusy(true);
    try {
      const res = await runAiJob({ workspaceId, channelScope: channelIds, type, prompt });
      setTurns((t) => [...t, { role: "assistant", text: res.text, model: res.model }]);
    } catch (e) {
      setTurns((t) => [...t, { role: "assistant", text: `⚠️ ${e instanceof Error ? e.message : "Request failed"}` }]);
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    const p = input.trim();
    if (!p) return;
    setInput("");
    ask("qa", p, p);
  };

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
          <Badge tone={health?.ok ? "accent" : "warning"} className="ml-1" dot>
            {health?.ok ? `local · ${health.model}` : "model offline"}
          </Badge>
        }
      />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border bg-surface-raised/60 p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
            <div className="text-[13.5px] leading-relaxed text-muted">
              <span className="font-medium text-text">Runs on your hardware.</span> Reasoning happens locally via Ollama —
              channel text never leaves this machine. OpenClaw can read the channels in this workspace,{" "}
              <span className="text-text">never your DMs</span>.
            </div>
          </div>

          {!health?.ok && health && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 p-4 text-[13px] text-muted">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              <div>
                {!health.ollama
                  ? "Ollama isn't running. Start it with `ollama serve`."
                  : `Model ${health.model} isn't pulled yet. Run \`ollama pull ${health.model}\`.`}
              </div>
            </div>
          )}

          {turns.length === 0 && (
            <div className="space-y-2">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Try</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {quickPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => ask(p.type, p.prompt, p.label)}
                    disabled={busy}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-raised px-3.5 py-3 text-left text-[13.5px] text-text transition-colors hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent-faint)] disabled:opacity-50"
                  >
                    <p.icon className="size-4 shrink-0 text-accent" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {turns.map((t, i) =>
              t.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[14.5px] text-accent-ink">{t.text}</div>
                </div>
              ) : (
                <div key={i} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[28%] bg-accent text-accent-ink">
                    <Sparkles className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-text">OpenClaw</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-accent">local{t.model ? ` · ${t.model}` : ""}</span>
                    </div>
                    <div className="whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 text-[14.5px] leading-relaxed text-text/90">
                      {t.text}
                    </div>
                  </div>
                </div>
              ),
            )}
            {busy && (
              <div className="flex items-center gap-2 text-[13px] text-muted">
                <Loader2 className="size-4 animate-spin text-accent" /> OpenClaw is reading your channels…
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-5">
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-border bg-surface-inset px-4 py-2.5 focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent-glow)]">
          <Cpu className="size-4 shrink-0 text-accent" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about your channels — recap, summarize, find a decision…"
            className="min-w-0 flex-1 bg-transparent py-1 text-[14.5px] text-text outline-none placeholder:text-faint"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || busy}
            className="grid size-8 place-items-center rounded-lg bg-accent text-accent-ink hover:bg-accent-bright disabled:opacity-50"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-faint">
          Local model · answers cover only channels you can access, never DMs.
        </p>
      </div>
    </div>
  );
}
