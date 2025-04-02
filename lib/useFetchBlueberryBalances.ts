import { useQuery } from "@tanstack/react-query";
import {
  chainConfig,
  tokenDetails,
  TOKEN_CONFIG,
} from "@/app/blockchain/config";
import { Contract, JsonRpcProvider } from "ethers";
import { Address, parseAbi } from "viem";
import { createPublicClient, http } from "viem";

interface TokenHoldingsResponse {
  tokens: number;
  stakedTimeString: string;
  sec: number;
  usdcBalance: string;
  wethBalance: string;
}

// Create a single provider instance
const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
const publicClient = createPublicClient({
  chain: chainConfig,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export const useTokenHoldings = (
  address: Address,
  gasToken: "USDC" | "WETH"
) => {
  return useQuery({
    queryKey: ["tokenHoldings", address, gasToken],
    queryFn: async (): Promise<TokenHoldingsResponse> => {
      if (!address) throw new Error("Address is required");

      // Create contract instance once
      const droppStakeContract = new Contract(
        tokenDetails.address,
        tokenDetails.abi,
        provider
      );

      // Batch the contract calls
      const [tokens, stakedTimestamp] = await Promise.all([
        droppStakeContract.balanceOf(address),
        droppStakeContract.staked(address),
      ]);

      const stakedTimeMs = +stakedTimestamp.toString() * 1000;
      const stakedTimeString =
        stakedTimeMs === 0
          ? "Not Staked"
          : new Date(stakedTimeMs).toLocaleTimeString();

      const now = Date.now();
      const sec =
        stakedTimeMs === 0 ? 0 : Math.floor((now - stakedTimeMs) / 1000);

      // Batch the balance checks
      const [usdcBalance, wethBalance] = await Promise.all([
        publicClient.readContract({
          abi: parseAbi([
            "function balanceOf(address account) returns (uint256)",
          ]),
          address: TOKEN_CONFIG["USDC"].address as Address,
          functionName: "balanceOf",
          args: [address],
        }),
        publicClient.readContract({
          abi: parseAbi([
            "function balanceOf(address account) returns (uint256)",
          ]),
          address: TOKEN_CONFIG["WETH"].address as Address,
          functionName: "balanceOf",
          args: [address],
        }),
      ]);

      return {
        tokens: +tokens.toString(),
        stakedTimeString,
        sec,
        usdcBalance: (usdcBalance as bigint).toString(),
        wethBalance: (wethBalance as bigint).toString(),
      };
    },
    enabled: !!address,
    refetchInterval: 10000, // Increase to 10 seconds
    refetchIntervalInBackground: true,
    staleTime: 5000, // Consider data fresh for 5 seconds
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });
};
