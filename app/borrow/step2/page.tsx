"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bitcoin, CircleDollarSign } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Contract } from "ethers";
import { marketParams, oracleABI } from "@/app/blockchain/config";
import { JsonRpcProvider } from "ethers";
import { Address } from "viem";
import { useTokenHoldings } from "@/lib/useFetchBalances";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";

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

export default function Step2() {
  const router = useRouter();
  const [usdcAmount, setUsdcAmount] = useState("0");
  const [requiredBtc, setRequiredBtc] = useState("0");
  const [isCalculating, setIsCalculating] = useState(false);
  const { primaryWallet } = useDynamicContext();
  const accountAddress = primaryWallet?.address;
  const { data: tokenHoldings, refetch: refetchTokenHoldings } =
    useTokenHoldings(accountAddress as Address);

  const handleUsdcChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, "");

    // Remove leading zeros
    if (value.startsWith("0") && value.length > 1 && !value.startsWith("0.")) {
      value = value.replace(/^0+/, "");
    }

    // Handle empty input
    if (!value) {
      value = "0";
    }

    // Prevent multiple decimal points
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }

    // Limit decimal places to 2
    if (value.includes(".")) {
      const [whole, decimal] = value.split(".");
      if (decimal?.length > 2) {
        value = `${whole}.${decimal.slice(0, 2)}`;
      }
    }
    setUsdcAmount(value);

    // Only calculate if value is not 0
    if (value !== "0") {
      setIsCalculating(true);
      const requiredBtc = await calculateRequiredSupply(value);
      setRequiredBtc(requiredBtc || "0");
      setIsCalculating(false);
    } else {
      setRequiredBtc("0");
    }
  };

  // Format display value
  const displayValue = usdcAmount === "0" ? "0" : usdcAmount.replace(/^0+/, "");

  const calculateRequiredSupply = async (usdcAmount: string) => {
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

      // Calculate required BTC amount based on borrow amount and price
      const requiredBTCAmount = (Number(usdcAmount) / Number(price)) * 1e8; // Convert price from 8 decimals
      return requiredBTCAmount.toFixed(8);
    } catch (error) {
      console.error("Error calculating required supply:", error);
    }
  };

  const handleBorrow = () => {
    router.push(`/borrow/step3?amount=${usdcAmount}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header showBackButton />

      <main className="flex-1 container mx-auto px-4 py-8 mt-8">
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
                    Required collateral:
                  </span>
                  <div className="flex items-center">
                    <span className="text-[18px] font-normal">
                      {requiredBtc}
                    </span>
                    <Image
                      src="/bitcoin.svg"
                      alt="cbBTC"
                      width={24}
                      height={24}
                      className="ml-2"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] text-gray-600">
                    Loan-to-Value (LTV):
                  </span>
                  <span className="text-[18px] font-normal">86%</span>
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
                      <span className="text-[18px]">3.75%</span>
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
            disabled={usdcAmount === "0"}
            className="w-full bg-black hover:bg-gray-800 h-14 text-white text-[18px] rounded-2xl"
          >
            Borrow
          </Button>
        </div>
      </main>
    </div>
  );
}
