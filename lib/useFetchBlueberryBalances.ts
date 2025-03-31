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

export const useTokenHoldings = (
  address: Address,
  gasToken: "USDC" | "WETH"
) => {
  const publicClient = createPublicClient({
    chain: chainConfig,
    transport: http(chainConfig.rpcUrls.default.http[0]),
  });

  return useQuery({
    queryKey: ["tokenHoldings", address, gasToken],
    queryFn: async (): Promise<TokenHoldingsResponse> => {
      if (!address) throw new Error("Address is required");

      const provider = new JsonRpcProvider(chainConfig.rpcUrls.default.http[0]);
      const droppStakeContract = new Contract(
        tokenDetails.address,
        tokenDetails.abi,
        provider
      );
      const tokens = +(await droppStakeContract.balanceOf(address)).toString();
      const stakedTimestamp =
        +(await droppStakeContract.staked(address)).toString() * 1000;
      const stakedTimeString =
        stakedTimestamp == 0
          ? "Not Staked"
          : new Date(stakedTimestamp).toLocaleTimeString();
      let now = Date.now();

      let sec =
        stakedTimestamp == 0 ? 0 : Math.floor((now - stakedTimestamp) / 1000);

      // Fetch USDC balance
      const usdcBalance = (await publicClient.readContract({
        abi: parseAbi([
          "function balanceOf(address account) returns (uint256)",
        ]),
        address: TOKEN_CONFIG["USDC"].address as Address,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;

      // Fetch WETH balance
      const wethBalance = (await publicClient.readContract({
        abi: parseAbi([
          "function balanceOf(address account) returns (uint256)",
        ]),
        address: TOKEN_CONFIG["WETH"].address as Address,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;

      return {
        tokens,
        stakedTimeString,
        sec,
        usdcBalance: usdcBalance.toString(),
        wethBalance: wethBalance.toString(),
      };
    },
    enabled: !!address,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
  });
};
