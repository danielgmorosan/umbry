import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "./utils";

const base =
  "w-full bg-surface-inset text-text placeholder:text-faint border border-border rounded-lg " +
  "transition-colors outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-glow)]";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  mono?: boolean;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, suffix, mono, ...props }, ref) => (
    <div className="relative flex items-center">
      {icon && (
        <span className="pointer-events-none absolute left-3 text-faint [&_svg]:size-4">{icon}</span>
      )}
      <input
        ref={ref}
        className={cn(
          base,
          "h-10 text-sm",
          icon ? "pl-9" : "pl-3.5",
          suffix ? "pr-10" : "pr-3.5",
          mono && "font-mono tracking-tight",
          className,
        )}
        {...props}
      />
      {suffix && <span className="absolute right-2 flex items-center">{suffix}</span>}
    </div>
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(base, "px-3.5 py-2.5 text-sm resize-none", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-[13px] font-medium text-muted">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-faint leading-relaxed">{hint}</p>}
    </div>
  );
}
