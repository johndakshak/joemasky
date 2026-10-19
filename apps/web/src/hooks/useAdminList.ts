"use client";

import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "@/hooks/useAdminClient";
import { listAdmins } from "@/lib/api/superAdmin";

export function useAdminList() {
  const client = useAdminClient();

  return useQuery({
    queryKey: ["admin", "admins"],
    queryFn: () => listAdmins(client!),
    enabled: !!client,
    // One automatic retry is enough. More retries delay the error state
    // and mask transient API errors (e.g. Render cold-start 503s).
    retry: 1,
  });
}
