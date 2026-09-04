"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Icon } from "./Icon";

type ToastAction = { label: string; run: () => void };
type ToastRow = { id: number; msg: string; action?: ToastAction; leaving?: boolean };
type Ctx = { show: (msg: string, action?: ToastAction, ms?: number) => void };

const ToastCtx = createContext<Ctx>({ show: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [rows, setRows] = useState<ToastRow[]>([]);
  const seq = useRef(0);
  const timers = useRef<Record<number, number>>({});

  const remove = useCallback((id: number) => {
    setRows((r) => r.filter((x) => x.id !== id));
    const t = timers.current[id];
    if (t) { clearTimeout(t); delete timers.current[id]; }
  }, []);

  // mark leaving, let the CSS exit transition run, then unmount
  const dismiss = useCallback((id: number) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    const t = timers.current[id];
    if (t) { clearTimeout(t); delete timers.current[id]; }
    window.setTimeout(() => remove(id), 180);
  }, [remove]);

  const show = useCallback((msg: string, action?: ToastAction, ms = 5000) => {
    const id = ++seq.current;
    setRows((r) => [...r.slice(-2), { id, msg, action }]);
    timers.current[id] = window.setTimeout(() => dismiss(id), ms);
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="toasts">
        {rows.map((t) => (
          <div className={"toast" + (t.leaving ? " leaving" : "")} key={t.id}>
            <span>{t.msg}</span>
            {t.action && (
              <button className="toast-act" onClick={() => { t.action!.run(); dismiss(t.id); }}>
                {t.action.label}
              </button>
            )}
            <button className="toast-x" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
