import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { Tooltip } from "@umbry/ui/stack";
import { EmojiPickerPopover } from "./EmojiPickerPopover";
import { cn } from "@/lib/utils";

/**
 * Emoji reaction chips under a message (T4). Works for channel messages
 * (relay-stored) and DMs (control-message fold) - the caller supplies the
 * current { emoji → userIds } map and a toggle callback.
 */
export function ReactionChips({
  reactions,
  myId,
  nameOf,
  onToggle,
  className,
}: {
  reactions: Record<string, string[]> | undefined;
  myId: string | null;
  /** Resolve a userId to a display name for the hover tooltip. */
  nameOf: (userId: string) => string;
  onToggle: (emoji: string) => void;
  className?: string;
}) {
  const entries = Object.entries(reactions ?? {}).filter(([, users]) => users.length > 0);
  if (entries.length === 0) return null;
  return (
    <div className={cn("mt-1 flex flex-wrap items-center gap-1", className)}>
      {entries.map(([emoji, users]) => {
        const mine = !!myId && users.includes(myId);
        const who = users.map(nameOf).filter(Boolean);
        const label = who.length <= 3 ? who.join(", ") : `${who.slice(0, 3).join(", ")} +${who.length - 3}`;
        return (
          <Tooltip key={emoji} label={label || "React"}>
            <button
              onClick={() => onToggle(emoji)}
              aria-label={`${emoji} · ${users.length}${mine ? " (you reacted)" : ""}`}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] leading-5 transition-colors",
                mine
                  ? "border-ink/40 bg-field text-ink"
                  : "border-line bg-paper text-ink-mute hover:border-line-strong hover:text-ink",
              )}
            >
              <span className="font-emoji text-[13px]">{emoji}</span>
              <span className="font-medium tabular-nums">{users.length}</span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}

/**
 * Hover-bar button that opens the emoji picker to add a reaction. Anchors the
 * popover to its own corner; picking closes it.
 */
export function AddReactionButton({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative">
      <Tooltip label="Add reaction">
        <button
          data-emoji-toggle
          onClick={() => setOpen((v) => !v)}
          aria-label="Add reaction"
          className="grid size-7 place-items-center rounded-[calc(var(--radius-control)-2px)] text-ink-mute transition-colors hover:bg-field hover:text-ink"
        >
          <SmilePlus className="size-3.5" />
        </button>
      </Tooltip>
      {open && (
        <EmojiPickerPopover
          className="absolute right-0 top-8 z-30"
          onPick={(emoji) => {
            setOpen(false);
            onPick(emoji);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </span>
  );
}
