import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Hash, Lock, Loader2 } from "lucide-react";
import { Button, Field, Input } from "@gossip/ui";
import { useRelay } from "@/stores/useRelay";
import { cn } from "@/lib/utils";

export function CreateChannelDialog({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  const nav = useNavigate();
  const createChannel = useRelay((s) => s.createChannel);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<"public" | "private">("public");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await createChannel(workspaceId, name, type, topic);
    setBusy(false);
    if (res.ok) {
      onClose();
      nav(`/w/${workspaceId}/c/${res.channel.id}`);
    } else setError(res.error);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-raised p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text">Create a channel</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate hover:text-text">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Name">
            <Input autoFocus placeholder="e.g. marketing" value={name} onChange={(e) => setName(e.target.value)} icon={<Hash />} />
          </Field>
          <Field label="Topic (optional)">
            <Input placeholder="What's this channel about?" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            {(["public", "private"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-3 text-left text-[13px]",
                  type === t ? "border-[color:var(--accent)] bg-[color:var(--accent-faint)] text-text" : "border-border text-muted hover:border-border-strong",
                )}
              >
                {t === "public" ? <Hash className="size-4" /> : <Lock className="size-4" />}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </div>
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <Button type="submit" block disabled={busy || !name.trim()}>
            {busy ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : "Create channel"}
          </Button>
        </form>
      </div>
    </div>
  );
}
