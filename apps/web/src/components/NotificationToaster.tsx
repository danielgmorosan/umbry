import { useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useNotifications } from "@/stores/useNotifications";
import { useCall } from "@/stores/useCall";
import { router } from "@/app/router";
import { cn } from "@/lib/utils";

/**
 * Transient toast for live notifications (T2-09). Mounted outside the router
 * (main.tsx) so it survives navigation; clicking deep-links to the source.
 */
export function NotificationToaster() {
  const toast = useNotifications((s) => s.toast);
  const { dismissToast, markRead } = useNotifications.getState();
  // The mini-call window owns the bottom-right corner during a call - the
  // toast slides up above it instead of covering its controls (T3).
  const callActive = useCall((s) => s.status !== "idle");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 4500);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div className={cn("fixed right-4 z-50 w-80 font-stack", callActive ? "bottom-[300px]" : "bottom-4")}>
      <div className="st-pop-in flex items-start gap-2.5 rounded-card border border-line bg-paper p-3 shadow-[var(--st-shadow-card)]">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-control bg-field text-ink">
          <Bell className="size-3.5" />
        </span>
        <button
          onClick={() => {
            markRead(toast.id);
            dismissToast();
            void router.navigate(toast.link);
          }}
          className="min-w-0 flex-1 text-left"
        >
          <div className="truncate text-[13px] font-semibold text-ink">{toast.title}</div>
          <div className="line-clamp-2 text-[12.5px] leading-snug text-ink-mute">{toast.body}</div>
        </button>
        <button
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="grid size-6 shrink-0 place-items-center rounded-control text-ink-faint hover:bg-field hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
