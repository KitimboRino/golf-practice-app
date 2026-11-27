"use client";

// In-app drill video player. A Watch button calls useVideo().watch(url); this
// opens a sheet with YouTube's privacy-enhanced embed, which loads only then
// (nothing is fetched from YouTube until a video is asked for). Offline it
// says so instead of showing a broken frame. "Open in YouTube" stays as a way
// out either way. Same dialog behaviour as Confirm: focus moves in, Tab stays
// inside, Escape or the scrim closes, focus returns to the button.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { embedUrl, videoInfo, type DrillVideo } from "@/lib/drillVideos";
import { Icon } from "./Icon";

type Ctx = { watch: (url: string) => void };
const VideoCtx = createContext<Ctx>({ watch: () => {} });
export const useVideo = () => useContext(VideoCtx);

type Open = DrillVideo & { id: string };

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [vid, setVid] = useState<Open | null>(null);
  const [online, setOnline] = useState(true);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const watch = useCallback((url: string) => {
    const info = videoInfo(url);
    if (!info) { window.open(url, "_blank", "noopener"); return; }
    restoreRef.current = document.activeElement as HTMLElement | null;
    setOnline(navigator.onLine);
    setVid(info);
  }, []);
  const close = useCallback(() => setVid(null), []);

  useEffect(() => {
    if (!vid) return;
    dialogRef.current?.querySelector<HTMLElement>(".video-close")?.focus();
    const focusables = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href], iframe") ?? []);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const goOnline = () => setOnline(true), goOffline = () => setOnline(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    const restore = restoreRef.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      restore?.focus?.();
    };
  }, [vid, close]);

  return (
    <VideoCtx.Provider value={{ watch }}>
      {children}
      {vid && (
        <div className="confirm-scrim video-scrim" onClick={close}>
          <div
            ref={dialogRef}
            className={"video-sheet" + (vid.short ? " short" : "")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="video-head">
              <div className="video-meta">
                <div id="video-title" className="video-title">{vid.title}</div>
                <div className="video-channel">{vid.channel}</div>
              </div>
              <button className="icon-btn video-close" onClick={close} aria-label="Close video">
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="video-frame">
              {online ? (
                <iframe
                  src={embedUrl(vid.id)}
                  title={vid.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  // the app sends no referrer by default; YouTube's embed needs
                  // at least the origin or it refuses to play
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="video-offline">
                  <Icon name="cloud_off" size={26} />
                  <span>Videos need a connection. Everything else in the app works offline.</span>
                </div>
              )}
            </div>
            <a className="video-out" href={vid.url} target="_blank" rel="noopener noreferrer">
              <Icon name="open_in_new" size={15} />Open in YouTube
            </a>
          </div>
        </div>
      )}
    </VideoCtx.Provider>
  );
}

/** The Watch button used on drill cards, the library, quick-session focus and Fixes. */
export function WatchButton({ url, label = "Watch", className = "drill-video", size = 16 }: {
  url: string; label?: string; className?: string; size?: number;
}) {
  const { watch } = useVideo();
  return (
    <button type="button" className={className} onClick={() => watch(url)}>
      <Icon name="smart_display" size={size} />{label}
    </button>
  );
}
