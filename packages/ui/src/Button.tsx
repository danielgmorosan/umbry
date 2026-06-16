import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent-bright active:bg-accent-deep shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_8px_24px_-12px_var(--accent)] font-semibold",
  secondary:
    "bg-surface-raised text-text hover:bg-slate border border-border hover:border-border-strong",
  outline:
    "bg-transparent text-text border border-border-strong hover:bg-surface-raised",
  ghost: "bg-transparent text-muted hover:text-text hover:bg-surface-raised",
  danger:
    "bg-transparent text-danger border border-[color:var(--danger)]/30 hover:bg-[color:var(--danger)]/10",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", block, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium",
        "transition-all duration-150 ease-out outline-none",
        "focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-0",
        "disabled:opacity-45 disabled:pointer-events-none select-none",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
