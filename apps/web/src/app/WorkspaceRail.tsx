import { Link, useParams } from "react-router-dom";
import { Plus, Mail, Calendar, FileText, NotebookPen, Video, Settings } from "lucide-react";
import { GossipMark } from "@gossip/ui";
import { Avatar } from "@gossip/ui";
import { me } from "@/data/mock";
import { cn } from "@/lib/utils";

const workspaces = [
  { id: "w_gossip", name: "Gossip Labs", active: true },
  { id: "w_acme", name: "Acme Privacy", active: false },
];

const dock = [
  { id: "mail", icon: Mail, label: "Mail" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "files", icon: FileText, label: "Files" },
  { id: "notes", icon: NotebookPen, label: "Notes" },
  { id: "calls", icon: Video, label: "Calls" },
];

function RailButton({
  children,
  label,
  active,
  to,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  to: string;
}) {
  return (
    <Link to={to} className="group relative flex items-center justify-center" title={label}>
      <span
        className={cn(
          "absolute -left-2 w-1 rounded-r-full bg-accent transition-all",
          active ? "h-7 opacity-100" : "h-0 opacity-0 group-hover:h-3 group-hover:opacity-60",
        )}
      />
      {children}
    </Link>
  );
}

export function WorkspaceRail() {
  const { workspaceId = "w_gossip" } = useParams();
  return (
    <aside className="flex h-full w-[72px] shrink-0 flex-col items-center gap-2 border-r border-border bg-canvas py-3">
      <Link to={`/w/${workspaceId}`} className="mb-1">
        <GossipMark size={40} className="glow-accent transition-transform hover:scale-105" />
      </Link>

      <div className="my-1 h-px w-8 bg-border" />

      <div className="flex flex-col items-center gap-2.5">
        {workspaces.map((w) => (
          <RailButton key={w.id} to={`/w/${w.id}`} label={w.name} active={w.id === workspaceId}>
            <span
              className={cn(
                "grid size-11 place-items-center rounded-2xl font-display text-base font-bold transition-all",
                w.id === workspaceId
                  ? "rounded-xl bg-surface-raised text-accent ring-1 ring-[color:var(--accent)]/40"
                  : "bg-surface text-muted hover:rounded-xl hover:bg-surface-raised hover:text-text",
              )}
            >
              {w.name[0]}
            </span>
          </RailButton>
        ))}
        <button
          className="grid size-11 place-items-center rounded-2xl border border-dashed border-border-strong text-muted transition-all hover:rounded-xl hover:border-[color:var(--accent)] hover:text-accent"
          title="Add workspace"
        >
          <Plus className="size-5" />
        </button>
      </div>

      <div className="my-1 h-px w-8 bg-border" />

      {/* Mini-app dock */}
      <div className="flex flex-col items-center gap-1.5">
        {dock.map((d) => (
          <Link
            key={d.id}
            to={`/w/${workspaceId}/apps/${d.id}`}
            title={d.label}
            className="grid size-10 place-items-center rounded-xl text-faint transition-colors hover:bg-surface-raised hover:text-accent"
          >
            <d.icon className="size-[18px]" />
          </Link>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-2">
        <Link
          to="/settings/profile"
          title="Settings"
          className="grid size-10 place-items-center rounded-xl text-faint transition-colors hover:bg-surface-raised hover:text-text"
        >
          <Settings className="size-[18px]" />
        </Link>
        <Link to="/settings/profile" title={me.displayName}>
          <Avatar name="Daniel M" id={me.id} size={36} presence="online" />
        </Link>
      </div>
    </aside>
  );
}
