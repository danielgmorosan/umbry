import { cn, colorForId, initials } from "./utils";

type Presence = "online" | "away" | "offline" | "dnd";

const presenceColor: Record<Presence, string> = {
  online: "var(--accent)",
  away: "var(--warning)",
  dnd: "var(--danger)",
  offline: "var(--text-faint)",
};

export function Avatar({
  name,
  id,
  size = 36,
  presence,
  square,
  ring,
  className,
}: {
  name: string;
  id?: string;
  size?: number;
  presence?: Presence;
  square?: boolean;
  ring?: boolean;
  className?: string;
}) {
  const color = colorForId(id ?? name);
  const dot = Math.max(8, Math.round(size * 0.28));
  return (
    <span className={cn("relative inline-block shrink-0", className)} style={{ width: size, height: size }}>
      <span
        className={cn(
          "grid h-full w-full place-items-center font-semibold",
          square ? "rounded-[28%]" : "rounded-full",
          ring && "ring-2 ring-[color:var(--accent)] ring-offset-2 ring-offset-[color:var(--canvas)]",
        )}
        style={{
          background: `linear-gradient(150deg, ${color}, ${color}cc)`,
          color: "#07150F",
          fontSize: size * 0.4,
        }}
      >
        {initials(name)}
      </span>
      {presence && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-[color:var(--canvas)]"
          style={{ width: dot, height: dot, background: presenceColor[presence] }}
        />
      )}
    </span>
  );
}
