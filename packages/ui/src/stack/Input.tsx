import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../utils";

const base =
  "w-full h-11 px-3.5 rounded-control text-[15px] bg-field text-ink placeholder:text-ink-faint " +
  "border border-line transition-colors outline-none " +
  "focus:border-ink focus:ring-2 focus:ring-[color:var(--st-ring)]";

export interface StackInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, StackInputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        base,
        invalid && "border-negative focus:border-negative focus:ring-negative/15",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "StackInput";

/** Password input with a show/hide affordance. */
export const PasswordInput = forwardRef<HTMLInputElement, StackInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-11", className)}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-control text-ink-faint hover:text-ink outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "StackPasswordInput";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="block text-[15px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-negative">{error}</p>
      ) : (
        hint && <p className="text-sm text-ink-mute">{hint}</p>
      )}
    </div>
  );
}
