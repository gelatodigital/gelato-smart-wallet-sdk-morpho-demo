"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { primaryWallet, user } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isPublicPath = pathname === "/";
    const isAuthenticated = user && primaryWallet;

    if (!isPublicPath && !isAuthenticated) {
      router.push("/");
    } else {
      setIsLoading(false);
    }
  }, [pathname, user, primaryWallet, router]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
