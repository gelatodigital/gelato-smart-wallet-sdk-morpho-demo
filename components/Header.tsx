"use client";

import type React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

interface HeaderProps {
  showBackButton?: boolean;
}

function HeaderInner({ showBackButton = false }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isHomeRoute = pathname === "/";
  const isDashboardRoute = pathname === "/dashboard";
  const isEarnRoute = pathname === "/earn";

  // Determine current step from pathname
  let currentStep = 0;
  if (pathname.includes("/borrow/step1")) currentStep = 1;
  else if (pathname.includes("/borrow/step2")) currentStep = 2;

  const handleBack = () => {
    if (currentStep === 1) {
      router.push("/dashboard");
    } else if (currentStep === 2) {
      router.push("/borrow/step1");
    } else if (isEarnRoute) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="border-b p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center">
            <div className="flex items-center mr-1">
              <Image
                src="/gelato.png"
                alt="Gelato"
                width={23}
                height={23}
                className="mr-1.5"
              />
              <span className="font-semibold text-xl">Gelato</span>
            </div>
            <span className="text-gray-300 mx-2">|</span>
            <div className="flex items-center">
              <Image
                src="/morpho-logo.png"
                alt="Morpho"
                width={30}
                height={30}
                className="mr-1"
              />
              <span className="font-semibold text-lg">Morpho</span>
            </div>
          </div>
        </div>
        {!isHomeRoute && !isDashboardRoute && !isEarnRoute && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full ${
                  currentStep >= 1
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-500"
                } flex items-center justify-center font-bold`}
              >
                1
              </div>
              <div
                className={`h-1 w-12 ${
                  currentStep >= 2 ? "bg-black" : "bg-gray-300"
                } mx-2`}
              ></div>
              <div
                className={`h-8 w-8 rounded-full ${
                  currentStep >= 2
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-500"
                } flex items-center justify-center font-bold`}
              >
                2
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default function Header(props: HeaderProps) {
  return (
    <Suspense>
      <HeaderInner {...props} />
    </Suspense>
  );
}
