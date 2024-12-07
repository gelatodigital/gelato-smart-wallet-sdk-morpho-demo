import React from 'react';
import { Address } from "viem";
import { ExternalLink } from 'lucide-react';
import { chainConfig } from "@/app/blockchain/config";
import { useTokenHoldings } from "@/lib/useFetchBlueberryBalances";
import { formatUnits } from 'viem';

const WalletCard = ({ address, onClaimTokens, isLoading }: { address?: string, isLoading?: boolean, onClaimTokens: () => void }) => {
  const { data: tokensData } = useTokenHoldings(address as Address);

  const getExplorerLink = (tokenAddress: string) => {
    return `${chainConfig.blockExplorerUrl}token/${tokenAddress}`;
  };

  const formatBalance = (value: string, decimals: string) => {
    try {
      return parseFloat(formatUnits(BigInt(value), parseInt(decimals))).toLocaleString(undefined, {
        maximumFractionDigits: 4,
        minimumFractionDigits: 0
      });
    } catch (e) {
      return value;
    }
  };

  const TokenTypeBadge = ({ type }: { type: string }) => (
    <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-700/50 text-zinc-300">
      {type}
    </span>
  );

  return (
    <div className="w-full min-h-screen md:min-h-0 px-4 sm:px-0 flex items-start md:items-center justify-center pb-[150px] md:pb-[50px] md:pt-4">
      <div className="w-full max-w-[1135px] bg-[#101010] rounded-lg p-4 sm:p-8">
        <div className="flex flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <h2 className="text-xl font-bold text-white">Your Wallet</h2>
          <a
            href={`${chainConfig.blockExplorerUrl}address/${address}?tab=tokens_erc20`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            View all <ExternalLink size={16} />
          </a>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">
              Assets
            </h3>
            <div className="space-y-3">
              {isLoading ? (
                <div className="h-48 flex items-center justify-center text-zinc-400 text-sm">Loading...</div>
              ) : tokensData && tokensData?.items?.length > 0 ? (
                tokensData?.items.map((token, index) => (
                  <a
                    key={index}
                    href={getExplorerLink(token.token.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer group gap-4 sm:gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {token.token.icon_url && (
                        <img
                          src={token.token.icon_url}
                          alt={token.token.symbol}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-base md:text-sm font-medium text-white truncate">
                            {token.token.name}
                          </p>
                          <TokenTypeBadge type={token.token.type} />
                          <ExternalLink size={14} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        <p className="text-sm text-zinc-400 truncate">
                          {token.token.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <span>Balance:</span>
                        <span className="text-white font-medium">
                          {formatBalance(token.value, token.token.decimals)} {token.token.symbol}
                        </span>
                      </div>
                      {token.token.type !== 'ERC-20' && token.token_id && (
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <span>Token ID:</span>
                          <span className="text-white font-medium">#{token.token_id}</span>
                        </div>
                      )}
                    </div>
                  </a>
                ))
              ) : (
                <div className="h-48 flex items-center justify-center text-zinc-400 text flex-col gap-y-2">
                  <p className="text-center">No assets found</p>
                  <button
                    onClick={onClaimTokens}
                    className="w-full sm:w-auto text-white text-sm font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB]"
                  >
                    Claim Tokens
                  </button>
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
