"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { consumeNextNavigationToast } from "@/shared/utils/next-navigation-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const message = consumeNextNavigationToast();
    if (message) toast.success(message);
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: 'always' },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
