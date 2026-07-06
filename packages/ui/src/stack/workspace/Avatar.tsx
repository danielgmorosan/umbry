import { cn, colorForId, initials } from "../../utils";

export function Avatar({
  name,
  id,
  size = "md",
  className,
}: {
  name: string;
  id?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const px = size === "sm" ? "size-5 text-[10px]" : "size-6 text-[11px]";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-ink",
        px,
        className,
      )}
      style={{ backgroundColor: colorForId(id ?? name) }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
