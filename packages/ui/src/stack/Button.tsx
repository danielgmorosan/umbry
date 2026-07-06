import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  /* Solid near-black; the single loudest element on any screen. */
  primary:
    "bg-ink text-paper hover:bg-ink-hover disabled:bg-field disabled:text-ink-faint",
  /* Quiet gray fill — "Go back home". */
  secondary:
    "bg-field text-ink hover:bg-line disabled:text-ink-faint",
  /* White with hairline — OAuth buttons, "Go to login". */
  outline:
    "bg-paper text-ink border border-line hover:bg-field disabled:text-ink-faint",
  ghost: "bg-transparent text-ink-mute hover:text-ink hover:bg-field",
  danger:
    "bg-transparent text-negative border border-negative/30 hover:bg-negative/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-2",
  md: "h-11 px-5 text-[15px] gap-2.5",
  lg: "h-12 px-6 text-[15px] gap-2.5",
};

export interface StackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  /** Leading icon slot (e.g. an OAuth provider glyph). */
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, StackButtonProps>(
  ({ variant = "primary", size = "md", block, icon, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-control font-medium",
        "transition-colors duration-150 outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)] focus-visible:border-ink",
        "disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {icon && <span className="[&_svg]:size-[18px] flex items-center">{icon}</span>}
      {children}
    </button>
  ),
);
Button.displayName = "StackButton";
