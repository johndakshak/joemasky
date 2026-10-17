"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/types/product";

interface DeleteConfirmDialogProps {
  product: Product;
  onConfirm: () => void;
  onClose: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmDialog({ product, onConfirm, onClose, isDeleting }: DeleteConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Return focus to whichever element opened the dialog when it unmounts.
  const previousFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    return () => { previousFocusRef.current?.focus(); };
  }, []);

  // Move focus to the Cancel button on open so the keyboard user cannot
  // accidentally confirm deletion without a deliberate action. rAF avoids
  // racing with any entry transition.
  useEffect(() => {
    const id = requestAnimationFrame(() => { cancelButtonRef.current?.focus(); });
    return () => cancelAnimationFrame(id);
  }, []);

  // Escape closes the dialog unless deletion is in progress.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isDeleting]);

  // Focus trap: cycle Tab / Shift+Tab within the dialog panel.
  // Also recovers focus back into the dialog if it somehow escapes.
  useEffect(() => {
    const panel = dialogRef.current;
    if (!panel) return;

    function handleTrap(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        panel!.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.closest("[aria-hidden='true']"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // If focus has escaped the panel entirely, pull it back in.
      if (!panel!.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    document.addEventListener("keydown", handleTrap);
    return () => document.removeEventListener("keydown", handleTrap);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(28,26,20,0.65)", padding: "1rem" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="absolute inset-0" aria-hidden="true" onClick={!isDeleting ? onClose : undefined} />

      <div
        ref={dialogRef}
        className="relative w-full max-w-md bg-white z-10 rounded-xl overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.28)" }}
      >
        <div className="px-7 py-5" style={{ background: "#1c1a14" }}>
          <h2 id="delete-dialog-title" className="font-bebas tracking-wider text-cream" style={{ fontSize: "1.4rem" }}>
            Delete Product
          </h2>
        </div>

        <div className="px-7 py-6 space-y-4">
          <p className="font-barlow font-light text-charcoal" style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
            Are you sure you want to delete{" "}
            <strong className="font-semibold">{product.name}</strong>?
            This action cannot be undone.
          </p>

          {/* Products referenced by existing orders cannot be deleted (backend returns 409). */}
          <div
            className="px-4 py-3 font-barlow rounded-md"
            style={{ fontSize: "0.78rem", background: "rgba(200,160,48,0.08)", border: "1px solid rgba(200,160,48,0.25)", color: "#7a5e10", lineHeight: "1.6" }}
          >
            <strong className="font-semibold">Note:</strong> Products that appear in existing
            customer orders cannot be deleted. If that is the case you will see an error message.
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded border border-charcoal/20 font-barlow font-medium uppercase tracking-widest text-charcoal transition-colors hover:border-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: "0.72rem" }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded font-barlow font-medium uppercase tracking-widest transition-colors bg-[#b05c3a] text-white hover:bg-[#8f4729] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: "0.72rem" }}
            >
              {isDeleting ? "Deleting…" : "Delete Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
