import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Hash, Lock, Phone, Sparkles, Users, Info, Pin, ShieldAlert } from "lucide-react";
import { PaneHeader, HeaderIconButton } from "@/components/chat/PaneHeader";
import { MessageItem } from "@/components/chat/Message";
import { Composer } from "@/components/chat/Composer";
import { AiSidePanel } from "@/components/chat/AiSidePanel";
import { Avatar, Badge } from "@gossip/ui";
import { channelById, memberById, messagesByChannel } from "@/data/mock";

export function ChannelView() {
  const { workspaceId = "w_gossip", channelId = "c_design" } = useParams();
  const channel = channelById(channelId);
  const msgs = messagesByChannel[channelId] ?? messagesByChannel.c_general;
  const [aiOpen, setAiOpen] = useState(channelId === "c_design");
  const memberObjs = channel.memberIds.map(memberById);

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <PaneHeader
          icon={
            channel.type === "private" ? (
              <Lock className="size-[18px] text-faint" />
            ) : (
              <Hash className="size-[18px] text-faint" />
            )
          }
          title={channel.name}
          subtitle={channel.topic}
          badge={
            <span title="Channel messages are workspace-confidential (TLS), not E2E in v1.">
              <Badge tone="warning" className="ml-1">
                <ShieldAlert className="size-3" /> confidential
              </Badge>
            </span>
          }
          actions={
            <>
              <div className="mr-1 hidden items-center -space-x-2 md:flex">
                {memberObjs.slice(0, 4).map((m) => (
                  <span key={m.id} className="rounded-full ring-2 ring-[color:var(--canvas)]">
                    <Avatar name={m.displayName} id={m.id} size={26} />
                  </span>
                ))}
                <span className="grid size-[26px] place-items-center rounded-full bg-slate text-[10px] font-semibold text-muted ring-2 ring-[color:var(--canvas)]">
                  {memberObjs.length}
                </span>
              </div>
              <Link to={`/w/${workspaceId}/call/${channelId}`}>
                <HeaderIconButton label="Start huddle">
                  <Phone className="size-4" />
                </HeaderIconButton>
              </Link>
              <HeaderIconButton label="Pin">
                <Pin className="size-4" />
              </HeaderIconButton>
              <HeaderIconButton label="Members">
                <Users className="size-4" />
              </HeaderIconButton>
              <HeaderIconButton label="Ask OpenClaw" active={aiOpen} onClick={() => setAiOpen((v) => !v)}>
                <Sparkles className="size-4" />
              </HeaderIconButton>
              <HeaderIconButton label="Details">
                <Info className="size-4" />
              </HeaderIconButton>
            </>
          }
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Channel intro */}
          <div className="px-5 pb-2 pt-8">
            <div className="grid size-12 place-items-center rounded-2xl bg-surface-raised">
              {channel.type === "private" ? (
                <Lock className="size-6 text-accent" />
              ) : (
                <Hash className="size-6 text-accent" />
              )}
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-text">
              {channel.type === "private" ? "" : "#"}
              {channel.name}
            </h2>
            <p className="mt-1 max-w-xl text-[14px] text-muted">
              This is the start of the channel. {channel.topic}
            </p>
            {channel.aiMember && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--accent-faint)] px-2.5 py-1.5 text-[13px] text-text">
                <Sparkles className="size-3.5 text-accent" /> OpenClaw is a member of this channel
              </div>
            )}
          </div>

          {msgs.map((m, i) => {
            const prev = msgs[i - 1];
            const showAuthor = !prev || prev.authorId !== m.authorId;
            return <MessageItem key={m.id} m={m} showAuthor={showAuthor} />;
          })}
          <div className="h-4" />
        </div>

        <Composer placeholder={`Message #${channel.name}`} />
      </div>

      {aiOpen && <AiSidePanel channelName={channel.name} onClose={() => setAiOpen(false)} />}
    </div>
  );
}
