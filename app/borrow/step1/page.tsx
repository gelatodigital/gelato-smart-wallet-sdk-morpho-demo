"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Contract } from "ethers";
import {
  chainConfig,
  marketId,
  marketParams,
  morphoAddress,
} from "@/app/blockchain/config";
import { oracleABI } from "@/app/blockchain/abi/oracleABI";
import { JsonRpcProvider } from "ethers";
import { Address, http, createPublicClient } from "viem";
import { useTokenHoldings } from "@/lib/useFetchBalances";
import { useGelatoSmartWalletProviderContext } from "@gelatonetwork/smartwallet-react-sdk";
import Image from "next/image";
import { morphoABI } from "@/app/blockchain/abi/morphoABI";
import { IRM_ABI } from "@/app/blockchain/abi/irmABI";

// Custom Input component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={`w-full bg-transparent text-[160px] font-normal text-center focus:outline-none ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Add this custom hook at the top level
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Step1() {
  const router = useRouter();
  const [usdcAmount, setUsdcAmount] = useState("0");
  const [cbBtcPrice, setCbBtcPrice] = useState("0");
  const [isFetching, setIsFetching] = useState(false);
  const [apr, setApr] = useState(0);
  const {
    gelato: { client },
  } = useGelatoSmartWalletProviderContext();
  const accountAddress = client?.account.address;

  const publicClient = createPublicClient({
    chain: chainConfig,
    transport: http(),
  });

  const { data: tokenHoldings, refetch: refetchTokenHoldings } =
    useTokenHoldings(accountAddress as Address);
  const [isProceeding, setIsProceeding] = useState(false);

  // Move calculation logic to useEffect
  useEffect(() => {
    const calculateRequiredSupply = async () => {
      setIsFetching(true);
      try {
        const provider = new JsonRpcProvider(
          process.env.NEXT_PUBLIC_MORPHO_RPC_URL
        );
        const oracleContract = new Contract(
          marketParams.oracle,
          oracleABI,
          provider
        );
        const price = await oracleContract.latestAnswer();

        // Format price with 2 decimal places
        const formattedPrice = (Number(price) / 1e8).toFixed(2);
        setCbBtcPrice(formattedPrice);
      } catch (error) {
        console.error("Error calculating required supply:", error);
        setCbBtcPrice("0");
      } finally {
        setIsFetching(false);
      }
    };
    calculateRequiredSupply();
  }, []);

  const handleUsdcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, "");

    if (value.startsWith("0") && value.length > 1 && !value.startsWith("0.")) {
      value = value.replace(/^0+/, "");
    }

    if (!value) {
      value = "0";
    }

    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }

    if (value.includes(".")) {
      const [whole, decimal] = value.split(".");
      if (decimal?.length > 2) {
        value = `${whole}.${decimal.slice(0, 2)}`;
      }
    }
    setUsdcAmount(value);
  };

  // Format display value
  const displayValue = usdcAmount === "0" ? "0" : usdcAmount.replace(/^0+/, "");

  const handleBorrow = async () => {
    setIsProceeding(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await router.push(
        `/borrow/step2?amount=${usdcAmount}&apr=${apr.toFixed(2)}`
      );
    } finally {
      setIsProceeding(false);
    }
  };
  useEffect(() => {
    calculateAPR();
  }, []);

  async function calculateAPR() {
    const marketDetails: any = await publicClient.readContract({
      address: morphoAddress,
      abi: morphoABI,
      functionName: "market",
      args: [marketId],
    });
    const Rate = await publicClient.readContract({
      address: marketParams.irm as Address,
      abi: IRM_ABI,
      functionName: "borrowRateView",
      args: [marketParams, marketDetails],
    });
    const borrowRate = Number(Rate) / 1e18;
    const secondsPerYear = 60 * 60 * 24 * 365;
    const apr = Math.exp(Number(borrowRate) * secondsPerYear) - 1;
    setApr(apr * 100);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showBackButton />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <div className="rounded-[24px] border bg-white p-8">
              <div className="mb-16">
                <div className="flex items-center justify-between">
                  <Input
                    className="text-[95px] text-black min-w-0 p-0"
                    value={displayValue}
                    onChange={handleUsdcChange}
                    type="text"
                    inputMode="decimal"
                    style={{
                      WebkitAppearance: "none",
                      MozAppearance: "textfield",
                    }}
                  />
                  <span className="text-[80px] text-gray-400 font-normal">
                    USDC
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-[18px] text-gray-600">
                    cbBtc Price:
                  </span>
                  <div className="flex items-center">
                    {isFetching ? (
                      <div className="flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span className="text-[18px] font-normal">
                          Fetching...
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-[18px] font-normal">
                          {cbBtcPrice}
                        </span>
                        <Image
                          src="/usdc.svg"
                          alt="USDC"
                          width={24}
                          height={24}
                          className="ml-2"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] text-gray-600">
                    Loan-to-Value (LTV):
                  </span>
                  <span className="text-[18px] font-normal">94.5%</span>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between border-t py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/usdc.svg"
                        alt="USDC"
                        width={24}
                        height={24}
                      />
                      <span className="text-[18px]">Borrow USDC</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[18px]">{apr.toFixed(2)}%</span>
                      <span className="text-[16px] text-gray-500">
                        Variable APR
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/bitcoin.svg"
                        alt="cbBTC"
                        width={24}
                        height={24}
                      />
                      <span className="text-[18px]">Collateralize cbBTC</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[18px]">
                        {tokenHoldings?.cbBTCBalance}
                      </span>
                      <span className="text-[16px] text-gray-500">
                        Available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleBorrow}
            disabled={usdcAmount === "0" || isProceeding}
            className="w-full bg-black hover:bg-gray-800 h-14 text-white text-[18px] rounded-2xl"
          >
            {isProceeding ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Proceeding...
              </>
            ) : (
              "Borrow"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
