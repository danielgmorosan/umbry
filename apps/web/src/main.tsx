import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { useSession } from "./stores/useSession";
import { CallDock } from "./components/CallDock";
import { IncomingCallOverlay } from "./components/IncomingCallOverlay";
import { NotificationToaster } from "./components/NotificationToaster";
import "./lib/devLivekit";
import "./index.css";

// Warm up the SDK + load WASM early so unlock is fast (fire-and-forget).
void useSession.getState().warmup();

// Register the notification service worker (required for OS notifications on
// Android/PWA; harmless elsewhere — it has no fetch handler).
if ("serviceWorker" in navigator) {
  void navigator.serviceWorker.register("/sw.js").catch(() => {});
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    {/* Persistent call dock — outside the router so an active call survives
        every navigation (T-14). Renders nothing while no call is live. */}
    <CallDock />
    {/* Incoming DM call ring (T3) — outside the router so it rings on every page. */}
    <IncomingCallOverlay />
    {/* Live notification toasts (T2-09) — outside the router for the same reason. */}
    <NotificationToaster />
  </StrictMode>,
);
