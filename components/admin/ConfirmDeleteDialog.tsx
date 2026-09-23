"use client";

import { useEffect, useRef } from "react";

export function ConfirmDeleteDialog({
  title,
  description,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
      if (event.key === "Tab") {
        const target = event.target;
        if (event.shiftKey && target === cancelRef.current) {
          event.preventDefault();
          confirmRef.current?.focus();
        } else if (!event.shiftKey && target === confirmRef.current) {
          event.preventDefault();
          cancelRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description" className="w-full max-w-md border border-border bg-[#151515] p-6 shadow-2xl">
        <h2 id="delete-dialog-title" className="font-display text-2xl text-foreground">{title}</h2>
        <p id="delete-dialog-description" className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-8 flex justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={onCancel} disabled={busy} className="min-h-11 border border-border px-5 text-sm text-foreground hover:border-foreground/50 disabled:opacity-50">Cancel</button>
          <button ref={confirmRef} type="button" onClick={onConfirm} disabled={busy} className="min-h-11 border border-accent bg-accent px-5 text-sm text-background hover:bg-accent/85 disabled:opacity-50">{busy ? "Deleting…" : "Delete"}</button>
        </div>
      </div>
    </div>
  );
}
