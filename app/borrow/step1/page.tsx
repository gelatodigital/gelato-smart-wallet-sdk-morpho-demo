"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRightCircle,
  TrendingUp,
  AlertTriangle,
  Copy,
  ExternalLink,
  Wallet,
  Check,
  LogOut,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import { useTokenHoldings } from "@/lib/useFetchBalances";
import { Address, encodeFunctionData, http } from "viem";
import { useState, useCallback } from "react";
import { chainConfig, marketParams, tokenABI } from "@/app/blockchain/config";
import { toast } from "sonner";
import { useActivityLog } from "@/contexts/ActivityLogContext";
import { useGelatoSmartWalletProviderContext } from "@gelatonetwork/smartwallet-react-sdk";
import { sponsored } from "@gelatonetwork/smartwallet";

const GELATO_API_KEY = process.env.NEXT_PUBLIC_MORPHO_GELATO_API_KEY!;

export default function Step1() {
  const router = useRouter();
  const {
    gelato: { client },
    logout,
  } = useGelatoSmartWalletProviderContext();

  const [isCopied, setIsCopied] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const { addLog } = useActivityLog();
  const [isProceeding, setIsProceeding] = useState(false);

  const accountAddress = client?.account.address;
  const { data: tokenHoldings, refetch: refetchTokenHoldings } =
    useTokenHoldings(accountAddress as Address);

  const handleCopy = useCallback(() => {
    if (accountAddress) {
      navigator.clipboard.writeText(accountAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [accountAddress]);

  const handleExplorerClick = () => {
    if (accountAddress) {
      window.open(`https://scope.sh/84532/address/${accountAddress}`, "_blank");
    }
  };

  const handleLogout = async () => {
    logout();
    router.push("/");
  };

  const handleMintCollateral = async () => {
    try {
      setIsMinting(true);

      // Convert input amount to proper decimal format (8 decimals)
      const amountInDecimals = BigInt(Math.floor(parseFloat("1") * 100000000));

      const calls = [
        // Add approval call for collateral token
        {
          to: marketParams.collateralToken as `0x${string}`,
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
        message: "Minted 1 cbBTC",
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

  const handleProceed = async () => {
    setIsProceeding(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await router.push("/borrow/step2");
    } finally {
      setIsProceeding(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 mt-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Get a USDC loan
              <br />
              with your Bitcoin
            </h1>
            <p className="mt-2 flex items-center text-gray-600">
              Powered by Morpho
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-blue-100 p-2 rounded-full">
                <ArrowRightCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Borrow USDC</h3>
                <p className="text-gray-600">using your BTC as collateral</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-blue-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Keep your LTV below 86%
                </h3>
                <p className="text-gray-600">to prevent liquidation</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-blue-100 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Interest rate is variable
                </h3>
                <p className="text-gray-600">
                  Rates change based on supply and demand for loans on Morpho
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleProceed}
            className="w-full md:w-auto bg-black hover:bg-gray-800 px-8 py-2 text-white"
            disabled={isProceeding}
          >
            {isProceeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Proceeding...
              </>
            ) : (
              "Borrow now"
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <CardTitle>Wallet Details</CardTitle>
              </div>
              {accountAddress && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3 text-sm">
                  <code className="text-xs sm:text-sm font-mono">
                    {accountAddress || "Connect your wallet"}
                  </code>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopy}
                      disabled={!accountAddress}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleExplorerClick}
                      disabled={!accountAddress}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View in Explorer</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-500">
                  <Check className="mr-1 h-4 w-4" />
                  <span>Smart EOA</span>
                </div>
                <span className="text-gray-600">
                  Powered by{" "}
                  <span className="font-semibold text-[#FF3B57]">Gelato</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <CardTitle>Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Image src="/weth.svg" alt="ETH" width={20} height={20} />
                    </div>
                    <span>ETH</span>
                  </div>
                  <span className="font-mono">
                    {tokenHoldings?.ethBalance || "0.0000"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Image
                        src="/bitcoin.svg"
                        alt="cbBTC"
                        width={20}
                        height={20}
                      />
                    </div>
                    <span>cbBTC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {tokenHoldings?.cbBTCBalance != "0"
                        ? tokenHoldings?.cbBTCBalance
                        : ""}
                    </span>
                    {accountAddress &&
                      (!tokenHoldings?.cbBTCBalance ||
                        parseFloat(tokenHoldings.cbBTCBalance) === 0) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200"
                          onClick={handleMintCollateral}
                          disabled={isMinting}
                        >
                          {isMinting ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Minting...
                            </>
                          ) : (
                            "Get 1 cbBTC"
                          )}
                        </Button>
                      )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
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
                  <span className="font-mono">
                    {tokenHoldings?.loanTokenBalance || "0.00"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
