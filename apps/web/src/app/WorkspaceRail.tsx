import { Link, useParams } from "react-router-dom";
import { Plus, Mail, Calendar, FileText, NotebookPen, Video, Settings } from "lucide-react";
import { GossipMark } from "@gossip/ui";
import { Avatar } from "@gossip/ui";
import { useRelay } from "@/stores/useRelay";
import { useSession } from "@/stores/useSession";
import { cn } from "@/lib/utils";

const dock = [
  { id: "mail", icon: Mail, label: "Mail" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "files", icon: FileText, label: "Files" },
  { id: "notes", icon: NotebookPen, label: "Notes" },
  { id: "calls", icon: Video, label: "Calls" },
];

export function WorkspaceRail() {
  const { workspaceId } = useParams();
  const myWorkspaces = useRelay((s) => s.myWorkspaces);
  const displayName = useSession((s) => s.displayName) || "You";
  const userId = useSession((s) => s.userId);

  return (
    <aside className="flex h-full w-[72px] shrink-0 flex-col items-center gap-2 border-r border-border bg-canvas py-3">
      <Link to={workspaceId ? `/w/${workspaceId}` : "/welcome"} className="mb-1">
        <GossipMark size={40} className="glow-accent transition-transform hover:scale-105" />
      </Link>

      <div className="my-1 h-px w-8 bg-border" />

      <div className="flex flex-col items-center gap-2.5">
        {myWorkspaces.map((w) => (
          <Link key={w.id} to={`/w/${w.id}`} title={w.name} className="group relative flex items-center justify-center">
            <span
              className={cn(
                "absolute -left-2 w-1 rounded-r-full bg-accent transition-all",
                w.id === workspaceId ? "h-7 opacity-100" : "h-0 opacity-0 group-hover:h-3 group-hover:opacity-60",
              )}
            />
            <span
              className={cn(
                "grid size-11 place-items-center rounded-2xl font-display text-base font-bold transition-all",
                w.id === workspaceId
                  ? "rounded-xl bg-surface-raised text-accent ring-1 ring-[color:var(--accent)]/40"
                  : "bg-surface text-muted hover:rounded-xl hover:bg-surface-raised hover:text-text",
              )}
            >
              {w.name[0]?.toUpperCase() ?? "?"}
            </span>
          </Link>
        ))}
        <Link
          to="/workspace/create"
          title="Create or join a workspace"
          className="grid size-11 place-items-center rounded-2xl border border-dashed border-border-strong text-muted transition-all hover:rounded-xl hover:border-[color:var(--accent)] hover:text-accent"
        >
          <Plus className="size-5" />
        </Link>
      </div>

      <div className="my-1 h-px w-8 bg-border" />

      {/* Mini-app dock */}
      <div className="flex flex-col items-center gap-1.5">
        {dock.map((d) => (
          <Link
            key={d.id}
            to={workspaceId ? `/w/${workspaceId}/apps/${d.id}` : "/welcome"}
            title={d.label}
            className="grid size-10 place-items-center rounded-xl text-faint transition-colors hover:bg-surface-raised hover:text-accent"
          >
            <d.icon className="size-[18px]" />
          </Link>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-2">
        <Link to="/settings/profile" title="Settings" className="grid size-10 place-items-center rounded-xl text-faint transition-colors hover:bg-surface-raised hover:text-text">
          <Settings className="size-[18px]" />
        </Link>
        <Link to="/settings/profile" title={displayName}>
          <Avatar name={displayName} id={userId ?? displayName} size={36} presence="online" />
        </Link>
      </div>
    </aside>
  );
}
