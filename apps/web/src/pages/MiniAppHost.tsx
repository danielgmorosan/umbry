import { useParams, Link } from "react-router-dom";
import { Mail, Calendar, FileText, NotebookPen, Video, Lock, Share2, Star, Inbox } from "lucide-react";
import { PaneHeader, HeaderIconButton } from "@/components/chat/PaneHeader";
import { Badge } from "@gossip/ui";

const meta: Record<string, { icon: typeof Mail; name: string; provider: string }> = {
  mail: { icon: Mail, name: "Mail", provider: "Fastmail · JMAP" },
  calendar: { icon: Calendar, name: "Calendar", provider: "CalDAV" },
  files: { icon: FileText, name: "Files", provider: "Nextcloud · WebDAV" },
  notes: { icon: NotebookPen, name: "Notes", provider: "Standard Notes" },
  calls: { icon: Video, name: "Calls", provider: "LiveKit" },
};

const mailItems = [
  { from: "Kevin Cero", subj: "Relay self-host doc — draft", time: "09:48", unread: true },
  { from: "Fastmail", subj: "Your JMAP token was used", time: "08:12" },
  { from: "Ada Núñez", subj: "DPA review — two notes", time: "Yesterday" },
];

export function MiniAppHost() {
  const { appId = "mail" } = useParams();
  const m = meta[appId] ?? meta.mail;
  const Icon = m.icon;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeader
        icon={
          <span className="grid size-7 place-items-center rounded-lg bg-[color:var(--accent-faint)] text-accent">
            <Icon className="size-4" />
          </span>
        }
        title={m.name}
        subtitle={<span className="font-mono text-[11px]">{m.provider}</span>}
        badge={
          <Badge tone="neutral" className="ml-1">
            <Lock className="size-3" /> sandboxed
          </Badge>
        }
        actions={
          <>
            <HeaderIconButton label="Share to channel">
              <Share2 className="size-4" />
            </HeaderIconButton>
            <Link to="/settings/integrations">
              <HeaderIconButton label="Configure">
                <Star className="size-4" />
              </HeaderIconButton>
            </Link>
          </>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {/* Simulated sandboxed mini-app surface */}
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border bg-surface-inset px-4 py-2 font-mono text-[11px] text-faint">
            <span className="size-2 rounded-full bg-[color:var(--danger)]/60" />
            <span className="size-2 rounded-full bg-[color:var(--warning)]/60" />
            <span className="size-2 rounded-full bg-[color:var(--accent)]/60" />
            <span className="ml-2">sandbox · postMessage RPC bridge · least-privilege</span>
          </div>
          {appId === "mail" ? (
            <div>
              {mailItems.map((it, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-border px-4 py-3 hover:bg-surface-raised"
                  style={{ borderTopWidth: i ? 1 : 0 }}
                >
                  <Inbox className="size-4 text-faint" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{it.from}</span>
                      {it.unread && <span className="size-1.5 rounded-full bg-accent" />}
                    </div>
                    <div className="truncate text-[13px] text-muted">{it.subj}</div>
                  </div>
                  <span className="text-[11px] text-faint">{it.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid place-items-center px-6 py-20 text-center">
              <Icon className="size-10 text-accent" />
              <div className="mt-3 font-display text-lg font-bold text-text">{m.name} mini-app</div>
              <p className="mt-1 max-w-sm text-[13px] text-muted">
                Loads in a sandboxed iframe against {m.provider}. The host hands off identity and
                channel context over the postMessage RPC bridge.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
