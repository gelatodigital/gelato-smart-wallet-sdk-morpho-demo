"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bitcoin, CircleDollarSign, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import TransactionModal from "@/components/TransactionModal";
import { Contract, JsonRpcProvider } from "ethers";
import {
  chainConfig,
  marketParams,
  morphoABI,
  morphoAddress,
  oracleABI,
  tokenABI,
} from "@/app/blockchain/config";
import { Address, encodeFunctionData, http } from "viem";
import { toast } from "sonner";
import { useGelatoSmartWalletProviderContext } from "@gelatonetwork/smartwallet-react-sdk";
import { useTokenHoldings } from "@/lib/useFetchBalances";
import Image from "next/image";
import { useActivityLog } from "@/contexts/ActivityLogContext";
import { sponsored } from "@gelatonetwork/smartwallet";

const GELATO_API_KEY = process.env.NEXT_PUBLIC_MORPHO_GELATO_API_KEY!;

function Step3Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usdcAmount, setUsdcAmount] = useState("0");
  const [requiredBtc, setRequiredBtc] = useState("0");
  const [btcPrice, setBtcPrice] = useState("0");
  const [txStatus, setTxStatus] = useState<"loading" | "success" | null>(null);
  const {
    gelato: { client },
  } = useGelatoSmartWalletProviderContext();
  const accountAddress = client?.account.address;
  const { data: tokenHoldings, refetch: refetchTokenHoldings } =
    useTokenHoldings(accountAddress as Address);
  const { addLog } = useActivityLog();

  useEffect(() => {
    const amount = searchParams.get("amount");
    const calculateSupply = async () => {
      if (amount) {
        setUsdcAmount(amount);
        const requiredBtc = await calculateRequiredSupply(amount);
        setRequiredBtc(requiredBtc?.toFixed(8) || "0");
      } else {
        router.push("/borrow/step2");
      }
    };
    calculateSupply();
  }, []);

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
      setBtcPrice(formattedPrice);
      // Calculate required BTC amount based on borrow amount and price
      const requiredBTCAmount = (Number(usdcAmount) / Number(price)) * 1e8; // Convert price from 8 decimals
      return requiredBTCAmount;
    } catch (error) {
      console.error("Error calculating required supply:", error);
    }
  };

  const supplyAndBorrow = async () => {
    try {
      setIsModalOpen(true);
      setTxStatus("loading");
      // Convert input amounts to proper decimal format
      // 8 decimals for cbBTC
      const borrowAmountInDecimals = BigInt(
        Math.floor(parseFloat(usdcAmount) * 1000000)
      ); // 6 decimals for USDC

      const requiredBTCAmount = await calculateRequiredSupply(usdcAmount); // Convert price from 8 decimals

      const supplyAmountInDecimals = BigInt(
        Math.floor(parseFloat(requiredBTCAmount?.toString() || "0") * 100000000)
      );

      if (
        Number(tokenHoldings?.cbBTCBalance as string) <
        Number(requiredBTCAmount)
      ) {
        toast.error("Insufficient collateral balance, Mint Now !!");
        setIsModalOpen(false);
        setTxStatus(null);
        return;
      }

      const supplyData = encodeFunctionData({
        abi: morphoABI,
        functionName: "supplyCollateral",
        args: [
          marketParams,
          supplyAmountInDecimals,
          client?.account.address,
          "0x",
        ],
      });

      const borrowData = encodeFunctionData({
        abi: morphoABI,
        functionName: "borrow",
        args: [
          marketParams,
          borrowAmountInDecimals,
          BigInt(0),
          client?.account.address,
          client?.account.address,
        ],
      });

      const calls = [
        // Add approval call for collateral token
        {
          to: marketParams.collateralToken as `0x${string}`,
          data: encodeFunctionData({
            abi: tokenABI,
            functionName: "approve",
            args: [morphoAddress, supplyAmountInDecimals],
          }),
        },
        {
          to: morphoAddress as `0x${string}`,
          data: supplyData,
        },
        {
          to: morphoAddress as `0x${string}`,
          data: borrowData,
        },
      ];

      const smartWalletResponse = await client?.execute({
        payment: sponsored(GELATO_API_KEY),
        calls,
      });

      const userOpHash = smartWalletResponse?.id;

      console.log(userOpHash);

      const txHash = await smartWalletResponse?.wait();

      if (!txHash) {
        toast.error("Transaction failed");
        setIsModalOpen(false);
        setTxStatus(null);
        return;
      }

      toast.success("Borrow Tokens successful!");
      setTxStatus("success");

      // Add log entry
      addLog({
        message: `Borrowed ${usdcAmount} USDC with ${requiredBtc} cbBTC as collateral`,
        timestamp: new Date().toISOString(),
        details: {
          userOpHash,
          txHash,
          isSponsored: true,
        },
      });

      // Refresh token holdings after successful transaction
      if (accountAddress) {
        refetchTokenHoldings();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(`Error in supply and borrow. Check the logs`);
      setIsModalOpen(false);
      setTxStatus(null);
    }
  };
  return (
    <div className="flex min-h-screen flex-col">
      <Header showBackButton />

      <main className="flex-1 container mx-auto p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <div className="rounded-lg border p-8 shadow-sm">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Image
                      src="/bitcoin.svg"
                      alt="cbBTC"
                      width={24}
                      height={24}
                    />
                  </div>
                  <ArrowRight className="h-6 w-6 mx-2 text-gray-400" />
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Image src="/usdc.svg" alt="USDC" width={24} height={24} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Borrow {usdcAmount} USDC</h2>
                <p className="text-gray-600">with cbBTC as collateral</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-1">
                    <span>Collateral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{requiredBtc}</span>
                    <Image
                      src="/bitcoin.svg"
                      alt="cbBTC"
                      width={16}
                      height={16}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-1">
                    <span>Loan-to-Value</span>
                  </div>
                  <span className="font-medium text-green-600">86%</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-1">
                    <span>Variable interest rate</span>
                  </div>
                  <span className="font-medium">3.75%</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-1">
                    <span>Liquidation price</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {" "}
                      {(Number(btcPrice) * 0.86).toFixed(2)}
                    </span>
                    <Image src="/usdc.svg" alt="USDC" width={16} height={16} />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-1">
                    <span>Receive time</span>
                  </div>
                  <span className="font-medium">~7 seconds</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-1">
                    <span>Transaction fee</span>
                  </div>
                  <span className="font-medium text-green-600 font-bold">
                    $0 (FREE)
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-semibold">
                      cbBTC deposit total
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xl font-bold">
                      {requiredBtc}
                    </span>
                    <Image
                      src="/bitcoin.svg"
                      alt="cbBTC"
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={supplyAndBorrow}
              className="w-full bg-black hover:bg-gray-800 h-14 text-white text-[18px] rounded-2xl"
            >
              Borrow now
            </Button>
          </div>
        </div>
      </main>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTxStatus(null);
          if (txStatus === "success") {
            router.push("/borrow/step1");
          }
        }}
        amount={usdcAmount}
        requiredBtc={requiredBtc}
        status={txStatus}
      />
    </div>
  );
}

export default function Step3() {
  return (
    <Suspense>
      <Step3Inner />
    </Suspense>
  );
}
