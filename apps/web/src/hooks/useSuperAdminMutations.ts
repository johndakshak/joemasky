"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdminClient } from "@/hooks/useAdminClient";
import {
  generateInvite,
  freezeAdmin,
  unfreezeAdmin,
} from "@/lib/api/superAdmin";
import { ApiError } from "@/lib/api/client";
import type { GeneratedInvite } from "@/lib/api/superAdmin";

export function useSuperAdminMutations() {
  const client = useAdminClient();
  const queryClient = useQueryClient();

  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [updatingAdmin, setUpdatingAdmin] = useState<Record<number, boolean>>({});

  async function handleGenerateInvite(): Promise<GeneratedInvite | null> {
    if (!client || isGeneratingInvite) return null;
    setIsGeneratingInvite(true);
    try {
      const invite = await generateInvite(client);
      toast.success("Invite generated.");
      return invite;
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message || "Failed to generate invite."
          : "Unable to connect. Check your internet connection."
      );
      return null;
    } finally {
      setIsGeneratingInvite(false);
    }
  }

  async function handleFreezeAdmin(id: number, name: string) {
    if (!client || updatingAdmin[id]) return;
    setUpdatingAdmin((prev) => ({ ...prev, [id]: true }));
    try {
      await freezeAdmin(client, id);
      await queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
      toast.success(`${name}'s account has been frozen.`);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message || "Failed to freeze account."
          : "Unable to connect. Check your internet connection."
      );
    } finally {
      setUpdatingAdmin((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function handleUnfreezeAdmin(id: number, name: string) {
    if (!client || updatingAdmin[id]) return;
    setUpdatingAdmin((prev) => ({ ...prev, [id]: true }));
    try {
      await unfreezeAdmin(client, id);
      await queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
      toast.success(`${name}'s account has been reactivated.`);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message || "Failed to unfreeze account."
          : "Unable to connect. Check your internet connection."
      );
    } finally {
      setUpdatingAdmin((prev) => ({ ...prev, [id]: false }));
    }
  }

  return {
    isGeneratingInvite,
    updatingAdmin,
    handleGenerateInvite,
    handleFreezeAdmin,
    handleUnfreezeAdmin,
  };
}
