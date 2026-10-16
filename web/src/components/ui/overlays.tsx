"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "./button";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  full?: boolean;
};

/** Native <dialog> as a bottom sheet: focus trap, Esc to close, focus returns to the opener. */
export function BottomSheet({ open, onClose, title, children, full }: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 mt-auto w-full max-w-none bg-transparent p-0 text-fg",
        "sm:mx-auto sm:max-w-[var(--content-max)]",
      )}
    >
      <div className={cn("flex flex-col rounded-t-lg bg-bg shadow-pop", full ? "h-[92dvh]" : "max-h-[85dvh]")}>
        <div aria-hidden className="mx-auto mt-2 h-1 w-10 rounded-pill bg-border" />
        <div className="flex items-center justify-between px-4 pt-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X aria-hidden className="size-5" />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2">{children}</div>
      </div>
    </dialog>
  );
}

type ToastTone = "info" | "success" | "error";
type Toast = { id: number; message: string; tone: ToastTone; action?: { label: string; onClick: () => void } };
type ToastApi = { show: (message: string, opts?: { tone?: ToastTone; action?: Toast["action"] }) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast needs a <ToastProvider>");
  return api;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const show = useCallback<ToastApi["show"]>((message, opts) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, message, tone: opts?.tone ?? "info", action: opts?.action }]);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(onDone, 5000);
    return () => clearTimeout(timer);
  }, [paused, onDone]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-full max-w-[var(--content-max)] items-center justify-between gap-3 rounded-md bg-fg px-4 py-3 text-sm text-bg shadow-pop"
    >
      <span>{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDone();
          }}
          className="h-9 shrink-0 rounded-sm px-2 font-semibold underline underline-offset-2"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}
