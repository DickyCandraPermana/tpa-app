"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV !== "test"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            if (process.env.NODE_ENV === "development") {
              console.log("Service Worker registered:", registration.scope);
            }
          })
          .catch((error) => {
            console.warn("Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
