import React from "react";
import { Address } from "viem";
import { Timer, Lock, Coins, ExternalLink } from "lucide-react";
import { chainConfig, TOKEN_CONFIG } from "@/app/blockchain/config";
import { useTokenHoldings } from "@/lib/useFetchBlueberryBalances";
import { formatUnits } from "viem";

type GasPaymentMethod = "sponsored" | "erc20";
type GasToken = "USDC" | "WETH";

const WalletCard = ({
  address,
  onClaimTokens,
  onStakeTokens,
  isLoading,
  gasPaymentMethod,
  onGasPaymentMethodChange,
  gasToken,
  onGasTokenChange,
}: {
  address?: string;
  isLoading?: boolean;
  onClaimTokens: () => void;
  onStakeTokens: () => void;
  gasPaymentMethod: GasPaymentMethod;
  onGasPaymentMethodChange: (method: GasPaymentMethod) => void;
  gasToken: GasToken;
  onGasTokenChange: (token: GasToken) => void;
}) => {
  const resultTokens = useTokenHoldings(address as Address, gasToken);

  const getExplorerLink = (tokenAddress: string) => {
    return `${chainConfig.blockExplorers.default.url}/token/${tokenAddress}`;
  };

  const formatBalance = (value: string, decimals: string) => {
    try {
      return parseFloat(
        formatUnits(BigInt(value), parseInt(decimals))
      ).toLocaleString(undefined, {
        maximumFractionDigits: 4,
        minimumFractionDigits: 0,
      });
    } catch (e) {
      return value;
    }
  };

  return (
    <div className="w-full min-h-screen md:min-h-0 px-4 sm:px-0 flex items-start md:items-center justify-center pb-[150px] md:pb-[50px] md:pt-4">
      <div className="w-full max-w-[1135px] bg-[#101010] rounded-lg p-4 sm:p-8">
        <div className="flex flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <h2 className="text-xl font-bold text-white">Your Wallet</h2>
          <a
            href={`${chainConfig.blockExplorers.default.url}/address/${address}?tab=tokens_erc20`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            View all <ExternalLink size={16} />
          </a>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="bg-[#1E293B]/50 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-3 border border-[#1E293B]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#00AEFA] mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {gasPaymentMethod === "sponsored"
                    ? "Get 2 sponsored transactions every hour. If you stake, after 5 min you will be able to enjoy free txs"
                    : `These transactions will use your ${gasToken} tokens for gas payments`}
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Begin by claiming your tokens to start staking.
                </p>
              </div>
            </div>

            <div className="space-y-3 relative">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="bg-zinc-900 rounded-xl p-1 flex gap-1">
                  <button
                    onClick={() => onGasPaymentMethodChange("sponsored")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      gasPaymentMethod === "sponsored"
                        ? "bg-blue-500 text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Sponsored
                  </button>
                  <button
                    onClick={() => onGasPaymentMethodChange("erc20")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      gasPaymentMethod === "erc20"
                        ? "bg-blue-500 text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    ERC20 Gas
                  </button>
                </div>

                {gasPaymentMethod === "erc20" && (
                  <div className="bg-zinc-900 rounded-xl p-1 flex gap-1">
                    <button
                      onClick={() => onGasTokenChange("USDC")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        gasToken === "USDC"
                          ? "bg-blue-500 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      USDC
                    </button>
                    <button
                      onClick={() => onGasTokenChange("WETH")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        gasToken === "WETH"
                          ? "bg-blue-500 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      WETH
                    </button>
                  </div>
                )}
              </div>

              {gasPaymentMethod === "erc20" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">
                        USDC Balance
                      </span>
                      <span className="text-white font-medium">
                        {formatBalance(
                          resultTokens.data?.usdcBalance ?? "0",
                          "6"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">
                        WETH Balance
                      </span>
                      <span className="text-white font-medium">
                        {formatBalance(
                          resultTokens.data?.wethBalance ?? "0",
                          "18"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`w-full flex flex-col md:flex-row gap-6 mt-6 ${
                  isLoading ? "opacity-50" : ""
                }`}
              >
                {/* Balance Card */}
                <div className="w-full bg-zinc-900 rounded-2xl p-8 shadow-xl border border-zinc-800 transform transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <div className="bg-blue-500/10 p-3 rounded-full">
                        <Coins className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-sm">Balance</span>
                        <span className="text-white text-2xl font-bold">
                          {formatBalance(
                            resultTokens.data?.tokens?.toString() ?? "0",
                            "18"
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={onClaimTokens}
                      className="w-full sm:w-auto text-white text-sm font-bold duration-200 font-semibold px-8 py-3
                       rounded-xl bg-gradient-to-r from-[#00AEFA] to-[#00AEFA]
                       hover:from-[#1093CD] hover:to-[#00CECB]
                       transform transition-all hover:scale-[1.02]
                       shadow-lg hover:shadow-[#00AEFA]/25
                       flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Claim Tokens</span>
                    </button>
                  </div>
                </div>

                {/* Staking Card */}
                <div className="w-full bg-zinc-900 rounded-2xl p-8 shadow-xl border border-zinc-800 transform transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700">
                  <div className="h-48 flex items-center justify-center text-zinc-400 text flex-col gap-y-4">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <div className="bg-blue-500/10 p-3 rounded-full">
                        <Lock className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-sm">
                          Staked Time:
                        </span>
                        <span className="text-white text-2xl font-bold">
                          {resultTokens?.data?.stakedTimeString ?? "Not Staked"}
                        </span>
                      </div>
                    </div>
                    {gasPaymentMethod === "sponsored" && (
                      <div className="flex flex-col sm:items-center gap-1">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <span>Endless sponsor:</span>
                          <span className="text-white font-medium">
                            {resultTokens.data?.stakedTimeString == "Not Staked"
                              ? "No"
                              : resultTokens.data?.sec! > 300
                              ? "YES"
                              : 300 - resultTokens.data?.sec! + " sec to go"}
                          </span>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={onStakeTokens}
                      className="w-full sm:w-auto text-white text-sm font-bold duration-200 font-semibold px-8 py-3
                       rounded-xl bg-gradient-to-r from-[#00AEFA] to-[#00AEFA]
                       hover:from-[#1093CD] hover:to-[#00CECB]
                       transform transition-all hover:scale-[1.02]
                       shadow-lg hover:shadow-[#00AEFA]/25
                       flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Timer className="w-4 h-4" />
                      <span>Stake Tokens</span>
                    </button>
                  </div>
                </div>
              </div>

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/20 backdrop-blur-sm rounded-2xl top-[-14px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
