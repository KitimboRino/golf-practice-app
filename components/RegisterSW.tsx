"use client";

import { useEffect } from "react";
import { useToast } from "./Toast";

// Registers the next-pwa / Workbox service worker. Done here rather than via
// next-pwa's `register: true` because that hooks the pages-router `main` bundle,
// which never loads in the app router.
export function RegisterSW() {
  const toast = useToast();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let reg: ServiceWorkerRegistration | undefined;

    const register = async () => {
      try {
        reg = await navigator.serviceWorker.register("/sw.js");
      } catch {
        return;
      }
      reg.addEventListener("updatefound", () => {
        const next = reg!.installing;
        if (!next) return;
        next.addEventListener("statechange", () => {
          if (next.state === "installed" && navigator.serviceWorker.controller) {
            toast.show(
              "New version available",
              { label: "Reload", run: () => location.reload() },
              20000,
            );
          }
        });
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, [toast]);

  return null;
}
