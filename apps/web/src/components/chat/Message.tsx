import { Sparkles, SmilePlus, MessageSquareReply, MoreHorizontal, Check } from "lucide-react";
import { Avatar } from "@gossip/ui";
import { memberById, type Message as Msg } from "@/data/mock";
import { cn } from "@/lib/utils";

export function MessageItem({ m, showAuthor = true }: { m: Msg; showAuthor?: boolean }) {
  const author = memberById(m.authorId);
  const isAi = author.isAi;
  const mine = m.authorId === "u_me";

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-5 py-1.5 transition-colors hover:bg-surface/60",
        showAuthor && "mt-3 pt-2",
        isAi && "bg-[color:var(--accent-faint)]/40 hover:bg-[color:var(--accent-faint)]/60",
      )}
    >
      <div className="w-9 shrink-0">
        {showAuthor ? (
          isAi ? (
            <span className="grid size-9 place-items-center rounded-[28%] bg-accent text-accent-ink glow-accent">
              <Sparkles className="size-5" />
            </span>
          ) : (
            <Avatar name={author.displayName} id={author.id} size={36} />
          )
        ) : (
          <span className="block w-9 text-right text-[10px] text-faint opacity-0 group-hover:opacity-100">
            {m.ts}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {showAuthor && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text">{author.displayName}</span>
            {isAi && (
              <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-accent">
                AI · local
              </span>
            )}
            {mine && <span className="text-[11px] text-faint">you</span>}
            <span className="text-[11px] text-faint">{m.ts}</span>
            {m.edited && <span className="text-[11px] text-faint">(edited)</span>}
          </div>
        )}
        <div className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-text/90">{m.body}</div>

        {m.reactions && m.reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {m.reactions.map((r, i) => (
              <button
                key={i}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                  r.mine
                    ? "border-[color:var(--accent)]/40 bg-[color:var(--accent-faint)] text-text"
                    : "border-border bg-surface-raised text-muted hover:border-border-strong",
                )}
              >
                <span>{r.emoji}</span>
                <span className="font-medium">{r.count}</span>
              </button>
            ))}
            <button className="grid size-6 place-items-center rounded-full border border-border text-faint opacity-0 transition-opacity hover:text-text group-hover:opacity-100">
              <SmilePlus className="size-3.5" />
            </button>
          </div>
        )}

        {m.replyCount ? (
          <button className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline">
            <MessageSquareReply className="size-3.5" />
            {m.replyCount} replies
          </button>
        ) : null}
      </div>

      {/* Hover actions */}
      <div className="absolute -top-3 right-4 hidden items-center gap-0.5 rounded-lg border border-border bg-surface-raised p-0.5 shadow-lg group-hover:flex">
        {[SmilePlus, MessageSquareReply, MoreHorizontal].map((Icon, i) => (
          <button key={i} className="grid size-7 place-items-center rounded-md text-muted hover:bg-slate hover:text-text">
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReadReceipt() {
  return <Check className="inline size-3 text-accent-ink/70" />;
}
