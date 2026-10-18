"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/types/category";

interface CategoryFormModalProps {
  /** "create" opens a blank form; "rename" pre-fills with the category's name. */
  mode: "create" | "rename";
  category?: Category;
  onSubmit: (name: string) => Promise<boolean>;
  onClose: () => void;
  isSaving: boolean;
}

// Minimum name length must match the backend validateName rule (minLength = 2).
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;

export function CategoryFormModal({
  mode,
  category,
  onSubmit,
  onClose,
  isSaving,
}: CategoryFormModalProps) {
  const isRename = mode === "rename";
  const initialName = isRename ? (category?.name ?? "") : "";

  const [name, setName] = useState(initialName);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Return focus to the opener when the modal unmounts.
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    return () => { previousFocusRef.current?.focus(); };
  }, []);

  // Auto-focus the text input on open.
  useEffect(() => {
    const id = requestAnimationFrame(() => { inputRef.current?.focus(); });
    return () => cancelAnimationFrame(id);
  }, []);

  // Escape closes the modal unless a save is in progress.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSaving) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isSaving]);

  // Focus trap: cycle Tab / Shift+Tab within the panel.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    function handleTrap(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        panel!.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.closest("[aria-hidden='true']"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

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

  function validate(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed.length === 0) return "Category name is required.";
    if (trimmed.length < MIN_NAME_LENGTH)
      return `Name must be at least ${MIN_NAME_LENGTH} characters.`;
    if (trimmed.length > MAX_NAME_LENGTH)
      return `Name must not exceed ${MAX_NAME_LENGTH} characters.`;
    return null;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    // Clear field error on change so the user sees immediate feedback.
    if (fieldError) setFieldError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();
    const error = validate(trimmed);
    if (error) {
      setFieldError(error);
      inputRef.current?.focus();
      return;
    }

    // No-op if the name is unchanged in rename mode.
    if (isRename && trimmed === (category?.name ?? "").trim()) {
      onClose();
      return;
    }

    const success = await onSubmit(trimmed);
    if (success) {
      // The parent closes the modal via onMutationSuccess → onClose.
      // Nothing to do here on success.
    }
  }

  const title = isRename ? "Rename Category" : "Add Category";
  const submitLabel = isRename ? "Save Changes" : "Create Category";
  const savingLabel = isRename ? "Saving…" : "Creating…";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(28,26,20,0.65)", padding: "1rem" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-form-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={!isSaving ? onClose : undefined}
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-sm bg-white z-10 rounded-xl overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.28)" }}
      >
        {/* Header */}
        <div className="px-7 py-5" style={{ background: "#1c1a14" }}>
          <h2
            id="category-form-dialog-title"
            className="font-bebas tracking-wider text-cream"
            style={{ fontSize: "1.4rem" }}
          >
            {title}
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-7 py-6 space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="category-name-input"
                className="block font-barlow font-medium text-charcoal uppercase tracking-widest"
                style={{ fontSize: "0.6rem" }}
              >
                Category Name
              </label>
              <input
                ref={inputRef}
                id="category-name-input"
                type="text"
                value={name}
                onChange={handleChange}
                disabled={isSaving}
                autoComplete="off"
                maxLength={MAX_NAME_LENGTH + 1}
                aria-describedby={fieldError ? "category-name-error" : undefined}
                aria-invalid={fieldError ? "true" : undefined}
                placeholder="e.g. Sneakers"
                className="w-full px-4 py-2.5 border font-barlow font-light text-charcoal
                           placeholder:text-warmgray/60 transition-colors outline-none
                           focus:border-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontSize: "0.85rem",
                  borderColor: fieldError ? "#b05c3a" : "rgba(28,26,20,0.2)",
                  borderRadius: "4px",
                }}
              />
              {fieldError && (
                <p
                  id="category-name-error"
                  role="alert"
                  className="font-barlow font-light"
                  style={{ fontSize: "0.75rem", color: "#b05c3a" }}
                >
                  {fieldError}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded border
                           border-charcoal/20 font-barlow font-medium uppercase tracking-widest
                           text-charcoal transition-colors hover:border-charcoal
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: "0.72rem" }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded font-barlow
                           font-medium uppercase tracking-widest transition-colors
                           bg-charcoal text-cream hover:bg-gold hover:text-charcoal
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                           focus-visible:outline-gold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: "0.72rem" }}
              >
                {isSaving ? savingLabel : submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
