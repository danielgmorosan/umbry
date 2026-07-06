import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils";
import { Button } from "../Button";

export function WizardStepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-center gap-0", className)}>
      {steps.map((step, i) => (
        <div key={step} className="flex min-w-0 flex-1 items-center">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold",
                i < current
                  ? "bg-ink text-paper"
                  : i === current
                    ? "border-2 border-ink bg-paper text-ink"
                    : "border border-line-strong bg-paper text-ink-faint",
              )}
            >
              {i < current ? <Check className="size-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-[12px] sm:inline",
                i <= current ? "text-ink font-medium" : "text-ink-faint",
              )}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && <div className="mx-2 h-px flex-1 bg-line" />}
        </div>
      ))}
    </div>
  );
}

export function StatTile({
  icon,
  count,
  label,
  className,
}: {
  icon?: ReactNode;
  count: number | string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-control bg-field px-4 py-3", className)}>
      <div className="mb-2 text-ink-mute [&_svg]:size-4">{icon}</div>
      <p className="text-xl font-bold tabular-nums text-ink">{count}</p>
      <p className="text-[12px] text-ink-mute">{label}</p>
    </div>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", className)}>{children}</div>;
}

export function PlanCard({
  name,
  badge,
  price,
  period,
  description,
  features,
  footer,
  actions,
  className,
}: {
  name: string;
  badge?: string;
  price?: string;
  period?: string;
  description?: string;
  features?: string[];
  footer?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-line bg-paper p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-ink">{name}</h3>
            {badge && (
              <span className="rounded-control bg-field px-2 py-0.5 text-[11px] font-medium text-ink-mute">
                {badge}
              </span>
            )}
          </div>
          {description && <p className="mt-1 text-[13px] text-ink-mute">{description}</p>}
        </div>
        {price && (
          <p className="text-right text-[14px] font-semibold text-ink">
            {price}
            {period && <span className="block text-[12px] font-normal text-ink-mute">{period}</span>}
          </p>
        )}
      </div>
      {features && features.length > 0 && (
        <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[12px] text-ink-soft">
              <Check className="mt-0.5 size-3 shrink-0 text-ink-mute" />
              {f}
            </li>
          ))}
        </ul>
      )}
      {footer && <div className="mt-4 rounded-control bg-field px-3 py-2 text-[12px] text-ink-mute">{footer}</div>}
      {actions && <div className="mt-4 flex justify-end gap-2">{actions}</div>}
    </div>
  );
}

export function WizardCard({
  title,
  children,
  footer,
  className,
}: {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-xl rounded-card border border-line bg-paper p-6 shadow-[var(--st-shadow-card)]", className)}>
      {title && <h2 className="mb-4 text-lg font-bold tracking-tight text-ink">{title}</h2>}
      {children}
      {footer && <div className="mt-6 flex items-center justify-between gap-3">{footer}</div>}
    </div>
  );
}

export function WizardFooter({
  onBack,
  onNext,
  nextLabel = "Continue",
  className,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {onBack ? (
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
      ) : (
        <span />
      )}
      <Button size="sm" onClick={onNext}>{nextLabel}</Button>
    </div>
  );
}
