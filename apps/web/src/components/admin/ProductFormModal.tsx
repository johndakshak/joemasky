"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { adminCreateProduct, adminUpdateProduct } from "@/lib/api/adminProducts";
import { ApiError } from "@/lib/api/client";
import type { Product } from "@/types/product";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  description: z.string().trim().optional(),
  price: z
    .string()
    .trim()
    .min(1, "Price is required.")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Price must be a positive number."),
  categoryId: z
    .string()
    .min(1, "Category is required.")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Please select a category."),
});

type FormFields = z.infer<typeof formSchema>;
type FieldErrors = Partial<Record<keyof FormFields | "image", string>>;

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    fontSize: "0.875rem",
    borderColor: hasError ? "#b05c3a" : "#d4cfc6",
    borderRadius: "6px",
  };
}

function TagInput({
  label,
  id,
  tags,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  id: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [inputValue, setInputValue] = useState("");

  function commitInput() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const newTags = trimmed
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !tags.includes(t));
    if (newTags.length > 0) onChange([...tags, ...newTags]);
    setInputValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); commitInput(); }
    if (e.key === ",") {
      // Commit immediately on comma so the helper-text promise ("Press Enter or
      // comma to add") is fulfilled without requiring a subsequent Enter/blur.
      e.preventDefault();
      commitInput();
    }
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-barlow uppercase mb-1.5"
        style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}
      >
        {label}
      </label>
      <div
        className="flex flex-wrap gap-1.5 p-2 border bg-white min-h-[2.75rem] cursor-text"
        style={{ borderColor: "#d4cfc6", borderRadius: "6px" }}
        onClick={() => document.getElementById(id)?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 font-barlow font-medium px-2 py-0.5"
            style={{
              fontSize: "0.72rem",
              background: "rgba(200,160,48,0.12)",
              color: "var(--charcoal)",
              border: "1px solid rgba(200,160,48,0.3)",
              borderRadius: "3px",
            }}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(tags.filter((t) => t !== tag)); }}
                aria-label={`Remove ${tag}`}
                className="cursor-pointer leading-none hover:text-gold transition-colors"
                style={{ lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitInput}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[6rem] outline-none font-barlow bg-transparent cursor-text"
          style={{ fontSize: "0.85rem" }}
        />
      </div>
      <p className="mt-1 font-barlow font-light" style={{ fontSize: "0.7rem", color: "var(--warmgray)" }}>
        Press Enter or comma to add. Backspace removes the last tag.
      </p>
    </div>
  );
}

interface ProductFormModalProps {
  mode: "create" | "edit";
  product?: Product;
  onSuccess: () => void;
  onClose: () => void;
}

export function ProductFormModal({ mode, product, onSuccess, onClose }: ProductFormModalProps) {
  const token = useAdminAuthStore((state) => state.token);
  const logout = useAdminAuthStore((state) => state.logout);
  const router = useRouter();

  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [categoryId, setCategoryId] = useState(product ? String(product.categoryId) : "");
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);
  const [colors, setColors] = useState<string[]>(product?.colors ?? []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl ?? null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Move focus into the modal when it opens so keyboard users don't have to
  // tab from wherever focus was before. Using a short rAF avoids racing with
  // any CSS transition that may briefly hide the element.
  useEffect(() => {
    const id = requestAnimationFrame(() => { firstFieldRef.current?.focus(); });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isSubmitting]);

  // Focus trap: keep Tab/Shift+Tab cycling within the dialog panel.
  // Queries the live DOM so dynamically shown/hidden elements (e.g. error
  // messages with focusable children) are always accounted for.
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

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    panel.addEventListener("keydown", handleTrap);
    return () => panel.removeEventListener("keydown", handleTrap);
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (fieldErrors.image) setFieldErrors((prev) => ({ ...prev, image: undefined }));
  }

  function clearFieldError(field: keyof FieldErrors) {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    if (formError) setFormError("");
  }

  function validate(): boolean {
    const result = formSchema.safeParse({ name, description, price, categoryId });
    const errors: FieldErrors = {};

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormFields;
        if (!errors[field]) errors[field] = issue.message;
      }
    }

    if (mode === "create" && !imageFile) {
      errors.image = "A product image is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!token) { setFormError("You are not authenticated. Please log in again."); return; }
    if (!validate()) return;

    setIsSubmitting(true);
    setFormError("");

    // When a 401 occurs the onUnauthorized callback calls logout() and
    // router.push(). Setting state afterwards on a redirecting/unmounting
    // component is unnecessary; this flag lets the finally block skip it.
    let redirecting = false;
    const onUnauthorized = () => { redirecting = true; logout(); router.push("/admin/login"); };

    try {
      if (mode === "create") {
        await adminCreateProduct(
          token,
          {
            name: name.trim(),
            description: description.trim() || undefined,
            price: Number(price),
            categoryId: Number(categoryId),
            sizes: sizes.length > 0 ? sizes : undefined,
            colors: colors.length > 0 ? colors : undefined,
            image: imageFile!,
          },
          onUnauthorized
        );
        toast.success("Product created successfully.");
      } else {
        // Derive clear flags: send clearSizes/clearColors only when the admin
        // removed every tag from a field that originally had at least one tag.
        const originalSizesCount = product!.sizes?.length ?? 0;
        const originalColorsCount = product!.colors?.length ?? 0;
        const clearSizes = sizes.length === 0 && originalSizesCount > 0;
        const clearColors = colors.length === 0 && originalColorsCount > 0;

        await adminUpdateProduct(
          token,
          product!.id,
          {
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            categoryId: Number(categoryId),
            sizes: sizes.length > 0 ? sizes : undefined,
            colors: colors.length > 0 ? colors : undefined,
            clearSizes,
            clearColors,
            image: imageFile ?? undefined,
          },
          onUnauthorized
        );
        toast.success("Product updated successfully.");
      }

      onSuccess();
    } catch (err) {
      // Do not update state if a 401 redirect is already in progress.
      if (!redirecting) {
        if (err instanceof ApiError) {
          switch (err.status) {
            case 400: setFormError(err.message || "Please check your input and try again."); break;
            // 401: onUnauthorized has already set redirecting=true; the outer
            // guard above means we never reach this branch while redirecting.
            case 401: break;
            case 404: setFormError("Category not found. Please select a valid category."); break;
            case 409: setFormError(err.message || "A conflict occurred. Please try again."); break;
            case 429: setFormError("Too many requests. Please wait a moment and try again."); break;
            default:  setFormError("Something went wrong on our end. Please try again.");
          }
        } else {
          setFormError("Unable to connect. Check your internet connection.");
        }
      }
    } finally {
      // Skip state update if the component is about to be unmounted by a redirect.
      if (!redirecting) setIsSubmitting(false);
    }
  }

  const title = mode === "create" ? "Add Product" : "Edit Product";
  const submitLabel = isSubmitting
    ? mode === "create" ? "Creating…" : "Saving…"
    : mode === "create" ? "Create Product" : "Save Changes";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background: "rgba(28,26,20,0.65)", padding: "2rem 1rem" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div className="absolute inset-0" aria-hidden="true" onClick={!isSubmitting ? onClose : undefined} />

      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl bg-white z-10 rounded-xl overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.28)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-5" style={{ background: "#1c1a14" }}>
          <h2
            id="product-form-title"
            className="font-bebas tracking-wider text-cream"
            style={{ fontSize: "1.5rem" }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer w-8 h-8 flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.color = "var(--gold)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-8 py-7 space-y-6">

          {formError && (
            <div
              className="px-4 py-3 font-barlow text-sm rounded-md"
              style={{ background: "rgba(176,92,58,0.08)", border: "1px solid rgba(176,92,58,0.3)", color: "#b05c3a" }}
              role="alert"
              aria-live="polite"
            >
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="pf-name" className="block font-barlow uppercase mb-1.5" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}>
              Product Name <span aria-hidden="true" style={{ color: "#b05c3a" }}>*</span>
            </label>
            <input
              type="text"
              id="pf-name"
              ref={firstFieldRef}
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
              disabled={isSubmitting}
              placeholder="e.g. Classic Leather Loafer"
              aria-describedby={fieldErrors.name ? "pf-name-err" : undefined}
              aria-invalid={!!fieldErrors.name}
              className="w-full border bg-white px-3 py-2.5 font-barlow text-charcoal outline-none transition-colors focus:border-charcoal/40"
              style={inputStyle(!!fieldErrors.name)}
            />
            {fieldErrors.name && (
              <p id="pf-name-err" className="mt-1.5 font-barlow" style={{ fontSize: "0.75rem", color: "#b05c3a" }} role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="pf-price" className="block font-barlow uppercase mb-1.5" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}>
                Price (₦) <span aria-hidden="true" style={{ color: "#b05c3a" }}>*</span>
              </label>
              <input
                type="number"
                id="pf-price"
                value={price}
                onChange={(e) => { setPrice(e.target.value); clearFieldError("price"); }}
                disabled={isSubmitting}
                placeholder="0"
                min="0"
                step="0.01"
                aria-describedby={fieldErrors.price ? "pf-price-err" : undefined}
                aria-invalid={!!fieldErrors.price}
                className="w-full border bg-white px-3 py-2.5 font-barlow text-charcoal outline-none transition-colors focus:border-charcoal/40"
                style={inputStyle(!!fieldErrors.price)}
              />
              {fieldErrors.price && (
                <p id="pf-price-err" className="mt-1.5 font-barlow" style={{ fontSize: "0.75rem", color: "#b05c3a" }} role="alert">
                  {fieldErrors.price}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pf-category" className="block font-barlow uppercase mb-1.5" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}>
                Category <span aria-hidden="true" style={{ color: "#b05c3a" }}>*</span>
              </label>
              <select
                id="pf-category"
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); clearFieldError("categoryId"); }}
                disabled={isSubmitting || categoriesLoading}
                aria-describedby={fieldErrors.categoryId ? "pf-category-err" : undefined}
                aria-invalid={!!fieldErrors.categoryId}
                className="w-full border bg-white px-3 py-2.5 font-barlow text-charcoal outline-none transition-colors focus:border-charcoal/40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  ...inputStyle(!!fieldErrors.categoryId),
                  appearance: "none",
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6860' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">{categoriesLoading ? "Loading…" : "Select a category"}</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                ))}
              </select>
              {fieldErrors.categoryId && (
                <p id="pf-category-err" className="mt-1.5 font-barlow" style={{ fontSize: "0.75rem", color: "#b05c3a" }} role="alert">
                  {fieldErrors.categoryId}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="pf-description" className="block font-barlow uppercase mb-1.5" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}>
              Description <span className="font-light normal-case" style={{ letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              id="pf-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="Short product description…"
              rows={3}
              className="w-full border bg-white px-3 py-2.5 font-barlow text-charcoal outline-none transition-colors focus:border-charcoal/40 resize-none"
              style={{ fontSize: "0.875rem", borderColor: "#d4cfc6", borderRadius: "6px" }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TagInput label="Sizes (optional)" id="pf-sizes" tags={sizes} onChange={setSizes} placeholder="e.g. S, M, L, XL" disabled={isSubmitting} />
            <TagInput label="Colors (optional)" id="pf-colors" tags={colors} onChange={setColors} placeholder="e.g. Black, White" disabled={isSubmitting} />
          </div>

          <div>
            <label htmlFor="pf-image" className="block font-barlow uppercase mb-1.5" style={{ fontSize: "0.68rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}>
              Product Image{" "}
              {mode === "create" ? (
                <span aria-hidden="true" style={{ color: "#b05c3a" }}>*</span>
              ) : (
                <span className="font-light normal-case" style={{ letterSpacing: 0 }}>(leave blank to keep current)</span>
              )}
            </label>

            {imagePreview && (
              <div className="mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Product preview" className="h-28 w-28 object-cover border border-charcoal/10 rounded" />
              </div>
            )}

            {/* Native file input — browser renders "Choose File" + filename automatically.
                Content-Type must not be set manually; the multipart boundary is added
                by the browser when FormData is passed to fetch. */}
            <input
              type="file"
              id="pf-image"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              disabled={isSubmitting}
              aria-describedby={fieldErrors.image ? "pf-image-err" : undefined}
              aria-invalid={!!fieldErrors.image}
              className="cursor-pointer w-full font-barlow text-charcoal
                         file:cursor-pointer file:mr-3 file:px-4 file:py-2
                         file:border-0 file:rounded file:font-barlow file:font-medium
                         file:text-xs file:uppercase file:tracking-widest
                         file:bg-charcoal/[.06] file:text-charcoal
                         file:hover:bg-charcoal/[.10] file:transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                fontSize: "0.82rem",
                border: `1px solid ${fieldErrors.image ? "#b05c3a" : "#d4cfc6"}`,
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
              }}
            />
            {fieldErrors.image && (
              <p id="pf-image-err" className="mt-1.5 font-barlow" style={{ fontSize: "0.75rem", color: "#b05c3a" }} role="alert">
                {fieldErrors.image}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 border-t border-charcoal/[.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded border border-charcoal/20 font-barlow font-medium uppercase tracking-widest text-charcoal transition-colors hover:border-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: "0.72rem" }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded font-barlow font-medium uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: "0.72rem", background: "var(--gold)", color: "var(--charcoal)", border: "none" }}
              onMouseOver={(e) => { if (!isSubmitting) { e.currentTarget.style.background = "var(--charcoal)"; e.currentTarget.style.color = "var(--cream)"; } }}
              onMouseOut={(e) => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "var(--charcoal)"; }}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
