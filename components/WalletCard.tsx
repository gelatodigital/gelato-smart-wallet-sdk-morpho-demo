import React, { useState, useCallback } from "react";
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
  Wallet,
} from "lucide-react";
import {
  chainConfig,
  TOKEN_CONFIG,
  tokenDetails,
} from "@/app/blockchain/config";
import { useTokenHoldings } from "@/lib/useFetchBalances";
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

interface WalletCardProps {
  accountAddress: string;
  gasToken: "USDC" | "WETH";
  handleLogout?: () => void;
}

export default function WalletCard({
  accountAddress,
  gasToken,
  handleLogout,
}: WalletCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { data: tokenHoldings } = useTokenHoldings(
    accountAddress as Address,
    gasToken
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(accountAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [accountAddress]);

  const handleExplorerClick = () => {
    window.open(
      `https://scope.sh/11155111/address/${accountAddress}`,
      "_blank"
    );
  };

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

  return (
    <div className="space-y-4">
      <div className="w-full flex flex-col p-4 bg-[#202020] border rounded-[12px] border-[#2A2A2A]">
        <div className="flex justify-center">
          {handleLogout && (
            <button
              onClick={handleLogout}
              className="w-32 py-3 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              Log out
            </button>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col p-4 bg-[#202020] border rounded-[12px] border-[#2A2A2A]">
        <div className="w-full flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-[#252525] rounded flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[#807872]" />
          </div>
          <h3 className="text-text-title text-md font-medium break-words ps-2">
            Wallet Details
          </h3>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between bg-dark-100 p-2 rounded border border-dark-200">
            <code className="text-sm text-text-title">{accountAddress}</code>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="text-sm text-blue-500 hover:text-blue-400"
              >
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleExplorerClick}
                className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
              >
                Explorer
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-text-tertiary">Smart EOA</div>
          <div className="flex items-center">
            <div className="flex items-center text-green-500 text-sm">
              <svg
                className="w-4 h-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Smart EOA
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col p-4 bg-[#202020] border rounded-[12px] border-[#2A2A2A]">
        <div className="w-full flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-[#252525] rounded flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[#807872]" />
          </div>
          <h3 className="text-text-title text-md font-medium break-words ps-2">
            Wallet Balance
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-dark-200">
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2">
                <Image
                  src="/weth.svg"
                  alt="ETH"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <span className="text-sm text-text-tertiary">ETH</span>
            </div>
            <div className="text-sm text-text-title">
              {tokenHoldings?.ethBalance || "0.0000"}
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-dark-200">
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2">
                <Image
                  src="/usdc.svg"
                  alt="USDC"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <span className="text-sm text-text-tertiary">USDC</span>
            </div>
            <div className="text-sm text-text-title">
              {tokenHoldings?.usdcBalance || "0.00"}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2">
                <Image
                  src="/weth.svg"
                  alt="WETH"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <span className="text-sm text-text-tertiary">WETH</span>
            </div>
            <div className="text-sm text-text-title">
              {tokenHoldings?.wethBalance || "0.0000"}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-purple-900 mr-2 flex items-center justify-center text-sm">
                D
              </div>
              <span className="text-sm text-text-tertiary">DROP</span>
            </div>
            <div className="text-sm text-text-title">
              {tokenHoldings?.dropBalance || "0.0000"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
