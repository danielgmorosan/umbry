import { useState } from "react";
import { Search, UserPlus, Sparkles } from "lucide-react";
import { PaneHeader } from "@/components/chat/PaneHeader";
import { Avatar, Badge, Button, Input } from "@gossip/ui";
import { members, type Role } from "@/data/mock";
import { truncateHandle } from "@/lib/utils";

const roleTone: Record<Role, "accent" | "info" | "neutral"> = {
  owner: "accent",
  admin: "info",
  member: "neutral",
  guest: "neutral",
};

export function MembersPage() {
  const [q, setQ] = useState("");
  const list = members.filter((m) => m.displayName.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeader
        title="Members"
        subtitle={`${members.length} people · 1 AI assistant`}
        actions={
          <Button size="sm">
            <UserPlus className="size-4" /> Invite
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="mb-4 max-w-sm">
            <Input
              icon={<Search />}
              placeholder="Search members"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            {list.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-3 border-border bg-surface px-4 py-3 hover:bg-surface-raised"
                style={{ borderTopWidth: i ? 1 : 0 }}
              >
                {m.isAi ? (
                  <span className="grid size-9 shrink-0 place-items-center rounded-[28%] bg-accent text-accent-ink">
                    <Sparkles className="size-5" />
                  </span>
                ) : (
                  <Avatar name={m.displayName} id={m.id} size={36} presence={m.presence} />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text">{m.displayName}</span>
                    {m.title && <span className="text-[12px] text-faint">· {m.title}</span>}
                  </div>
                  <div className="font-mono text-[11px] text-faint">{truncateHandle(m.handle, 16, 6)}</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {m.isAi && <Badge tone="accent">AI</Badge>}
                  <Badge tone={roleTone[m.role]} className="capitalize">
                    {m.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
