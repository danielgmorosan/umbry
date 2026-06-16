import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, Sparkles, ShieldCheck, Circle } from "lucide-react";
import { Avatar, Badge, Toggle } from "@gossip/ui";
import { members } from "@/data/mock";
import { cn, colorForId } from "@/lib/utils";

const participants = members.filter((m) => !m.isAi).slice(0, 4);

export function CallPage() {
  const { workspaceId = "w_gossip", channelId = "c_design" } = useParams();
  const nav = useNavigate();
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(false);
  const [notetaker, setNotetaker] = useState(true);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0a0c0f]">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <span className="grid size-7 place-items-center rounded-lg bg-[color:var(--accent-faint)] text-accent">
          <Video className="size-4" />
        </span>
        <div>
          <div className="font-display text-[15px] font-bold text-text">Huddle · #{channelId.replace("c_", "")}</div>
          <div className="font-mono text-[10px] text-faint">LiveKit · self-hosted · E2E</div>
        </div>
        <Badge tone="accent" className="ml-1" dot>
          {participants.length} in call
        </Badge>
        {notetaker && (
          <Badge tone="danger" className="ml-1">
            <Circle className="size-2 animate-pulse fill-current" /> recording for notes
          </Badge>
        )}
      </header>

      {/* Consent banner */}
      {notetaker && (
        <div className="flex items-center gap-2 bg-[color:var(--accent-faint)] px-4 py-2 text-[12.5px] text-text">
          <ShieldCheck className="size-4 shrink-0 text-accent" />
          The AI notetaker is on. Audio is transcribed locally with whisper.cpp — everyone can see
          this banner.
        </div>
      )}

      {/* Stage */}
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 p-4">
        {participants.map((p) => (
          <div
            key={p.id}
            className="relative grid place-items-center overflow-hidden rounded-2xl border border-border"
            style={{ background: `radial-gradient(circle at 50% 40%, ${colorForId(p.id)}22, #0a0c0f 70%)` }}
          >
            <Avatar name={p.displayName} id={p.id} size={88} />
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/40 px-2 py-1 text-[12px] text-white backdrop-blur">
              {p.id === "u_me" && !mic ? <MicOff className="size-3.5 text-danger" /> : <Mic className="size-3.5" />}
              {p.displayName}
            </div>
          </div>
        ))}
      </div>

      {/* AI notetaker control */}
      <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl border border-border bg-surface/80 px-4 py-3 backdrop-blur">
        <Sparkles className="size-4 text-accent" />
        <div className="flex-1">
          <div className="text-[13.5px] font-medium text-text">OpenClaw notetaker</div>
          <div className="text-[12px] text-muted">Transcribe locally → summary + action items posted to the channel.</div>
        </div>
        <Toggle checked={notetaker} onChange={setNotetaker} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 pb-5">
        <CtrlButton on={mic} onToggle={() => setMic((v) => !v)} onIcon={<Mic className="size-5" />} offIcon={<MicOff className="size-5" />} />
        <CtrlButton on={cam} onToggle={() => setCam((v) => !v)} onIcon={<Video className="size-5" />} offIcon={<VideoOff className="size-5" />} />
        <button className="grid size-12 place-items-center rounded-2xl bg-surface-raised text-muted hover:text-text">
          <Monitor className="size-5" />
        </button>
        <button
          onClick={() => nav(`/w/${workspaceId}/c/${channelId}`)}
          className="ml-2 grid h-12 w-16 place-items-center rounded-2xl bg-danger text-white hover:opacity-90"
        >
          <PhoneOff className="size-5" />
        </button>
      </div>
    </div>
  );
}

function CtrlButton({
  on,
  onToggle,
  onIcon,
  offIcon,
}: {
  on: boolean;
  onToggle: () => void;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "grid size-12 place-items-center rounded-2xl transition-colors",
        on ? "bg-surface-raised text-text hover:bg-slate" : "bg-danger/15 text-danger",
      )}
    >
      {on ? onIcon : offIcon}
    </button>
  );
}
