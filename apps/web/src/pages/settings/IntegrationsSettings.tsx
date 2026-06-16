import { useState } from "react";
import { Mail, Calendar, FileText, NotebookPen, Video, ShieldCheck, ShieldAlert, Monitor, Ban, Check } from "lucide-react";
import { SettingsPage } from "./SettingsLayout";
import { Badge, Button, Segmented } from "@gossip/ui";
import { integrations, type IntegrationDef } from "@/data/mock";
import { cn } from "@/lib/utils";

const kindMeta = {
  calls: { icon: Video, label: "Calls" },
  files: { icon: FileText, label: "Files" },
  mail: { icon: Mail, label: "Mail" },
  calendar: { icon: Calendar, label: "Calendar" },
  notes: { icon: NotebookPen, label: "Notes" },
} as const;

const privacyMeta: Record<IntegrationDef["privacy"], { label: string; tone: "accent" | "info" | "warning" }> = {
  "self-hosted": { label: "self-hosted", tone: "accent" },
  e2e: { label: "end-to-end", tone: "accent" },
  standards: { label: "open standard", tone: "info" },
  bridge: { label: "bridge", tone: "warning" },
};

function StatusButton({ status }: { status: IntegrationDef["status"] }) {
  if (status === "connected")
    return (
      <Button variant="secondary" size="sm">
        <Check className="size-4 text-accent" /> Connected
      </Button>
    );
  if (status === "available") return <Button size="sm">Connect</Button>;
  if (status === "desktop-only")
    return (
      <Button variant="outline" size="sm" disabled>
        <Monitor className="size-4" /> Desktop only
      </Button>
    );
  return (
    <Button variant="outline" size="sm" disabled>
      <Ban className="size-4" /> Unavailable
    </Button>
  );
}

export function IntegrationsSettings() {
  const [filter, setFilter] = useState<"all" | IntegrationDef["kind"]>("all");
  const list = integrations.filter((i) => filter === "all" || i.kind === filter);

  return (
    <SettingsPage
      title="Integrations"
      desc="Privacy-respecting mini-apps. We build against open protocols, so your own provider drops in."
    >
      {/* Design principle banner */}
      <div className="flex items-start gap-3 rounded-xl border border-[color:var(--accent)]/25 bg-[color:var(--accent-faint)] p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
        <p className="text-[13px] leading-relaxed text-muted">
          <span className="font-medium text-text">The sweet spot is self-hostable open source:</span>{" "}
          you run the server, so you own the data and still get a real API. Closed E2E suites
          (Proton, Tuta) are handled as desktop-bridge special cases — we never promise an API that
          doesn't exist.
        </p>
      </div>

      <Segmented
        value={filter}
        onChange={setFilter}
        size="sm"
        options={[
          { value: "all", label: "All" },
          { value: "calls", label: "Calls" },
          { value: "files", label: "Files" },
          { value: "mail", label: "Mail" },
          { value: "calendar", label: "Calendar" },
          { value: "notes", label: "Notes" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {list.map((it) => {
          const Kind = kindMeta[it.kind].icon;
          const pm = privacyMeta[it.privacy];
          const dim = it.status === "unavailable" || it.status === "desktop-only";
          return (
            <div
              key={it.id}
              className={cn(
                "flex flex-col rounded-2xl border border-border bg-surface-raised/60 p-4",
                dim && "opacity-75",
              )}
            >
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-surface-inset text-accent">
                  <Kind className="size-5" />
                </span>
                <Badge tone={pm.tone}>
                  {it.privacy === "bridge" ? <ShieldAlert className="size-3" /> : <ShieldCheck className="size-3" />}
                  {pm.label}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="font-display text-[15px] font-bold text-text">{it.name}</span>
              </div>
              <div className="font-mono text-[10.5px] text-faint">{it.protocol}</div>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">{it.blurb}</p>
              <div className="mt-3 flex items-center justify-between">
                {it.note ? (
                  <span className="font-mono text-[10.5px] text-accent">{it.note}</span>
                ) : (
                  <span />
                )}
                <StatusButton status={it.status} />
              </div>
            </div>
          );
        })}
      </div>
    </SettingsPage>
  );
}
