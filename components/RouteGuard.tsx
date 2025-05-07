"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGelatoSmartWalletProviderContext } from "@gelatonetwork/smartwallet-react-sdk";
export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    gelato: { client },
  } = useGelatoSmartWalletProviderContext();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isPublicPath = pathname === "/";
    const isAuthenticated = client;

    if (!isPublicPath && !isAuthenticated) {
      router.push("/");
    } else {
      setIsLoading(false);
    }
  }, [pathname, client, router]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
