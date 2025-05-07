"use client";

import { useRouter } from "next/navigation";
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
  Loader2,
  LogOut,
} from "lucide-react";
import Header from "@/components/Header";
import Image from "next/image";
import { useGelatoSmartWalletProviderContext } from "@gelatonetwork/smartwallet-react-sdk";
import { toast } from "sonner";
import { tokenABI } from "../blockchain/abi/ERC20ABI";
import { marketParams } from "../blockchain/config";
import { Address, encodeFunctionData } from "viem";
import { useTokenHoldings } from "@/lib/useFetchBalances";
import { useCallback, useState } from "react";
import { useActivityLog } from "@/contexts/ActivityLogContext";
import { sponsored } from "@gelatonetwork/smartwallet";

const GELATO_API_KEY = process.env.NEXT_PUBLIC_MORPHO_GELATO_API_KEY!;

export default function Dashboard() {
  const router = useRouter();
  const {
    gelato: { client },
    logout,
  } = useGelatoSmartWalletProviderContext();

  const [isCopied, setIsCopied] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const { addLog } = useActivityLog();
  const [isBorrowProceeding, setIsBorrowProceeding] = useState(false);
  const [isSupplyProceeding, setIsSupplyProceeding] = useState(false);
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
    setIsBorrowProceeding(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await router.push("/borrow/step1");
    } finally {
      setIsBorrowProceeding(false);
    }
  };

  const handleSupplyProceed = async () => {
    setIsSupplyProceeding(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await router.push("/earn");
    } finally {
      setIsSupplyProceeding(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Manage your crypto assets
            </h1>
            <p className="mt-2 flex items-center text-gray-600">
              Powered by Morpho
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 hover:border-blue-600 transition-colors">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <ArrowRightCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-xl">Borrow USDC</h3>
                  <p className="text-gray-600">
                    Get a USDC loan using your cbBTC as collateral. Keep your
                    Bitcoin while accessing liquidity.
                  </p>
                  <div className="pt-2">
                    <Button
                      onClick={() => handleProceed()}
                      disabled={isBorrowProceeding}
                      className="w-full bg-black hover:bg-gray-800 text-white"
                    >
                      {isBorrowProceeding ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Proceeding...
                        </>
                      ) : (
                        "Borrow"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-600 transition-colors">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-xl">Supply & Earn</h3>
                  <p className="text-gray-600">
                    Supply your USDC and start earning interest — unlock
                    competitive returns while keeping your assets secure.
                  </p>
                  <div className="pt-2">
                    <Button
                      onClick={() => handleSupplyProceed()}
                      disabled={isSupplyProceeding}
                      className="w-full bg-black hover:bg-gray-800 text-white"
                    >
                      {isSupplyProceeding ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Proceeding...
                        </>
                      ) : (
                        "Earn"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Key Features</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-100 p-2 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Variable Interest Rates</h3>
                  <p className="text-gray-600">
                    Rates change based on supply and demand for loans on Morpho
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Competitive Yields</h3>
                  <p className="text-gray-600">
                    Earn attractive interest rates on your supplied assets
                  </p>
                </div>
              </div>
            </div>
          </div>
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
