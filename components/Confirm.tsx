"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

type ConfirmOpts = {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};
type Ctx = { confirm: (opts: ConfirmOpts) => Promise<boolean> };

const ConfirmCtx = createContext<Ctx>({ confirm: async () => false });
export const useConfirm = () => useContext(ConfirmCtx);

// In-app replacement for window.confirm — a centered sheet in the app's own language.
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [row, setRow] = useState<(ConfirmOpts & { id: number }) | null>(null);
  const [leaving, setLeaving] = useState(false);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const leaveTimer = useRef<number | null>(null);

  // resolve the promise now (don't make callers wait for the exit), then let
  // the CSS exit transition run before unmounting
  const settle = useCallback((v: boolean) => {
    if (!resolver.current) return;
    resolver.current(v);
    resolver.current = null;
    setLeaving(true);
    leaveTimer.current = window.setTimeout(() => {
      setRow(null);
      setLeaving(false);
    }, 180);
  }, []);

  const confirm = useCallback(
    (opts: ConfirmOpts) =>
      new Promise<boolean>((resolve) => {
        if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
        resolver.current?.(false); // supersede any pending prompt
        resolver.current = resolve;
        setLeaving(false);
        setRow({ ...opts, id: Date.now() });
      }),
    [],
  );

  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(false);
      if (e.key === "Enter") settle(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [row, settle]);

  return (
    <ConfirmCtx.Provider value={{ confirm }}>
      {children}
      {row && (
        <div
          className={"confirm-scrim" + (leaving ? " leaving" : "")}
          onClick={() => settle(false)}
        >
          <div
            className={"confirm" + (leaving ? " leaving" : "")}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <span className={"icon-tile lg" + (row.tone === "danger" ? " danger" : "")}>
              <Icon name={row.tone === "danger" ? "warning" : "help"} size={20} fill />
            </span>
            <div id="confirm-title" className="confirm-title">{row.title}</div>
            {row.body && <p className="confirm-body">{row.body}</p>}
            <div className="confirm-actions">
              <button className="btn-ghost" onClick={() => settle(false)}>
                {row.cancelLabel ?? "Cancel"}
              </button>
              <button
                className={"confirm-go" + (row.tone === "danger" ? " danger" : "")}
                onClick={() => settle(true)}
                autoFocus
              >
                {row.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
