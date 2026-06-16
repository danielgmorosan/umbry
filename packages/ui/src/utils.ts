import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Deterministic accent for an identity (mint-leaning palette, plus a few hues). */
const AVATAR_COLORS = [
  "#7FE9C3",
  "#6F8DFF",
  "#F4A259",
  "#E879A6",
  "#9B8CFF",
  "#5BC8E8",
  "#F4C453",
  "#7FD98C",
];

export function colorForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
