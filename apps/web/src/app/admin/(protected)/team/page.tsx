"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { useAdminList } from "@/hooks/useAdminList";
import { useSuperAdminMutations } from "@/hooks/useSuperAdminMutations";
import { AdminRole } from "@/types/admin";
import type { AdminRecord } from "@/lib/api/superAdmin";
import type { GeneratedInvite } from "@/lib/api/superAdmin";

// ── Helpers ───────────────────────────────────────────────────────────────────

function roleLabel(role: AdminRole) {
  return role === AdminRole.SUPER_ADMIN ? "Super Admin" : "Admin";
}

// ── Invite panel ─────────────────────────────────────────────────────────────

function InvitePanel() {
  const { isGeneratingInvite, handleGenerateInvite } = useSuperAdminMutations();
  const [invite, setInvite] = useState<GeneratedInvite | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    const result = await handleGenerateInvite();
    if (result) {
      setInvite(result);
      setCopied(false);
    }
  }

  async function handleCopy() {
    if (!invite) return;
    await navigator.clipboard.writeText(invite.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const expiryDisplay = invite
    ? new Date(invite.expiresAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Lagos",
      })
    : null;

  return (
    <div
      className="bg-white border border-charcoal/[.06] rounded-lg p-6"
      style={{ boxShadow: "0 2px 12px rgba(28,26,20,0.04)" }}
    >
      <h2
        className="font-bebas tracking-wider text-charcoal mb-1"
        style={{ fontSize: "1.2rem" }}
      >
        Generate Invite
      </h2>
      <p
        className="font-barlow font-light text-warmgray mb-5"
        style={{ fontSize: "0.78rem" }}
      >
        Creates a single-use invite token valid for 24 hours. Share it with
        the intended admin so they can complete their registration.
      </p>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGeneratingInvite}
        className="px-6 py-2.5 rounded font-barlow font-medium uppercase
                   tracking-widest transition-colors focus-visible:outline
                   focus-visible:outline-2 focus-visible:outline-offset-2
                   focus-visible:outline-gold disabled:opacity-50
                   disabled:cursor-not-allowed cursor-pointer"
        style={{
          fontSize: "0.72rem",
          background: "var(--gold)",
          color: "var(--charcoal)",
          border: "none",
        }}
        onMouseOver={(e) => {
          if (!isGeneratingInvite) {
            e.currentTarget.style.background = "var(--charcoal)";
            e.currentTarget.style.color = "var(--cream)";
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "var(--gold)";
          e.currentTarget.style.color = "var(--charcoal)";
        }}
      >
        {isGeneratingInvite ? "Generating…" : "Generate Invite Token"}
      </button>

      {invite && (
        <div
          className="mt-5 p-4 border border-charcoal/[.08] rounded"
          style={{ background: "var(--archive)" }}
        >
          <p
            className="font-barlow uppercase text-warmgray mb-2"
            style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
          >
            Invite Token
          </p>
          <div className="flex items-center gap-3">
            <code
              className="flex-1 font-barlow text-charcoal break-all select-all"
              style={{ fontSize: "0.82rem" }}
            >
              {invite.token}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy token"
              className="shrink-0 px-3 py-1.5 rounded font-barlow font-medium uppercase
                         transition-colors cursor-pointer"
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.12em",
                background: copied ? "rgba(22,163,74,0.10)" : "rgba(28,26,20,0.06)",
                border: copied
                  ? "1px solid rgba(22,163,74,0.30)"
                  : "1px solid rgba(28,26,20,0.12)",
                color: copied ? "#15803d" : "var(--warmgray)",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p
            className="font-barlow font-light text-warmgray mt-2"
            style={{ fontSize: "0.7rem" }}
          >
            Expires: <span className="text-charcoal">{expiryDisplay}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ── Admin row ─────────────────────────────────────────────────────────────────

function AdminRow({
  admin,
  currentAdminId,
  isUpdating,
  onFreeze,
  onUnfreeze,
}: {
  admin: AdminRecord;
  currentAdminId: number;
  isUpdating: boolean;
  onFreeze: (id: number, name: string) => void;
  onUnfreeze: (id: number, name: string) => void;
}) {
  const isSelf = admin.id === currentAdminId;
  const isSuperAdmin = admin.role === AdminRole.SUPER_ADMIN;

  return (
    <tr
      className="border-b border-charcoal/[.04] last:border-0"
      style={{ opacity: admin.isActive ? 1 : 0.6 }}
    >
      <td className="px-5 py-3.5">
        <p
          className="font-barlow font-medium text-charcoal"
          style={{ fontSize: "0.85rem" }}
        >
          {admin.name}
          {isSelf && (
            <span
              className="ml-2 font-light text-warmgray"
              style={{ fontSize: "0.72rem" }}
            >
              (you)
            </span>
          )}
        </p>
        <p
          className="font-barlow font-light text-warmgray"
          style={{ fontSize: "0.75rem" }}
        >
          {admin.email}
        </p>
      </td>

      <td className="px-5 py-3.5">
        <span
          className="inline-block font-barlow font-medium"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.06em",
            padding: "2px 8px",
            borderRadius: "3px",
            background:
              isSuperAdmin
                ? "rgba(200,160,48,0.10)"
                : "rgba(28,26,20,0.06)",
            border:
              isSuperAdmin
                ? "1px solid rgba(200,160,48,0.30)"
                : "1px solid rgba(28,26,20,0.10)",
            color: isSuperAdmin ? "#7a5e10" : "var(--warmgray)",
          }}
        >
          {roleLabel(admin.role as AdminRole)}
        </span>
      </td>

      <td className="px-5 py-3.5">
        {admin.isActive ? (
          <span
            className="inline-block font-barlow font-medium"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.06em",
              padding: "2px 8px",
              borderRadius: "3px",
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.25)",
              color: "#15803d",
            }}
          >
            Active
          </span>
        ) : (
          <span
            className="inline-block font-barlow font-medium"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.06em",
              padding: "2px 8px",
              borderRadius: "3px",
              background: "rgba(176,92,58,0.08)",
              border: "1px solid rgba(176,92,58,0.25)",
              color: "#b05c3a",
            }}
          >
            Frozen
          </span>
        )}
      </td>

      <td className="px-5 py-3.5">
        {/* Super Admins and self cannot be frozen */}
        {isSelf || isSuperAdmin ? (
          <span
            className="font-barlow font-light text-warmgray"
            style={{ fontSize: "0.75rem" }}
          >
            —
          </span>
        ) : admin.isActive ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onFreeze(admin.id, admin.name)}
            className="px-3 py-1 rounded font-barlow font-medium uppercase
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       cursor-pointer"
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              background: "rgba(176,92,58,0.08)",
              border: "1px solid rgba(176,92,58,0.25)",
              color: "#b05c3a",
            }}
          >
            {isUpdating ? "…" : "Freeze"}
          </button>
        ) : (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUnfreeze(admin.id, admin.name)}
            className="px-3 py-1 rounded font-barlow font-medium uppercase
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       cursor-pointer"
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.25)",
              color: "#15803d",
            }}
          >
            {isUpdating ? "…" : "Unfreeze"}
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Admin list panel ──────────────────────────────────────────────────────────

function AdminListPanel({ currentAdminId }: { currentAdminId: number }) {
  const { data: admins, isLoading, isError, error, refetch } = useAdminList();
  const { updatingAdmin, handleFreezeAdmin, handleUnfreezeAdmin } =
    useSuperAdminMutations();

  if (isLoading) return <LoadingState message="Loading admins…" />;
  if (isError) {
    const message =
      error instanceof Error
        ? error.message || "Could not load admin accounts."
        : "Could not load admin accounts.";
    return <ErrorState message={message} onRetry={() => refetch()} />;
  }

  return (
    <div
      className="bg-white border border-charcoal/[.06] rounded-lg overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(28,26,20,0.04)" }}
    >
      <div
        className="px-6 py-4 border-b border-charcoal/[.05]"
        style={{ background: "var(--archive)" }}
      >
        <h2
          className="font-bebas tracking-wider text-charcoal"
          style={{ fontSize: "1.2rem" }}
        >
          Admin Accounts
          <span
            className="ml-2 font-barlow font-light text-warmgray"
            style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
          >
            ({admins?.length ?? 0})
          </span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-charcoal/[.05]">
              {["Name / Email", "Role", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left font-barlow font-medium uppercase"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    color: "var(--warmgray)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins?.map((admin) => (
              <AdminRow
                key={admin.id}
                admin={admin}
                currentAdminId={currentAdminId}
                isUpdating={!!updatingAdmin[admin.id]}
                onFreeze={handleFreezeAdmin}
                onUnfreeze={handleUnfreezeAdmin}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminTeamPage() {
  const { admin } = useAdminAuthStore();
  const isSuperAdmin = admin?.role === AdminRole.SUPER_ADMIN;

  // Regular admins should not reach this page via direct URL — show nothing
  // sensitive. The nav link is hidden from them, but we guard here too.
  if (!isSuperAdmin) {
    return (
      <AdminShell>
        <div className="p-6 md:p-10">
          <div className="bg-white border border-charcoal/[.06] p-8 max-w-md">
            <h2
              className="font-bebas tracking-wider text-charcoal mb-3"
              style={{ fontSize: "1.4rem" }}
            >
              Access Restricted
            </h2>
            <p
              className="font-barlow font-light text-warmgray"
              style={{ fontSize: "0.875rem" }}
            >
              Super Admin privileges are required to access team management.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1
            className="font-bebas tracking-wider text-charcoal leading-none"
            style={{ fontSize: "2rem" }}
          >
            Team
          </h1>
          <p
            className="font-barlow font-light text-warmgray mt-1"
            style={{ fontSize: "0.8rem", letterSpacing: "0.08em" }}
          >
            Manage admin accounts and generate invitations.
          </p>
        </div>

        <div className="space-y-6">
          <InvitePanel />
          <AdminListPanel currentAdminId={admin!.id} />
        </div>
      </div>
    </AdminShell>
  );
}
