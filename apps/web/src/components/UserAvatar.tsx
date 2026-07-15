import { Avatar } from "@gossip/ui/stack";
import { useAvatars, resolveAvatarSrc } from "@/stores/useAvatars";
import { useRelay } from "@/stores/useRelay";
import { cn } from "@/lib/utils";

/**
 * Drop-in replacement for the Stack `Avatar` that resolves an image source:
 * local override > workspace-synced member avatar (T3, via relay hello) >
 * deterministic DiceBear identicon from the handle. Same props as `Avatar`,
 * so call sites can alias the import.
 */
export function UserAvatar({
  name,
  id,
  size,
  className,
  presence,
}: {
  name: string;
  id?: string;
  size?: "sm" | "md";
  className?: string;
  /** Show an online/offline status dot in the corner (T3). */
  presence?: boolean;
}) {
  const overrides = useAvatars((s) => s.overrides);
  const memberAvatar = useRelay((s) => (id ? s.workspace?.members.find((m) => m.userId === id)?.avatar : undefined));
  const online = useRelay((s) => (presence && id ? s.onlineUsers.has(id) : false));
  const src = (id && overrides[id] ? undefined : memberAvatar) ?? resolveAvatarSrc(id, overrides);
  if (!presence) return <Avatar name={name} id={id} size={size} className={className} src={src} />;
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar name={name} id={id} size={size} className={className} src={src} />
      <span
        title={online ? "Online" : "Offline"}
        className={cn(
          "absolute -bottom-0.5 -right-0.5 size-[30%] min-h-[9px] min-w-[9px] rounded-full ring-2 ring-[color:var(--st-paper-2)]",
          online ? "bg-positive" : "bg-ink-faint",
        )}
      />
    </span>
  );
}
