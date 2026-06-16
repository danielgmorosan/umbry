import { Link, useParams } from "react-router-dom";
import { Hash, MessageSquareReply } from "lucide-react";
import { PaneHeader } from "@/components/chat/PaneHeader";
import { Avatar } from "@gossip/ui";
import { memberById } from "@/data/mock";

const threads = [
  { id: "t1", channel: "design", channelId: "c_design", lastBy: "u_mara", replies: 3, preview: "On it. DM headers get the mint shield, channels get a neutral lock…", ts: "09:13" },
  { id: "t2", channel: "engineering", channelId: "c_eng", lastBy: "u_kev", replies: 5, preview: "No — DMs stay on the gossip-sdk E2E channel verbatim.", ts: "11:23" },
];

export function Threads() {
  const { workspaceId = "w_gossip" } = useParams();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeader title="Threads" subtitle="Conversations you follow" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 space-y-3">
          {threads.map((t) => {
            const m = memberById(t.lastBy);
            return (
              <Link
                key={t.id}
                to={`/w/${workspaceId}/c/${t.channelId}`}
                className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-raised"
              >
                <div className="mb-2 flex items-center gap-1.5 text-[13px] text-muted">
                  <Hash className="size-3.5" /> {t.channel}
                </div>
                <div className="flex items-start gap-3">
                  <Avatar name={m.displayName} id={m.id} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{m.displayName}</span>
                      <span className="text-[11px] text-faint">{t.ts}</span>
                    </div>
                    <p className="truncate text-[14px] text-text/80">{t.preview}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">
                      <MessageSquareReply className="size-3.5" /> {t.replies} replies
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
