import { useEffect, useState } from "react";
import { Cpu, Cloud, Check, Download, Zap, CircleDot, KeyRound, ShieldCheck, RefreshCw, ArrowRight } from "lucide-react";
import { SettingsPage } from "./SettingsLayout";
import { SettingGroup, SettingRow } from "./parts";
import { Badge, Button, Field, Input, Segmented, Toggle } from "@gossip/ui";
import { ollamaModels } from "@/data/mock";
import { cn } from "@/lib/utils";

function Step({
  n,
  title,
  done,
  active,
  children,
}: {
  n: number;
  title: string;
  done?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full border text-[13px] font-semibold transition-colors",
            done
              ? "border-accent bg-accent text-accent-ink"
              : active
                ? "border-accent text-accent"
                : "border-border-strong text-faint",
          )}
        >
          {done ? <Check className="size-4" /> : n}
        </span>
        <span className="mt-1 w-px flex-1 bg-border" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className={cn("text-[15px] font-semibold", active || done ? "text-text" : "text-muted")}>{title}</div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export function AiEngineSettings() {
  const [detected, setDetected] = useState(true);
  const [selected, setSelected] = useState("qwen2.5:14b");
  const [pulling, setPulling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [route, setRoute] = useState<"local" | "cloud">("local");
  const [claudeKey, setClaudeKey] = useState("");

  useEffect(() => {
    if (!pulling) return;
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setPulling(false);
          setInstalled(true);
          return 100;
        }
        return p + 4;
      });
    }, 90);
    return () => clearInterval(t);
  }, [pulling]);

  return (
    <SettingsPage
      title="AI Engine"
      desc="Run OpenClaw on a local open-source model so sensitive reasoning never leaves your machines. Cloud is an opt-in route for higher quality."
    >
      {/* Desktop notice */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-raised/60 p-4">
        <Cpu className="mt-0.5 size-5 shrink-0 text-accent" />
        <p className="text-[13px] leading-relaxed text-muted">
          <span className="font-medium text-text">Local install needs the desktop app.</span> On the
          web we show setup instructions; on the Tauri desktop build, these steps install and manage
          Ollama for you.
        </p>
      </div>

      <SettingGroup>
        <div className="px-5 py-5">
          <Step n={1} title="Detect Ollama" done={detected}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-[12px]",
                  detected ? "bg-[color:var(--accent-faint)] text-accent" : "bg-surface-inset text-faint",
                )}
              >
                <CircleDot className={cn("size-3.5", detected && "animate-pulse")} />
                {detected ? "running · 127.0.0.1:11434" : "not detected"}
              </div>
              {detected ? (
                <Button variant="ghost" size="sm" onClick={() => setDetected(false)}>
                  <RefreshCw className="size-4" /> Re-scan
                </Button>
              ) : (
                <Button size="sm" onClick={() => setDetected(true)}>
                  <Download className="size-4" /> Install Ollama
                </Button>
              )}
            </div>
          </Step>

          <Step n={2} title="Pick a model" done={installed} active={detected}>
            <div className="space-y-2">
              {ollamaModels.map((m) => {
                const active = selected === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                      active
                        ? "border-[color:var(--accent)] bg-[color:var(--accent-faint)]"
                        : "border-border bg-surface hover:border-border-strong",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 place-items-center rounded-full border",
                        active ? "border-accent bg-accent text-accent-ink" : "border-border-strong",
                      )}
                    >
                      {active && <Check className="size-3" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-medium text-text">{m.id}</span>
                        {m.recommended && <Badge tone="accent">recommended</Badge>}
                      </div>
                      <div className="text-[12px] text-muted">{m.desc}</div>
                    </div>
                    <div className="hidden text-right sm:block">
                      <div className="text-[12px] font-medium text-text">{m.tier}</div>
                      <div className="font-mono text-[10.5px] text-faint">{m.ram} · {m.ctx}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Step>

          <Step n={3} title="Pull the model" done={installed} active={detected && !installed}>
            {installed ? (
              <div className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--accent-faint)] px-3 py-1.5 text-[13px] text-accent">
                <Check className="size-4" /> {selected} ready
              </div>
            ) : pulling ? (
              <div>
                <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-muted">
                  <span>pulling {selected}…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-inset">
                  <div className="h-full rounded-full bg-accent transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <Button size="sm" disabled={!detected} onClick={() => { setProgress(0); setPulling(true); }}>
                <Download className="size-4" /> Pull {selected}
              </Button>
            )}
          </Step>

          <Step n={4} title="Set as default route" done={installed && route === "local"} active={installed}>
            <p className="text-[13px] text-muted">
              Privacy-sensitive jobs (recaps, meeting notes) run on the local model. The cloud route
              stays opt-in.
            </p>
          </Step>
        </div>
      </SettingGroup>

      {/* Routing */}
      <SettingGroup title="Model routing">
        <SettingRow
          label="Default route"
          desc="Where OpenClaw sends reasoning by default."
          control={
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
        <SettingRow
          label="Pin privacy-sensitive jobs to local"
          desc="Recaps and meeting notes always use the on-device model, even when the default is cloud."
          control={<Toggle checked onChange={() => {}} />}
        />
      </SettingGroup>

      {/* Cloud route */}
      <SettingGroup title="Cloud route · Claude (opt-in)">
        <div className="space-y-3 px-4 py-4">
          <div className="flex items-start gap-2.5 rounded-lg bg-surface-inset p-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
            <p className="text-[12.5px] leading-relaxed text-muted">
              Your key is stored in the OpenClaw gateway / OS keychain — never in the frontend
              bundle. Used only for the <span className="font-mono text-text">complex</span> route.
            </p>
          </div>
          <Field label="Anthropic API key">
            <Input
              type="password"
              mono
              icon={<KeyRound />}
              placeholder="sk-ant-…"
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
              suffix={
                <Button size="sm" disabled={!claudeKey.trim()} className="mr-0.5">
                  Save
                </Button>
              }
            />
          </Field>
        </div>
      </SettingGroup>

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised/60 px-4 py-3">
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <Zap className="size-4 text-accent" />
          {installed ? (
            <>
              OpenClaw is using <span className="font-mono text-text">{selected}</span> on the{" "}
              <span className="text-text">{route}</span> route.
            </>
          ) : (
            <>Complete the steps above to bring the local engine online.</>
          )}
        </div>
        <Button size="sm" variant="secondary">
          Restart gateway <ArrowRight className="size-4" />
        </Button>
      </div>
    </SettingsPage>
  );
}
