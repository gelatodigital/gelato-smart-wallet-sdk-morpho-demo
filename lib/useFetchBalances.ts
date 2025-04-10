import { useQuery } from "@tanstack/react-query";
import { Address, formatEther, formatUnits } from "viem";
import {
  chainConfig,
  TOKEN_CONFIG,
  tokenDetails,
} from "@/app/blockchain/config";
import { createPublicClient, http } from "viem";

const publicClient = createPublicClient({
  chain: chainConfig,
  transport: http(),
});

interface TokenHoldingsResponse {
  ethBalance: string;
  usdcBalance: string;
  wethBalance: string;
  dropBalance: string;
}

async function fetchBalances(address: Address): Promise<TokenHoldingsResponse> {
  try {
    // Fetch native ETH balance
    const ethBalance = await publicClient.getBalance({ address });

    // Fetch USDC balance
    const usdcBalance = await publicClient.readContract({
      address: TOKEN_CONFIG.USDC.address as `0x${string}`,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "balance", type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [address],
    });

    // Fetch WETH balance
    const wethBalance = await publicClient.readContract({
      address: TOKEN_CONFIG.WETH.address as `0x${string}`,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "balance", type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [address],
    });

    // Fetch Drop token balance
    const dropBalance = await publicClient.readContract({
      address: tokenDetails.address as `0x${string}`,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "balance", type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [address],
    });

    return {
      ethBalance: formatEther(ethBalance),
      usdcBalance: formatUnits(
        usdcBalance as bigint,
        TOKEN_CONFIG.USDC.decimals
      ),
      wethBalance: formatUnits(
        wethBalance as bigint,
        TOKEN_CONFIG.WETH.decimals
      ),
      dropBalance: formatEther(dropBalance as bigint), // Assuming 18 decimals for Drop token
    };
  } catch (error) {
    console.error("Error fetching token balances:", error);
    return {
      ethBalance: "0",
      usdcBalance: "0",
      wethBalance: "0",
      dropBalance: "0",
    };
  }
}

export function useTokenHoldings(
  address: Address | undefined,
  activeToken?: "USDC" | "WETH"
) {
  return useQuery({
    queryKey: ["tokenHoldings", address],
    queryFn: () => fetchBalances(address!),
    enabled: !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}
