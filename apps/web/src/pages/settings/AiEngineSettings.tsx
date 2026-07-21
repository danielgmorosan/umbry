import { useCallback, useEffect, useState } from "react";
import { Cpu, Check, CircleDot, ShieldCheck, RefreshCw, Download, Cloud, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SettingsPage } from "./SettingsLayout";
import { SettingGroup, SettingRow } from "./parts";
import { Button } from "@umbry/ui/stack";
import { aiHealth, listModels, pullModel, type AiHealth, type InstalledModel } from "@/lib/ai";
import { ollamaModels } from "@/data/mock";
import { getMode } from "@/lib/endpoints";
import { cn } from "@/lib/utils";

interface PullState {
  status: string;
  percent: number | null;
  error?: string;
}

export function AiEngineSettings() {
  const [health, setHealth] = useState<AiHealth | null>(null);
  const [checking, setChecking] = useState(false);
  const [installed, setInstalled] = useState<InstalledModel[] | null>(null);
  const [pulls, setPulls] = useState<Record<string, PullState>>({});
  const managed = getMode() === "managed";

  const check = useCallback(async () => {
    setChecking(true);
    try {
      setHealth(await aiHealth());
    } catch {
      setHealth(null);
    }
    try {
      setInstalled((await listModels()).models);
    } catch {
      setInstalled(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!managed) void check();
  }, [check, managed]);

  const pull = async (id: string) => {
    setPulls((p) => ({ ...p, [id]: { status: "starting", percent: null } }));
    try {
      await pullModel(id, (prog) => setPulls((p) => ({ ...p, [id]: prog })));
      setPulls((p) => {
        const { [id]: _drop, ...rest } = p;
        return rest;
      });
      await check();
    } catch (e) {
      setPulls((p) => ({ ...p, [id]: { status: "failed", percent: null, error: String(e instanceof Error ? e.message : e) } }));
    }
  };

  const has = (id: string) =>
    (installed ?? []).some((m) => m.name === id || m.name.split(":")[0] === id.split(":")[0]);

  // Managed mode: the relay runs on Umbry's hardware, so a model can't run for
  // you there and it certainly can't reach an Ollama on your laptop. Say so
  // plainly rather than showing a status that will never turn green.
  if (managed) {
    return (
      <SettingsPage
        title="AI Engine"
        desc="Umbry AI runs on an open-source model on hardware you control, so sensitive reasoning never leaves your machines."
      >
        <div className="flex items-start gap-3 rounded-card border border-line bg-paper-2 p-4">
          <Cloud className="mt-0.5 size-5 shrink-0 text-ink-mute" />
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-ink">AI needs self-hosting</div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-mute">
              You're on the managed relay, which runs on our hardware — we don't run a model for you
              there, and it can't reach one on your machine. Switch to self-hosted and start the local
              stack; it includes the AI engine, and the model downloads with one click.
            </p>
            <Link
              to="/settings/self-hosting"
              className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink underline underline-offset-2"
            >
              Go to Self-hosting <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </SettingsPage>
    );
  }

  return (
    <SettingsPage
      title="AI Engine"
      desc="Umbry AI runs on an open-source model on your own hardware. It can read channel content you have access to — never your end-to-end encrypted DMs."
    >
      <SettingGroup title="Engine status">
        <SettingRow
          label="Ollama"
          desc="Local inference server, running beside your relay in the self-host stack."
          control={
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-control px-3 py-1.5 font-mono text-[12px]",
                  health?.ollama ? "bg-field text-positive" : "bg-field text-ink-faint",
                )}
              >
                <CircleDot className={cn("size-3.5", health?.ollama && "animate-pulse")} />
                {health === null ? "relay unreachable" : health.ollama ? "running" : "not detected"}
              </span>
              <Button variant="ghost" size="sm" onClick={check} disabled={checking}>
                <RefreshCw className={cn("size-4", checking && "animate-spin")} /> Re-check
              </Button>
            </div>
          }
        />
        <SettingRow
          label="Model"
          desc={
            health && health.ollama && !health.hasModel
              ? "The configured model isn't downloaded yet — pull it below."
              : "The model Umbry AI routes reasoning to."
          }
          control={
            <span className={cn("font-mono text-[12px]", health?.ok ? "text-ink" : "text-ink-faint")}>
              {health ? `${health.model} · ${health.route}` : "—"}
            </span>
          }
        />
        {health && !health.ollama && (
          <div className="px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-mute">
            The AI container isn't up. Start the local stack in{" "}
            <Link to="/settings/self-hosting" className="font-medium text-ink underline underline-offset-2">
              Self-hosting
            </Link>
            .
          </div>
        )}
      </SettingGroup>

      <SettingGroup title="Models">
        {ollamaModels.map((m) => {
          const p = pulls[m.id];
          const ready = has(m.id);
          return (
            <SettingRow
              key={m.id}
              label={
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[13px]">{m.id}</span>
                  {m.recommended && (
                    <span className="rounded-control bg-field px-2 py-0.5 text-[11px] font-medium text-ink">
                      recommended
                    </span>
                  )}
                  {ready && (
                    <span className="rounded-control bg-field px-2 py-0.5 text-[11px] font-medium text-positive">
                      installed
                    </span>
                  )}
                </span>
              }
              desc={`${m.tier} · ${m.ram} · ${m.ctx} · ${m.desc}`}
              control={
                ready ? (
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] text-positive">
                    <Check className="size-4" /> Ready
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void pull(m.id)}
                    disabled={Boolean(p) && p.status !== "failed"}
                  >
                    <Download className="size-4" />
                    {p ? (p.percent !== null ? `${Math.round(p.percent * 100)}%` : p.status) : "Download"}
                  </Button>
                )
              }
            >
              {p && p.percent !== null && (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-field">
                  <div
                    className="h-full rounded-full bg-ink transition-[width] duration-300"
                    style={{ width: `${Math.round(p.percent * 100)}%` }}
                  />
                </div>
              )}
              {p?.error && <p className="mt-1.5 text-[12px] text-negative">{p.error}</p>}
            </SettingRow>
          );
        })}
      </SettingGroup>

      <SettingGroup title="What the AI can see">
        <div className="flex items-start gap-2.5 px-4 py-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-positive" />
          <p className="text-[12.5px] leading-relaxed text-ink-mute">
            The model only ever receives channel content from workspaces you're a member of. Direct
            messages are end-to-end encrypted and never reach the relay in readable form, so they are
            structurally out of reach — not merely filtered out.
          </p>
        </div>
      </SettingGroup>

      <div className="flex items-start gap-3 rounded-card border border-line bg-paper-2 p-4">
        <Cpu className="mt-0.5 size-5 shrink-0 text-ink-mute" />
        <p className="text-[13px] leading-relaxed text-ink-mute">
          Models run on CPU by default, which works but is slow on larger models. If the machine
          running your stack has an NVIDIA GPU, enable the commented-out GPU block in{" "}
          <span className="font-mono text-ink">services/selfhost/docker-compose.yml</span>.
        </p>
      </div>
    </SettingsPage>
  );
}
