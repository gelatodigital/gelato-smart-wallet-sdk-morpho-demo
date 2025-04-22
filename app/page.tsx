"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  createKernelAccountClient,
  getUserOperationGasPrice,
} from "@zerodev/sdk";
import { http } from "wagmi";
import { JsonRpcProvider } from "ethers";
import { chainConfig } from "./blockchain/config";
import { toast } from "sonner";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

let CHAIN = chainConfig;
const GELATO_API_KEY = process.env.NEXT_PUBLIC_GELATO_API_KEY!;
const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

// Create a memoized deployment check function
const checkIsDeployed = async (address: string) => {
  try {
    const code = await provider.getCode(address);
    return code !== "0x";
  } catch (error) {
    console.error("Error checking deployment status:", error);
    return false;
  }
};

export default function Home() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  // 7702 configuration
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const connector: any = primaryWallet?.connector;
  const params = {
    withSponsorship: true,
  };
  let client: any;
  if (isZeroDevConnector(connector)) {
    client = connector?.getAccountAbstractionProvider(params);
  }

  const createSponsoredKernelClient = async () => {
    const kernelClient = createKernelAccountClient({
      account: client.account,
      chain: CHAIN,
      bundlerTransport: http(
        `https://api.gelato.digital/bundlers/${CHAIN.id}/rpc?sponsorApiKey=${GELATO_API_KEY}`
      ),
      userOperation: {
        estimateFeesPerGas: async ({ bundlerClient }) => {
          return getUserOperationGasPrice(bundlerClient);
        },
      },
    });

    checkIsDeployed(kernelClient.account.address);
    return kernelClient;
  };

  useEffect(() => {
    async function createAccount() {
      if (client) {
        try {
          const kernelClient = await createSponsoredKernelClient();
          router.push("/borrow/step1");
        } catch (error) {
          console.error("Failed to create kernel client:", error);
          toast.error("Failed to initialize wallet");
        } finally {
          setIsInitializing(false);
        }
      }
    }
    createAccount();
  }, [client]);

  useEffect(() => {
    if (primaryWallet) {
      setIsInitializing(true);
    }
  }, [primaryWallet]);

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
              <DynamicConnectButton buttonClassName="h-12 px-8 text-lg rounded-md bg-black hover:bg-gray-800 text-white">
                <div className="flex items-center justify-center">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </DynamicConnectButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
