import { useMemo, useState } from "react";
import { Hash, Send, Check } from "lucide-react";
import { StackModal, ModalBody, Input } from "@umbry/ui/stack";
import { gossipSdk } from "@/lib/sdk";
import { useRelay } from "@/stores/useRelay";
import { useContacts } from "@/stores/useContacts";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

/**
 * Forward a message's text to a channel or a DM. v1 is text-only (channel
 * attachments are relay upload ids and DM images are E2EE data-URIs, so they
 * don't cross transports). Sends via the relay `post` for channels and the
 * gossip SDK for DMs.
 */
export function ForwardDialog({ body, onClose }: { body: string; onClose: () => void }) {
  const workspace = useRelay((s) => s.workspace);
  const contacts = useContacts((s) => s.contacts);
  const [q, setQ] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const query = q.trim().toLowerCase();
  const channels = useMemo(
    () => (workspace?.channels ?? []).filter((c) => c.name.toLowerCase().includes(query)),
    [workspace, query],
  );
  const dms = useMemo(
    () => contacts.filter((c) => (c.name ?? "").toLowerCase().includes(query)),
    [contacts, query],
  );

  const sendToChannel = (chId: string, name: string) => {
    if (!workspace) return;
    useRelay.getState().post(workspace.id, chId, body);
    setSentTo(`#${name}`);
    setTimeout(onClose, 750);
  };
  const sendToDm = async (peerId: string, name: string) => {
    try {
      await gossipSdk.messages.sendText(peerId, body);
      setSentTo(name);
      setTimeout(onClose, 750);
    } catch {
      /* ignore — dialog stays open to retry */
    }
  };

  return (
    <StackModal onClose={onClose} width="md">
      <ModalBody>
        <div className="mb-3">
          <h2 className="text-[16px] font-semibold text-ink">Forward message</h2>
          <p className="mt-0.5 line-clamp-2 text-[12.5px] text-ink-mute">{body}</p>
        </div>
        {sentTo ? (
          <div className="flex items-center gap-2 rounded-card bg-field px-3 py-4 text-[13px] text-positive">
            <Check className="size-4" /> Forwarded to {sentTo}
          </div>
        ) : (
          <>
            <Input placeholder="Search channels & people…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
            <div className="mt-3 max-h-72 space-y-3 overflow-y-auto">
              {channels.length > 0 && (
                <div>
                  <div className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Channels</div>
                  {channels.map((c) => (
                    <Row key={c.id} onClick={() => sendToChannel(c.id, c.name)} icon={<Hash className="size-4 text-ink-faint" />} label={c.name} />
                  ))}
                </div>
              )}
              {dms.length > 0 && (
                <div>
                  <div className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Direct messages</div>
                  {dms.map((c) => (
                    <Row
                      key={c.userId}
                      onClick={() => void sendToDm(c.userId, c.name ?? "them")}
                      icon={<UserAvatar name={c.name} id={c.userId} className="!size-6 !text-[10px]" />}
                      label={c.name ?? c.userId.slice(0, 10)}
                    />
                  ))}
                </div>
              )}
              {channels.length === 0 && dms.length === 0 && (
                <p className="px-1 py-4 text-[13px] text-ink-faint">No matching destinations.</p>
              )}
            </div>
          </>
        )}
      </ModalBody>
    </StackModal>
  );
}

function Row({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-control px-2 py-1.5 text-left text-[13.5px] text-ink-mute transition-colors hover:bg-field hover:text-ink",
      )}
    >
      <span className="grid size-6 shrink-0 place-items-center">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <Send className="size-3.5 shrink-0 text-ink-faint" />
    </button>
  );
}
