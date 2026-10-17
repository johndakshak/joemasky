"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useProductMutations } from "@/hooks/useProductMutations";
import type { Product } from "@/types/product";

function AvailabilityToggle({
  product,
  onToggle,
  disabled,
}: {
  product: Product;
  onToggle: (product: Product) => void;
  disabled: boolean;
}) {
  const isOn = product.isAvailable;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={`${product.name} is ${isOn ? "available" : "unavailable"}. Click to toggle.`}
      onClick={() => onToggle(product)}
      disabled={disabled}
      className="flex items-center gap-2 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span
        className="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border transition-colors"
        style={{
          background: isOn ? "rgba(28,26,20,0.12)" : "rgba(200,200,200,0.18)",
          borderColor: isOn ? "var(--charcoal)" : "#d4cfc6",
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform"
          style={{
            background: isOn ? "var(--charcoal)" : "#d4cfc6",
            transform: isOn ? "translateX(1rem)" : "translateX(0)",
          }}
        />
      </span>
      <span
        className="font-barlow font-medium"
        style={{
          fontSize: "0.68rem",
          letterSpacing: "0.1em",
          color: isOn ? "var(--charcoal)" : "var(--warmgray)",
        }}
      >
        {isOn ? "Available" : "Unavailable"}
      </span>
    </button>
  );
}

function ProductRow({
  product,
  onEdit,
  onDelete,
  onToggleAvailability,
  togglingIds,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onToggleAvailability: (p: Product) => void;
  togglingIds: Set<number>;
}) {
  return (
    <tr className="border-b border-charcoal/[.05] hover:bg-archive/40 transition-colors">
      <td className="px-5 py-3.5">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-12 w-12 object-cover border border-charcoal/10 flex-shrink-0 rounded"
          />
        ) : (
          <div
            className="h-12 w-12 flex items-center justify-center border border-charcoal/10 rounded"
            style={{ background: "var(--archive)" }}
            aria-label="No image"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ color: "var(--warmgray)" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </td>

      <td className="px-5 py-3.5">
        <p className="font-barlow font-medium text-charcoal" style={{ fontSize: "0.85rem" }}>
          {product.name}
        </p>
      </td>

      <td className="px-5 py-3.5">
        <p className="font-barlow font-light text-charcoal" style={{ fontSize: "0.82rem" }}>
          {product.category?.name ?? "—"}
        </p>
      </td>

      <td className="px-5 py-3.5">
        {product.colors && product.colors.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {product.colors.map((c) => (
              <span
                key={c}
                className="font-barlow"
                style={{
                  fontSize: "0.62rem",
                  padding: "1px 5px",
                  background: "rgba(28,26,20,0.06)",
                  border: "1px solid rgba(28,26,20,0.12)",
                  color: "var(--charcoal)",
                  borderRadius: "2px",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        ) : (
          <span className="font-barlow font-light" style={{ fontSize: "0.72rem", color: "var(--warmgray)" }}>
            —
          </span>
        )}
      </td>

      <td className="px-5 py-3.5 hidden sm:table-cell">
        <span className="font-barlow font-medium text-charcoal" style={{ fontSize: "0.85rem" }}>
          ₦{Number(product.price).toLocaleString()}
        </span>
      </td>

      <td className="px-5 py-3.5 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {product.sizes && product.sizes.length > 0 ? (
            product.sizes.map((s) => (
              <span
                key={s}
                className="font-barlow"
                style={{
                  fontSize: "0.65rem",
                  padding: "1px 6px",
                  background: "rgba(200,160,48,0.10)",
                  border: "1px solid rgba(200,160,48,0.2)",
                  color: "var(--charcoal)",
                  borderRadius: "2px",
                }}
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-warmgray font-barlow" style={{ fontSize: "0.72rem" }}>—</span>
          )}
        </div>
      </td>

      <td className="px-5 py-3.5 hidden md:table-cell">
        {/* Only this product's toggle is disabled while its own request is in-flight */}
        <AvailabilityToggle
          product={product}
          onToggle={onToggleAvailability}
          disabled={togglingIds.has(product.id)}
        />
      </td>

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(product)}
            title={`Edit ${product.name}`}
            aria-label={`Edit ${product.name}`}
            className="cursor-pointer w-8 h-8 flex items-center justify-center border border-charcoal/15 text-charcoal transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onDelete(product)}
            title={`Delete ${product.name}`}
            aria-label={`Delete ${product.name}`}
            className="group cursor-pointer w-8 h-8 flex items-center justify-center border border-charcoal/15 text-warmgray transition-colors hover:border-red-400 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
          >
            <svg className="w-3.5 h-3.5 text-warmgray group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

const TABLE_HEADERS = [
  { label: "Name",         className: "" },
  { label: "Category",     className: "" },
  { label: "Colors",       className: "" },
  { label: "Price",        className: "hidden sm:table-cell" },
  { label: "Sizes",        className: "hidden lg:table-cell" },
  { label: "Availability", className: "hidden md:table-cell" },
  { label: "Actions",      className: "" },
];

export default function AdminProductsPage() {
  const { data: products, isLoading, isError, refetch } = useAdminProducts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const {
    togglingIds,
    isDeleting,
    handleDelete,
    handleToggleAvailability,
    handleMutationSuccess,
  } = useProductMutations(() => {
    setShowCreateModal(false);
    setEditProduct(null);
    setDeleteProduct(null);
  });

  return (
    <AdminShell>
      <div className="p-6 md:p-10">

        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1
              className="font-bebas tracking-wider text-charcoal leading-none"
              style={{ fontSize: "2rem" }}
            >
              Products
            </h1>
            <p
              className="font-barlow font-light text-warmgray mt-1"
              style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}
            >
              {isLoading
                ? "Loading…"
                : products
                ? `${products.length} product${products.length !== 1 ? "s" : ""}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded font-barlow font-medium uppercase tracking-widest bg-charcoal text-cream hover:bg-gold hover:text-charcoal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold flex-shrink-0"
            style={{ fontSize: "0.72rem", border: "none" }}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
        </div>

        {isLoading && <LoadingState message="Loading products…" />}

        {isError && (
          <ErrorState
            message="Could not load products. Please try again."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && products && products.length === 0 && (
          <EmptyState
            title="No Products Yet"
            description="Add your first product to start building your catalogue."
          />
        )}

        {!isLoading && !isError && products && products.length > 0 && (
          <div className="bg-white border border-charcoal/[.06] overflow-x-auto rounded-lg">
            {/* min-w keeps columns readable; overflow-x-auto handles narrow screens */}
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-charcoal/[.05]" style={{ background: "var(--archive)" }}>
                  <th className="px-5 py-3 w-16" aria-label="Image" />
                  {TABLE_HEADERS.map(({ label, className }) => (
                    <th
                      key={label}
                      className={`px-5 py-3 text-left font-barlow font-medium uppercase ${className}`}
                      style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--warmgray)" }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={setEditProduct}
                    onDelete={setDeleteProduct}
                    onToggleAvailability={handleToggleAvailability}
                    togglingIds={togglingIds}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <ProductFormModal
          mode="create"
          onSuccess={handleMutationSuccess}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editProduct && (
        <ProductFormModal
          mode="edit"
          product={editProduct}
          onSuccess={handleMutationSuccess}
          onClose={() => setEditProduct(null)}
        />
      )}

      {deleteProduct && (
        <DeleteConfirmDialog
          product={deleteProduct}
          onConfirm={() => handleDelete(deleteProduct)}
          onClose={() => { if (!isDeleting) setDeleteProduct(null); }}
          isDeleting={isDeleting}
        />
      )}
    </AdminShell>
  );
}
