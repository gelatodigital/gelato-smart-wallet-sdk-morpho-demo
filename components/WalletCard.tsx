import React from "react";
import { Address } from "viem";
import { ExternalLink } from "lucide-react";
import { chainConfig, tokenDetails } from "@/app/blockchain/config";
import { useTokenHoldings } from "@/lib/useFetchBlueberryBalances";
import { formatUnits } from "viem";

const WalletCard = ({
  address,
  onClaimTokens,
  onStakeTokens,
  isLoading,
}: {
  address?: string;
  isLoading?: boolean;
  onClaimTokens: () => void;
  onStakeTokens: () => void;
}) => {
  const resultTokens = useTokenHoldings(address as Address);

  console.log(resultTokens)

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
            <h3 className="text-sm font-medium text-zinc-400">Assets</h3>
            <div className="space-y-3">
              {isLoading ? (
                <div className="h-48 flex items-center justify-center text-zinc-400 text-sm">
                  Loading...
                </div>
              ) : (
               <div>
                <a
                  href={getExplorerLink(tokenDetails.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer group gap-4 sm:gap-2"
                > 
                    </a>
                  <div className="h-48 flex items-center justify-center text-zinc-400 text flex-col gap-y-2">
                    <div className="flex flex-col sm:items-end gap-1">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <span>Balance:</span>
                        <span className="text-white font-medium">
                          {formatBalance(
                            resultTokens.data?.tokens!.toString()!,
                            "18"
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={onClaimTokens}
                      className="w-full sm:w-auto text-white text-sm font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB]"
                    >
                      Claim Tokens
                    </button>
                  </div>
                  <div className="h-48 flex items-center justify-center text-zinc-400 text flex-col gap-y-2">
                    <div className="flex flex-col sm:items-end gap-1">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <span>Staked Time:</span>
                        <span className="text-white font-medium">
                          {
                            resultTokens.data?.stakedTimeString
                          }
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={onStakeTokens}
                      className="w-full sm:w-auto text-white text-sm font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB]"
                    >
                      Stake Tokens
                    </button>
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
