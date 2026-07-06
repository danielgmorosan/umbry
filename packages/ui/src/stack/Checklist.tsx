import { Check } from "lucide-react";
import { cn } from "../utils";

export interface RequirementItem {
  label: string;
  met: boolean;
}

/**
 * Live requirement checklist ("Password requirements:") — each rule flips
 * from a hollow gray dot to a green check as it is satisfied.
 */
export function Requirements({
  title = "Password requirements:",
  items,
  className,
}: {
  title?: string;
  items: RequirementItem[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5 text-sm text-ink-soft">
            {item.met ? (
              <Check className="size-4 shrink-0 mt-0.5 text-positive" strokeWidth={2.5} />
            ) : (
              <span
                aria-hidden
                className="size-4 shrink-0 mt-0.5 flex items-center justify-center"
              >
                <span className="size-1.5 rounded-full border border-line-strong" />
              </span>
            )}
            <span className="leading-snug">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
