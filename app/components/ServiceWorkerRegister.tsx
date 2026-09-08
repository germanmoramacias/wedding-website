"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    const secureContext =
      window.location.protocol === "https:" || window.location.hostname === "localhost";
    if (!("serviceWorker" in navigator) || !secureContext) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .then(() => caches.keys())
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("inma-pascual-"))
              .map((key) => caches.delete(key)),
          ),
        )
        .catch(() => undefined);
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch(() => undefined);
  }, []);

  return null;
}
