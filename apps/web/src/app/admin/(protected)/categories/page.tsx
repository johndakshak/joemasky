"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import { CategoryDeleteConfirmDialog } from "@/components/admin/CategoryDeleteConfirmDialog";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useCategoryMutations } from "@/hooks/useCategoryMutations";
import type { Category } from "@/types/category";

function CategoryRow({
  category,
  onRename,
  onDelete,
  isDeleting,
}: {
  category: Category;
  onRename: (c: Category) => void;
  onDelete: (c: Category) => void;
  isDeleting: boolean;
}) {
  return (
    <tr className="border-b border-charcoal/[.05] hover:bg-archive/40 transition-colors">
      <td className="px-5 py-3.5">
        <p
          className="font-barlow font-medium text-charcoal"
          style={{ fontSize: "0.85rem" }}
        >
          {category.name}
        </p>
      </td>

      <td className="px-5 py-3.5 hidden sm:table-cell">
        <p
          className="font-barlow font-light"
          style={{ fontSize: "0.78rem", color: "var(--warmgray)" }}
        >
          {new Date(category.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </td>

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRename(category)}
            disabled={isDeleting}
            title={`Rename ${category.name}`}
            aria-label={`Rename ${category.name}`}
            className="cursor-pointer w-8 h-8 flex items-center justify-center border
                       border-charcoal/15 text-charcoal transition-colors hover:border-gold
                       hover:text-gold focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-gold
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onDelete(category)}
            disabled={isDeleting}
            title={`Delete ${category.name}`}
            aria-label={`Delete ${category.name}`}
            className="group cursor-pointer w-8 h-8 flex items-center justify-center border
                       border-charcoal/15 text-warmgray transition-colors hover:border-red-400
                       hover:text-red-500 focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-red-400
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className="w-3.5 h-3.5 text-warmgray group-hover:text-red-500 transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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
  { label: "Name",    className: "" },
  { label: "Created", className: "hidden sm:table-cell" },
  { label: "Actions", className: "" },
];

export default function AdminCategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useAdminCategories();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [renameCategory, setRenameCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  const {
    isSaving,
    isDeleting,
    handleCreate,
    handleRename,
    handleDelete,
    handleMutationSuccess,
  } = useCategoryMutations(() => {
    setShowCreateModal(false);
    setRenameCategory(null);
    setDeleteCategory(null);
  });

  return (
    <AdminShell>
      <div className="p-6 md:p-10">

        {/* ── Page header ───────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1
              className="font-bebas tracking-wider text-charcoal leading-none"
              style={{ fontSize: "2rem" }}
            >
              Categories
            </h1>
            <p
              className="font-barlow font-light text-warmgray mt-1"
              style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}
            >
              {isLoading
                ? "Loading…"
                : categories
                ? `${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            disabled={isDeleting}
            className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded font-barlow
                       font-medium uppercase tracking-widest bg-charcoal text-cream
                       hover:bg-gold hover:text-charcoal transition-colors
                       focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-gold
                       flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: "0.72rem", border: "none" }}
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Category
          </button>
        </div>

        {/* ── States ────────────────────────────────────────── */}
        {isLoading && <LoadingState message="Loading categories…" />}

        {isError && (
          <ErrorState
            message="Could not load categories. Please try again."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && categories && categories.length === 0 && (
          <EmptyState
            title="No Categories Yet"
            description="Add your first category to start organising your products."
          />
        )}

        {/* ── Table ─────────────────────────────────────────── */}
        {!isLoading && !isError && categories && categories.length > 0 && (
          <div className="bg-white border border-charcoal/[.06] overflow-x-auto rounded-lg">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr
                  className="border-b border-charcoal/[.05]"
                  style={{ background: "var(--archive)" }}
                >
                  {TABLE_HEADERS.map(({ label, className }) => (
                    <th
                      key={label}
                      className={`px-5 py-3 text-left font-barlow font-medium uppercase ${className}`}
                      style={{
                        fontSize: "0.6rem",
                        letterSpacing: "0.2em",
                        color: "var(--warmgray)",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onRename={setRenameCategory}
                    onDelete={setDeleteCategory}
                    isDeleting={isDeleting}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
      {showCreateModal && (
        <CategoryFormModal
          mode="create"
          onSubmit={handleCreate}
          onClose={() => { if (!isSaving) setShowCreateModal(false); }}
          isSaving={isSaving}
        />
      )}

      {renameCategory && (
        <CategoryFormModal
          mode="rename"
          category={renameCategory}
          onSubmit={(name) => handleRename(renameCategory, name)}
          onClose={() => { if (!isSaving) setRenameCategory(null); }}
          isSaving={isSaving}
        />
      )}

      {deleteCategory && (
        <CategoryDeleteConfirmDialog
          category={deleteCategory}
          onConfirm={() => handleDelete(deleteCategory)}
          onClose={() => { if (!isDeleting) setDeleteCategory(null); }}
          isDeleting={isDeleting}
        />
      )}
    </AdminShell>
  );
}
