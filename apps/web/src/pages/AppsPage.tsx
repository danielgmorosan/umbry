import { Link, useParams } from "react-router-dom";
import { Mail, Calendar, FileText, NotebookPen, Video, Plus, ShieldCheck } from "lucide-react";
import { PaneHeader } from "@/components/chat/PaneHeader";
import { Badge, Button } from "@gossip/ui";

const apps = [
  { id: "mail", icon: Mail, name: "Mail", provider: "Fastmail · JMAP", desc: "Inbox, threads, send to channel.", on: true },
  { id: "calendar", icon: Calendar, name: "Calendar", provider: "CalDAV", desc: "Schedule, invites, huddles.", on: true },
  { id: "files", icon: FileText, name: "Files", provider: "Nextcloud · WebDAV", desc: "Browse and share workspace files.", on: true },
  { id: "notes", icon: NotebookPen, name: "Notes", provider: "Standard Notes · E2E", desc: "Encrypted notes & meeting docs.", on: false },
  { id: "calls", icon: Video, name: "Calls", provider: "LiveKit", desc: "Huddles with the AI notetaker.", on: true },
];

export function AppsPage() {
  const { workspaceId = "w_gossip" } = useParams();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeader
        title="Mini-apps"
        subtitle="Privacy-respecting tools, docked into the workspace"
        actions={
          <Link to="/settings/integrations">
            <Button size="sm" variant="secondary">
              Manage integrations
            </Button>
          </Link>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-[color:var(--accent-faint)] px-3 py-2 text-[12.5px] text-muted">
            <ShieldCheck className="size-4 shrink-0 text-accent" />
            Every mini-app runs in a sandboxed iframe with least-privilege access. Built on open
            standards, so your own provider drops in.
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((a) => (
              <Link
                key={a.id}
                to={`/w/${workspaceId}/apps/${a.id}`}
                className="group flex flex-col rounded-2xl border border-border bg-surface p-4 transition-all hover:border-[color:var(--accent)]/40 hover:bg-surface-raised"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-[color:var(--accent-faint)] text-accent">
                    <a.icon className="size-5" />
                  </span>
                  <Badge tone={a.on ? "accent" : "neutral"} dot={a.on}>
                    {a.on ? "enabled" : "off"}
                  </Badge>
                </div>
                <div className="font-display text-[15px] font-bold text-text">{a.name}</div>
                <div className="font-mono text-[10.5px] text-faint">{a.provider}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{a.desc}</p>
              </Link>
            ))}
            <button className="flex min-h-[156px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong text-muted transition-colors hover:border-[color:var(--accent)] hover:text-accent">
              <Plus className="size-6" />
              <span className="text-[13px] font-medium">Add a mini-app</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
