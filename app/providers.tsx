"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import { Toaster } from "sonner";
import { ActivityLogProvider } from "@/contexts/ActivityLogContext";
import RouteGuard from "@/components/RouteGuard";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env
          .NEXT_PUBLIC_MORPHO_DYNAMIC_ENVIRONMENT_ID as string,
        walletConnectors: [
          EthereumWalletConnectors,
          ZeroDevSmartWalletConnectors,
        ],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ActivityLogProvider>
          <RouteGuard>
            {children}
            <Toaster />
          </RouteGuard>
        </ActivityLogProvider>
      </QueryClientProvider>
    </DynamicContextProvider>
  );
}
