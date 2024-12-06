'use client'

import {QueryClientProvider} from "@tanstack/react-query"
import {WagmiProvider} from "wagmi"
import {queryClient, wagmiConfig} from "@/app/blockchain/config"
import {GoogleOAuthProvider} from "@react-oauth/google";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="519228911939-cri01h55lsjbsia1k7ll6qpalrus75ps.apps.googleusercontent.com">
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </GoogleOAuthProvider>
  )
}