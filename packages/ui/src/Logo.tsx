import { clsx } from "clsx";

/** The Umbry skull mascot. Renders the dark glyph on a mint field by default. */
export function UmbryMark({
  size = 32,
  className,
  rounded = "rounded-[28%]",
  glyphColor = "var(--accent-ink)",
  fieldColor = "var(--accent)",
}: {
  size?: number;
  className?: string;
  rounded?: string;
  glyphColor?: string;
  fieldColor?: string;
}) {
  return (
    <span
      className={clsx("inline-grid place-items-center", rounded, className)}
      style={{ width: size, height: size, background: fieldColor }}
    >
      <svg
        width={size * 0.66}
        height={size * 0.66}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
      >
        <path
          d="M32 8c-12.7 0-23 9.7-23 21.8 0 7.4 3.9 13.9 9.8 17.8v6.1c0 1.6 1.3 2.9 3 2.9h20.4c1.7 0 3-1.3 3-2.9v-6.1c5.9-3.9 9.8-10.4 9.8-17.8C55 17.7 44.7 8 32 8Z"
          fill={glyphColor}
        />
        <ellipse cx="23" cy="30" rx="6" ry="7.2" fill={fieldColor} />
        <ellipse cx="41" cy="30" rx="6" ry="7.2" fill={fieldColor} />
        <path
          d="M28.8 44h6.4l-2.2 5.6a1.1 1.1 0 0 1-2 0L28.8 44Z"
          fill={fieldColor}
        />
      </svg>
    </span>
  );
}

/** Full lockup: mark + wordmark. */
export function UmbryLogo({
  size = 32,
  showWordmark = true,
  subtitle,
  className,
}: {
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      <UmbryMark size={size} className="glow-accent" />
      {showWordmark && (
        <div className="leading-none">
          <div
            className="font-display font-bold tracking-tight text-text"
            style={{ fontSize: size * 0.58 }}
          >
            Umbry
          </div>
          {subtitle && (
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
