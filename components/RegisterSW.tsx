"use client";

import { useEffect } from "react";
import { useToast } from "./Toast";

// Registers the hand-written service worker (public/sw.js). Also forces an
// update check on load so a fix reaches a wedged install fast — the browser
// fetches /sw.js from the network for this, bypassing the old SW.
export function RegisterSW() {
  const toast = useToast();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    const register = async () => {
      let reg: ServiceWorkerRegistration;
      try {
        reg = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
      } catch {
        return;
      }
      if (cancelled) return;

      reg.update().catch(() => {});

      reg.addEventListener("updatefound", () => {
        const next = reg.installing;
        if (!next) return;
        next.addEventListener("statechange", () => {
          if (next.state === "installed" && navigator.serviceWorker.controller) {
            toast.show(
              "New version ready",
              { label: "Reload", run: () => location.reload() },
              20000,
            );
          }
        });
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => { cancelled = true; };
  }, [toast]);

  return null;
}
