"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { TurnkeyProvider } from "@turnkey/sdk-react";

const turnkeyConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
  rpId: process.env.NEXT_PUBLIC_RPID!,
  serverSignUrl: process.env.NEXT_PUBLIC_SERVER_SIGN_URL!,
  iframeUrl: process.env.NEXT_PUBLIC_IFRAME_URL ?? "https://auth.turnkey.com",
};

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TurnkeyProvider config={turnkeyConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TurnkeyProvider>
  );
}
