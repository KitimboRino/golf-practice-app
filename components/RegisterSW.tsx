"use client";

import { useEffect } from "react";

// Registers the next-pwa / Workbox service worker. Done here rather than via
// next-pwa's `register: true` because that hooks the pages-router `main` bundle,
// which never loads in the app router.
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
