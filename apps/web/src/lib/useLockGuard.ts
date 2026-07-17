import { useSession } from "@/stores/useSession";

/**
 * A locked session must not render the app. Returns true when the shell should
 * bounce to the unlock screen. We only redirect when there's NO stored
 * passphrase to auto-unlock with (`remembered` is false) - a remembered device
 * is mid auto-unlock on load and would otherwise flash the unlock screen.
 * After an explicit lock() the passphrase is forgotten, so `remembered` is
 * false and the guard fires.
 */
export function useLockGuard(): boolean {
  const status = useSession((s) => s.status);
  const remembered = useSession((s) => s.remembered);
  return status === "locked" && !remembered;
}
