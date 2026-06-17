import { useState } from "react";
import { Search, UserPlus, Check } from "lucide-react";
import { PaneHeader } from "@/components/chat/PaneHeader";
import { Avatar, Badge, Button, Input } from "@gossip/ui";
import { useRelay } from "@/stores/useRelay";
import { useSession } from "@/stores/useSession";
import { truncateHandle } from "@/lib/utils";

const roleTone = { owner: "accent", admin: "info", member: "neutral", guest: "neutral" } as const;

export function MembersPage() {
  const workspace = useRelay((s) => s.workspace);
  const myId = useSession((s) => s.userId);
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);
  const members = (workspace?.members ?? []).filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeader
        title="Members"
        subtitle={`${workspace?.members.length ?? 0} in ${workspace?.name ?? "this workspace"}`}
        actions={
          workspace?.code ? (
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(workspace.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="size-4" /> : <UserPlus className="size-4" />}
              {copied ? "Copied" : `Invite · ${workspace.code}`}
            </Button>
          ) : undefined
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="mb-4 max-w-sm">
            <Input icon={<Search />} placeholder="Search members" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            {members.map((m, i) => (
              <div key={m.userId} className="flex items-center gap-3 border-border bg-surface px-4 py-3 hover:bg-surface-raised" style={{ borderTopWidth: i ? 1 : 0 }}>
                <Avatar name={m.name} id={m.userId} size={36} presence="online" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text">{m.name}</span>
                    {m.userId === myId && <span className="text-[12px] text-faint">· you</span>}
                  </div>
                  <div className="font-mono text-[11px] text-faint">{truncateHandle(m.userId, 16, 6)}</div>
                </div>
                <div className="ml-auto">
                  <Badge tone={roleTone[m.role]} className="capitalize">{m.role}</Badge>
                </div>
              </div>
            ))}
            {members.length === 0 && <div className="px-4 py-8 text-center text-[13px] text-faint">No members yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
