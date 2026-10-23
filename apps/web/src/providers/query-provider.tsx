"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 60 seconds — prevents an immediate
            // background refetch on every mount/navigation and stops the
            // stale→refetch cycle that can make products flash on screen.
            staleTime: 60 * 1000,
            // Keep unused query data in cache for 5 minutes.
            gcTime: 5 * 60 * 1000,
            // Retry once on failure (default 3 is excessive for a storefront,
            // and each retry hits the cold Render instance again).
            retry: 1,
            // Do not refetch when the browser tab regains focus.  On a slow
            // backend (Render cold starts) this would trigger an unnecessary
            // request every time the user switches tabs, causing the product
            // list to flash or disappear while the refetch is in-flight.
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}