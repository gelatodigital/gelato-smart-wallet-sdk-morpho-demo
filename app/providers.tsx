'use client'

import {QueryClientProvider} from "@tanstack/react-query"
import {WagmiProvider} from "wagmi"
import {queryClient, wagmiConfig} from "@/app/blockchain/config"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}