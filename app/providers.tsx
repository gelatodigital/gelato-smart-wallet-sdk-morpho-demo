"use client";

import { Toaster } from "sonner";
import { ActivityLogProvider } from "@/contexts/ActivityLogContext";
import RouteGuard from "@/components/RouteGuard";
import {
  GelatoSmartWalletContextProvider,
  dynamic,
  wagmi,
} from "@gelatonetwork/smartwallet-react-sdk";
import { baseSepolia, sepolia } from "viem/chains";
import { http } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GelatoSmartWalletContextProvider
      settings={{
        scw: {
          type: "gelato",
        },
        apiKey: process.env.NEXT_PUBLIC_GELATO_API_KEY as string,
        waas: dynamic(
          process.env.NEXT_PUBLIC_MORPHO_DYNAMIC_ENVIRONMENT_ID as string
        ),
        wagmi: wagmi({
          chains: [baseSepolia],
          transports: {
            [baseSepolia.id]: http(),
          },
        }),
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
    </GelatoSmartWalletContextProvider>
  );
}
