import { forwardRef, type AnchorHTMLAttributes } from "react";
import { cn } from "../utils";

/**
 * Inline text link — always underlined, ink-colored. Use `textLinkClass`
 * directly on router <Link> elements.
 */
export const textLinkClass =
  "font-medium text-ink underline underline-offset-[3px] decoration-line-strong " +
  "hover:decoration-ink transition-colors outline-none rounded-[2px] " +
  "focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]";

export const TextLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <a ref={ref} className={cn(textLinkClass, className)} {...props} />
  ),
);
TextLink.displayName = "StackTextLink";
