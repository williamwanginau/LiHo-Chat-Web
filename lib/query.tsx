"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            retry(failureCount, error: unknown) {
              const e = (error as { code?: string; status?: number }) || {};
              const code = e.code || "";
              const status = e.status ?? 0;
              if (status >= 400 && status < 500) return false;
              if (failureCount >= 2) return false;
              return true;
            },
          },
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
