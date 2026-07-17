import type { ImgHTMLAttributes } from "react";
import { cn } from "../utils";

export interface BrandLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Set when the logo sits on an inverse surface (e.g. FooterBar). */
  onInverse?: boolean;
  /** Rendered height in px; width follows the asset's aspect ratio. */
  height?: number;
}

/**
 * Brand image lockup. The source asset is white-on-transparent
 * ("dark mode" logo); on light grounds the tokens invert it to ink,
 * so one file serves both themes and both surface kinds.
 */
export function BrandLogo({
  onInverse,
  height = 24,
  alt = "Umbry",
  className,
  style,
  ...props
}: BrandLogoProps) {
  return (
    <img
      alt={alt}
      draggable={false}
      className={cn(
        "w-auto select-none",
        onInverse
          ? "[filter:var(--st-logo-filter-on-inverse)]"
          : "[filter:var(--st-logo-filter)]",
        className,
      )}
      style={{ height, ...style }}
      {...props}
    />
  );
}
