import React from "react";
import { Address } from "viem";
import {
  Timer,
  Lock,
  Coins,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  chainConfig,
  TOKEN_CONFIG,
  tokenDetails,
} from "@/app/blockchain/config";
import { useTokenHoldings } from "@/lib/useFetchBlueberryBalances";
import { formatUnits } from "viem";
import Image from "next/image";

type GasPaymentMethod = "sponsored" | "erc20";
type GasToken = "USDC" | "WETH";

const TokenIcon = ({ token }: { token: "USDC" | "WETH" }) => {
  const icons = {
    USDC: (
      <div className="bg-[#2775CA]/10 p-1.5 rounded-lg">
        <Image
          src="/usdc.svg"
          alt="USDC"
          width={16}
          height={16}
          className="w-4 h-4"
        />
      </div>
    ),
    WETH: (
      <div className="bg-[#627EEA]/10 p-1.5 rounded-lg">
        <Image
          src="/weth.svg"
          alt="WETH"
          width={16}
          height={16}
          className="w-4 h-4"
        />
      </div>
    ),
  };

  return icons[token];
};

const WalletCard = ({
  address,
  onClaimTokens,
  isLoading,
  gasPaymentMethod,
  onGasPaymentMethodChange,
  gasToken,
  onGasTokenChange,
}: {
  address?: string;
  isLoading?: boolean;
  onClaimTokens: () => void;
  gasPaymentMethod: GasPaymentMethod;
  onGasPaymentMethodChange: (method: GasPaymentMethod) => void;
  gasToken: GasToken;
  onGasTokenChange: (token: GasToken) => void;
}) => {
  const { data: resultTokens, refetch: refetchTokens } = useTokenHoldings(
    address as Address,
    gasToken
  );

  React.useEffect(() => {
    // Refetch balances when gas payment method or token changes
    refetchTokens();
  }, [gasPaymentMethod, gasToken, refetchTokens]);

  const getExplorerLink = (address: string) => {
    return `${chainConfig.blockExplorers.default.url}/address/${address}`;
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

  const handleClaimTokens = async () => {
    try {
      await onClaimTokens();
      // Refetch balances after claiming tokens
      await refetchTokens();
    } catch (error) {
      console.error("Error claiming tokens:", error);
    }
  };

  return (
    <div className="pb-4 md:pb-0 w-full h-auto px-4 sm:px-0 flex items-center justify-center">
      <div className="w-full max-w-[1135px] bg-[#18181B] rounded-xl p-8 relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#00AEFA] animate-spin" />
              <p className="text-white text-sm font-medium">
                Processing Transaction...
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white">Your Wallet</h2>
          <a
            href={address ? getExplorerLink(address) : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm">View all</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Info Banner */}
        <div className="bg-[#1E293B] rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 text-[#00AEFA]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
            <p className="text-sm text-gray-300">
              {gasPaymentMethod === "sponsored"
                ? "These are sponsored transactions powered by Gelato's 1Balance"
                : `These transactions will use your ${gasToken} tokens for gas payments`}
            </p>
          </div>
          <p className="text-sm text-gray-300 mt-1 ml-7">
            Begin by claiming your tokens to start using 7702 functionalities.
          </p>
        </div>

        {/* Gas Payment Method Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => onGasPaymentMethodChange("sponsored")}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              gasPaymentMethod === "sponsored"
                ? "bg-[#00AEFA] text-white"
                : "bg-[#27272A] text-gray-400 hover:text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Sponsored
          </button>
          <button
            onClick={() => onGasPaymentMethodChange("erc20")}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              gasPaymentMethod === "erc20"
                ? "bg-[#00AEFA] text-white"
                : "bg-[#27272A] text-gray-400 hover:text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ERC20 Gas
          </button>
        </div>

        {/* Sponsored Section Heading - Only show in sponsored mode */}
        {gasPaymentMethod === "sponsored" && (
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="bg-[#27272A] rounded-xl p-4 flex items-center gap-3">
              <div className="bg-[#00AEFA]/10 p-2 rounded-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#00AEFA]"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-medium">
                  Sponsored with 1Balance
                </span>
                <span className="text-sm text-gray-400">
                  Gas fees covered by Gelato Network
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Gas Token Selector - Only show in ERC20 mode */}
        {gasPaymentMethod === "erc20" && (
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => onGasTokenChange("USDC")}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                gasToken === "USDC"
                  ? "bg-[#00AEFA] text-white"
                  : "bg-[#27272A] text-gray-400 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <TokenIcon token="USDC" />
              USDC
            </button>
            <button
              onClick={() => onGasTokenChange("WETH")}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                gasToken === "WETH"
                  ? "bg-[#00AEFA] text-white"
                  : "bg-[#27272A] text-gray-400 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <TokenIcon token="WETH" />
              WETH
            </button>
          </div>
        )}

        {/* Gas Token Balances - Only show in ERC20 mode */}
        {gasPaymentMethod === "erc20" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* USDC Balance */}
            <div className="bg-[#27272A] rounded-xl p-7">
              <div className="flex items-center gap-4">
                <TokenIcon token="USDC" />
                <div>
                  <span className="text-sm text-gray-400">USDC Balance</span>
                  <div className="text-lg font-semibold text-white">
                    {resultTokens?.usdcBalance
                      ? formatBalance(
                          resultTokens.usdcBalance.toString(),
                          TOKEN_CONFIG["USDC"].decimals.toString()
                        )
                      : "0"}{" "}
                    USDC
                  </div>
                </div>
              </div>
            </div>

            {/* WETH Balance */}
            <div className="bg-[#27272A] rounded-xl p-7">
              <div className="flex items-center gap-4">
                <TokenIcon token="WETH" />
                <div>
                  <span className="text-sm text-gray-400">WETH Balance</span>
                  <div className="text-lg font-semibold text-white">
                    {resultTokens?.wethBalance
                      ? formatBalance(
                          resultTokens.wethBalance.toString(),
                          TOKEN_CONFIG["WETH"].decimals.toString()
                        )
                      : "0"}{" "}
                    WETH
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Token Claiming Section */}
        <div className="w-full bg-[#27272A] rounded-xl p-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#00AEFA]/10 p-2.5 rounded-lg">
                <Coins className="w-5 h-5 text-[#00AEFA]" />
              </div>
              <div>
                <span className="text-sm text-gray-400">Token Balance</span>
                <div className="text-lg font-semibold text-white">
                  {resultTokens?.tokens
                    ? formatBalance(resultTokens.tokens.toString(), "18")
                    : "0"}{" "}
                  Tokens
                </div>
              </div>
            </div>
            <button
              onClick={handleClaimTokens}
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#00AEFA] text-white text-sm font-medium rounded-lg
                hover:bg-[#0099E6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Claim Tokens"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
