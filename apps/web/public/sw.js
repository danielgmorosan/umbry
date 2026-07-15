/**
 * Minimal service worker — exists so OS notifications work everywhere:
 * Android/installed-PWA contexts reject `new Notification()` and only allow
 * ServiceWorkerRegistration.showNotification(). No fetch handler on purpose
 * (no caching, no offline behavior, nothing intercepting Vite/HMR).
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Clicking a notification focuses an open app tab (deep-linking to the
// notification's route) or opens a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          // Best-effort deep link; navigate() may be unavailable on some platforms.
          if (client.navigate && link) client.navigate(link).catch(() => {});
          return;
        }
      }
      return self.clients.openWindow(link);
    }),
  );
});
