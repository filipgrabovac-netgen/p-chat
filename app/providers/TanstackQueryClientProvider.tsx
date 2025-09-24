"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const TanstackQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Create QueryClient only on the client side

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
