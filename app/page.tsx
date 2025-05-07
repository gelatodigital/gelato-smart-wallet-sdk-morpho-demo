"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  useGelatoSmartWalletProviderContext,
  GelatoSmartWalletConnectButton,
} from "@gelatonetwork/smartwallet-react-sdk";

export default function Home() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  // 7702 configuration
  const {
    gelato: { client },
    logout,
  } = useGelatoSmartWalletProviderContext();

  useEffect(() => {
    async function createAccount() {
      if (client) {
        try {
          setIsInitializing(true);
          router.push("/borrow/step1");
        } catch (error) {
          console.error("Failed to create smart wallet client:", error);
          toast.error("Failed to initialize wallet");
        } finally {
          setIsInitializing(false);
        }
      }
    }
    createAccount();
  }, [client]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-3xl space-y-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            Borrow USDC with Bitcoin as collateral
          </h1>
          <p className="text-xl text-gray-600">
            Get instant liquidity without selling your Bitcoin. Low rates,
            transparent terms.
          </p>
          <div className="pt-4">
            {isInitializing ? (
              <Button
                disabled
                className="h-12 px-8 text-lg bg-black hover:bg-gray-800 text-white"
              >
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </Button>
            ) : (
              <GelatoSmartWalletConnectButton>
                <div className="flex items-center justify-center h-12 px-8 text-lg rounded-md bg-black hover:bg-gray-800 text-white">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </GelatoSmartWalletConnectButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
