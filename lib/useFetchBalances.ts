import { useQuery } from "@tanstack/react-query";
import { Address, formatEther, formatUnits } from "viem";
import {
  chainConfig,
  TOKEN_CONFIG,
  marketParams,
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
  cbBTCBalance: string;
  loanTokenBalance: string;
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

    // Fetch cbBTC balance
    const cbBTCBalance = await publicClient.readContract({
      address: marketParams.collateralToken as `0x${string}`,
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

    // Fetch loan token (USDC) balance
    const loanTokenBalance = await publicClient.readContract({
      address: marketParams.loanToken as `0x${string}`,
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
      cbBTCBalance: formatUnits(cbBTCBalance as bigint, 8), // Assuming 18 decimals for cbBTC
      loanTokenBalance: formatUnits(
        loanTokenBalance as bigint,
        TOKEN_CONFIG.USDC.decimals
      ),
    };
  } catch (error) {
    console.error("Error fetching token balances:", error);
    return {
      ethBalance: "0",
      usdcBalance: "0",
      wethBalance: "0",
      cbBTCBalance: "0",
      loanTokenBalance: "0",
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
