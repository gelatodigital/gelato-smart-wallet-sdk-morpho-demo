'use client'

import {QueryClientProvider} from "@tanstack/react-query"
import {WagmiProvider} from "wagmi"
import {queryClient, wagmiConfig} from "@/app/blockchain/config"
import {GoogleOAuthProvider} from "@react-oauth/google";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="563235730494-08l7rq3qmansovo8h918ql7plli45ct3.apps.googleusercontent.com">
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </GoogleOAuthProvider>
  )
}