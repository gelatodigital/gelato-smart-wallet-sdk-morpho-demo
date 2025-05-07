"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  TrendingUp,
  Wallet,
  ArrowRight,
  Calculator,
  Vault,
  BarChart3,
  Clock,
  Loader2,
} from "lucide-react";
import TransactionModal from "@/components/TransactionModal";
import Header from "@/components/Header";
import Image from "next/image";
import { useTokenHoldings } from "@/lib/useFetchBalances";
import {
  Address,
  createPublicClient,
  encodeFunctionData,
  http,
  parseUnits,
} from "viem";
import { useGelatoSmartWalletProviderContext } from "@gelatonetwork/smartwallet-react-sdk";
import {
  chainConfig,
  deployerAddress,
  marketId,
  marketParams,
  morphoAddress,
  morphoVaultAddress,
  usdcAddress,
  vaultStatsAddress,
} from "../blockchain/config";
import { MORPHO_VAULT_ABI } from "../blockchain/abi/morphoVaultABI";
import { formatUnits } from "ethers";
import { morphoABI } from "../blockchain/abi/morphoABI";
import { VAULT_STATS_ABI } from "../blockchain/abi/vaultStatsABI";
import { sponsored } from "@gelatonetwork/smartwallet";
import { tokenABI } from "../blockchain/abi/ERC20ABI";
import { useActivityLog } from "@/contexts/ActivityLogContext";
import { toast } from "sonner";
import { IRM_ABI } from "../blockchain/abi/irmABI";
// Custom Input component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={`w-full bg-transparent text-base font-normal text-left focus:outline-none px-4 py-3 ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const GELATO_API_KEY = process.env.NEXT_PUBLIC_MORPHO_GELATO_API_KEY!;

export default function SupplyPage() {
  const router = useRouter();
  const [supplyAmount, setSupplyAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<"loading" | "success" | null>(null);
  const [supplyTrigger, setSupplyTrigger] = useState(0);
  const [apr, setApr] = useState(0);
  const [isLoadingMarketDetails, setIsLoadingMarketDetails] = useState(false);
  const [calculatedReturns, setCalculatedReturns] = useState({
    oneMonth: { interest: "0.00", total: "0.00" },
    threeMonths: { interest: "0.00", total: "0.00" },
    sixMonths: { interest: "0.00", total: "0.00" },
    oneYear: { interest: "0.00", total: "0.00" },
  });
  const [marketData, setMarketData] = useState({
    totalSupply: 0,
    totalBorrowed: 0,
    utilizationRate: 0,
    apr: 0,
  });
  const [vaultData, setVaultData] = useState({
    totalSupply: 0,
    supplyCap: 0,
  });
  const [totalAssets, setTotalAssets] = useState(0);
  const [userAssets, setUserAssets] = useState(0);
  const [userApy, setUserApy] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawTrigger, setWithdrawTrigger] = useState(0);
  const [transactionType, setTransactionType] = useState("supply");
  const [isMinting, setIsMinting] = useState(false);
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
  const { addLog } = useActivityLog();
  const handleSupply = () => {
    setIsModalOpen(true);
    supplyUSDC();
  };

  useEffect(() => {
    checkMarketDetails();
  }, [supplyTrigger, withdrawTrigger]);

  const checkMarketDetails = async () => {
    setIsLoadingMarketDetails(true);
    try {
      const marketConfig: any = await publicClient.readContract({
        address: morphoVaultAddress,
        abi: MORPHO_VAULT_ABI,
        functionName: "config",
        args: [marketId],
      });
      const totalAssets: any = await publicClient.readContract({
        address: morphoVaultAddress,
        abi: MORPHO_VAULT_ABI,
        functionName: "totalAssets",
        args: [],
      });
      const marketDetails: any = await publicClient.readContract({
        address: morphoAddress,
        abi: morphoABI,
        functionName: "market",
        args: [marketId],
      });
      const userShares: any = await publicClient.readContract({
        address: morphoVaultAddress,
        abi: MORPHO_VAULT_ABI,
        functionName: "balanceOf",
        args: [client?.account.address],
      });
      const userAssets: any = await publicClient.readContract({
        address: morphoVaultAddress,
        abi: MORPHO_VAULT_ABI,
        functionName: "convertToAssets",
        args: [userShares],
      });
      const calculateUserAPY: any = await publicClient.readContract({
        address: vaultStatsAddress,
        abi: VAULT_STATS_ABI,
        functionName: "calculateApyUser",
        args: [client?.account.address, userAssets],
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
      let userApyPeriod = Number(calculateUserAPY[0]) / 1e18;
      let userApy = userApyPeriod * 365 * 24 * 60 * 60;
      setUserApy(userApy * 100);
      setMarketData({
        totalSupply: Number(formatUnits(marketDetails[0], 6)),
        totalBorrowed: Number(formatUnits(marketDetails[2], 6)),
        utilizationRate:
          (Number(formatUnits(marketDetails[2], 6)) /
            Number(formatUnits(marketDetails[0], 6))) *
          100,
        apr: apr * 100,
      });
      setVaultData({
        totalSupply: Number(formatUnits(totalAssets, 6)),
        supplyCap: Number(formatUnits(marketConfig[0], 6)),
      });
      setTotalAssets(totalAssets);
      setUserAssets(userAssets);
    } catch (error) {
      console.error("Error fetching market details:", error);
    } finally {
      setIsLoadingMarketDetails(false);
    }
  };

  async function supplyUSDC() {
    setTxStatus("loading");
    const calls = [
      {
        to: usdcAddress as Address,
        data: encodeFunctionData({
          abi: tokenABI,
          functionName: "approve",
          args: [morphoVaultAddress, parseUnits(supplyAmount, 6)],
        }),
      },
      {
        to: morphoVaultAddress as Address,
        data: encodeFunctionData({
          abi: MORPHO_VAULT_ABI,
          functionName: "deposit",
          args: [parseUnits(supplyAmount, 6), client?.account.address],
        }),
      },
      {
        to: vaultStatsAddress as Address,
        data: encodeFunctionData({
          abi: VAULT_STATS_ABI,
          functionName: "deposit",
          args: [parseUnits(supplyAmount, 6), userAssets, totalAssets],
        }),
      },
    ];
    const results = await client?.execute({
      payment: sponsored(GELATO_API_KEY),
      calls,
    });
    const txHash = await results?.wait();
    setTransactionType("supply");
    setTxStatus("success");
    setSupplyTrigger((prev) => prev + 1);

    addLog({
      message: `Supplied ${supplyAmount} USDC`,
      timestamp: new Date().toISOString(),
      details: {
        userOpHash: results?.id,
        txHash,
        isSponsored: true,
      },
    });
    if (accountAddress) {
      refetchTokenHoldings();
    }
  }

  const handleWithdraw = () => {
    setIsModalOpen(true);
    withdrawUSDC();
  };

  async function withdrawUSDC() {
    setTxStatus("loading");
    const calls = [
      {
        to: morphoVaultAddress as Address,
        data: encodeFunctionData({
          abi: MORPHO_VAULT_ABI,
          functionName: "withdraw",
          args: [parseUnits(withdrawAmount, 6), accountAddress, accountAddress],
        }),
      },
      {
        to: vaultStatsAddress as Address,
        data: encodeFunctionData({
          abi: VAULT_STATS_ABI,
          functionName: "withdraw",
          args: [parseUnits(withdrawAmount, 6), userAssets, totalAssets],
        }),
      },
    ];
    const results = await client?.execute({
      payment: sponsored(GELATO_API_KEY),
      calls,
    });
    const txHash = await results?.wait();
    setTransactionType("withdraw");
    setTxStatus("success");
    setWithdrawTrigger((prev) => prev + 1);

    addLog({
      message: `Withdrew ${withdrawAmount} USDC`,
      timestamp: new Date().toISOString(),
      details: {
        userOpHash: results?.id,
        txHash,
        isSponsored: true,
      },
    });
    if (accountAddress) {
      refetchTokenHoldings();
    }
  }

  const handleMintLoanToken = async () => {
    try {
      setIsMinting(true);

      // Convert input amount to proper decimal format (6 decimals)
      const amountInDecimals = BigInt(Math.floor(parseFloat("100") * 1000000));

      const calls = [
        // Add approval call for loan token
        {
          to: usdcAddress as `0x${string}`,
          data: encodeFunctionData({
            abi: tokenABI,
            functionName: "mint",
            args: [client?.account.address, amountInDecimals],
          }),
        },
      ];

      const smartWalletResponse = await client?.execute({
        payment: sponsored(GELATO_API_KEY),
        calls,
      });

      const userOpHash = smartWalletResponse?.id;

      const txHash = await smartWalletResponse?.wait();

      toast.success("Tokens claimed successfully!");

      // Add log entry
      addLog({
        message: "Minted 100 USDC",
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
      toast.error(`Error claiming token. Check the logs`);
    } finally {
      setIsMinting(false);
    }
  };
  return (
    <div className="flex min-h-screen flex-col">
      <Header showBackButton />

      <main className="flex-1 container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Supply & Earn
            </h1>
            <p className="mt-2 text-gray-600">
              Earn interest by supplying USDC to the Morpho protocol
            </p>
          </div>

          <Tabs defaultValue="supply" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="supply">Supply</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            <TabsContent value="supply" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Supply USDC</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Image
                          src="/usdc.svg"
                          alt="USDC"
                          width={20}
                          height={20}
                        />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">USDC</div>
                        <div className="h-7 flex items-center">
                          {Number(tokenHoldings?.loanTokenBalance || "0") >
                          0 ? (
                            <div className="text-sm text-gray-500">
                              Balance: {tokenHoldings?.loanTokenBalance}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-[#2775CA] border-blue-200 h-6 px-2"
                              onClick={handleMintLoanToken}
                              disabled={isMinting}
                            >
                              {isMinting ? (
                                <>
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  Minting...
                                </>
                              ) : (
                                "Get 100 USDC"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-green-50 border-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">
                            Your Deposited Assets + Earnings
                          </div>
                          <div className="text-sm text-gray-500">
                            Earning {userApy.toFixed(2)}% APY
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatUnits(userAssets, 6)} USDC
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">
                        Amount to Supply
                      </label>
                      <button
                        className="text-sm text-blue-600"
                        onClick={() =>
                          setSupplyAmount(
                            tokenHoldings?.loanTokenBalance || "0"
                          )
                        }
                      >
                        Max
                      </button>
                    </div>
                    <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                      <Input
                        className="border-0 flex-1 min-w-0"
                        placeholder="0.0"
                        value={supplyAmount}
                        onChange={(e) =>
                          setSupplyAmount(
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                      />
                      <div className="px-4 py-3 bg-gray-100 text-lg font-semibold text-gray-800">
                        USDC
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSupply}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={
                      Number(supplyAmount) >
                        Number(tokenHoldings?.loanTokenBalance || "0") ||
                      Number(supplyAmount) === 0
                    }
                  >
                    Supply USDC
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="withdraw" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Supplied Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  {userAssets > 0 ? (
                    <div className="space-y-6">
                      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Image
                              src="/usdc.svg"
                              alt="USDC"
                              width={20}
                              height={20}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">USDC</div>
                          </div>
                          <div className="ml-auto bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {userApy.toFixed(2)}% APY
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <div className="text-lg font-semibold">
                              Total Balance
                            </div>
                            <div className="text-sm text-gray-500">
                              Principal + Interest
                            </div>
                          </div>
                          <div className="text-xl font-bold">
                            {formatUnits(userAssets, 6)} USDC
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium">
                              Amount to Withdraw
                            </label>
                            <button
                              className="text-sm text-blue-600"
                              onClick={() =>
                                setWithdrawAmount(formatUnits(userAssets, 6))
                              }
                            >
                              Max
                            </button>
                          </div>
                          <div className="flex items-center border rounded-md overflow-hidden">
                            <Input
                              className="border-0 flex-1"
                              placeholder="0.0"
                              value={withdrawAmount}
                              onChange={(e) =>
                                setWithdrawAmount(
                                  e.target.value.replace(/[^0-9.]/g, "")
                                )
                              }
                            />
                            <div className="px-3 py-2 bg-gray-100">USDC</div>
                          </div>
                        </div>

                        <Button
                          onClick={handleWithdraw}
                          className="w-full mt-4 bg-black hover:bg-gray-800 text-white"
                          disabled={
                            !withdrawAmount ||
                            withdrawAmount === "0" ||
                            Number(parseUnits(withdrawAmount, 6)) > userAssets
                          }
                        >
                          Withdraw USDC
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>You don't have any supplied assets yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Market Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingMarketDetails ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading market details...</span>
                </div>
              ) : (
                <Tabs defaultValue="market" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="market" className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Market
                    </TabsTrigger>
                    <TabsTrigger value="vault" className="flex items-center">
                      <Vault className="h-4 w-4 mr-2" />
                      Vault
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="market" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Image
                              src="/usdc.svg"
                              alt="USDC"
                              width={20}
                              height={20}
                            />
                          </div>
                          <span>USDC</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {marketData.apr.toFixed(2)}% APY
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Utilization Rate
                          </span>
                          <span className="text-sm font-medium">
                            {marketData.utilizationRate.toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${marketData.utilizationRate}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="border-t pt-3 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Supplied</span>
                          <span className="font-medium">
                            ~{Math.round(marketData.totalSupply)} USDC
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">Total Borrowed</span>
                          <span className="font-medium">
                            ~{Math.round(marketData.totalBorrowed)} USDC
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="vault" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Allowed Deposit Cap
                          </span>
                          <span className="text-sm font-medium">
                            ~{Math.round(vaultData.totalSupply)} /
                            {Math.round(vaultData.supplyCap)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (vaultData.totalSupply / vaultData.supplyCap) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="text-green-600 font-medium">
                            {vaultData.supplyCap - vaultData.totalSupply}{" "}
                            remaining
                          </span>{" "}
                          before cap is reached
                        </div>
                      </div>

                      <div className="border-t pt-3 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Supply</span>
                          <span className="font-medium">
                            ~{Math.round(vaultData.totalSupply)} USDC
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">Supply Cap</span>
                          <span className="font-medium">
                            {Math.round(vaultData.supplyCap)} USDC
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-100 p-2 rounded-full">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Supply USDC</h3>
                  <p className="text-sm text-gray-600">
                    Deposit your USDC to earn interest
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Earn Interest</h3>
                  <p className="text-sm text-gray-600">
                    Earn {marketData.apr.toFixed(2)}% APY on your supplied USDC
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-100 p-2 rounded-full">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Withdraw Anytime</h3>
                  <p className="text-sm text-gray-600">
                    Access your funds whenever you need them
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={transactionType === "supply" ? supplyAmount : withdrawAmount}
        requiredBtc={"0"}
        status={txStatus}
        transactionType={transactionType}
      />
    </div>
  );
}
