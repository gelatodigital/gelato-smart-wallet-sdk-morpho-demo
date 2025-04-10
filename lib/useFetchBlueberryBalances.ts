import { useQuery } from "@tanstack/react-query";
import {
  chainConfig,
  tokenDetails,
  TOKEN_CONFIG,
} from "@/app/blockchain/config";
import { Contract, JsonRpcProvider } from "ethers";
import { Address, parseAbi } from "viem";
import { createPublicClient, http } from "viem";

type TokenHoldingsResponse = {
  tokens: bigint;
  usdcBalance: bigint;
  wethBalance: bigint;
};

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

      // Get token balance
      const tokens = await droppStakeContract.balanceOf(address);

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
        tokens,
        usdcBalance,
        wethBalance,
      };
    },
    enabled: !!address,
    refetchInterval: 3000, // Refetch every 3 seconds
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    staleTime: 0, // Consider data immediately stale
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });
};
