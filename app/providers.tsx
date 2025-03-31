"use client";

import {
  DynamicContextProvider,
  mergeNetworks,
} from "@dynamic-labs/sdk-react-core";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "Your Dynamic Environment ID",
        walletConnectors: [EthereumWalletConnectors],
        events: {
          onAuthFlowOpen: () => console.log("Auth flow opened"),
          onAuthSuccess: () => console.log("Auth success"),
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </DynamicContextProvider>
  );
}
