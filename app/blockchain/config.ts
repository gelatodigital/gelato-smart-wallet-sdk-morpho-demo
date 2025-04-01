import { QueryClient } from "@tanstack/react-query";
import { defineChain } from "viem";
import { inkSepolia, megaethTestnet, odysseyTestnet } from "viem/chains";
import { http, createConfig } from "wagmi";
import { FaEthereum, FaBitcoin } from "react-icons/fa";
import { HiOutlineCurrencyDollar } from "react-icons/hi";

export const queryClient = new QueryClient();
export const chess = defineChain({
  id: 123420000962,
  network: "chess",
  name: "Chess",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ["https://rpc.chess.t.raas.gelato.cloud"],
    },
    default: {
      http: ["https://rpc.chess.t.raas.gelato.cloud"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Scout",
      url: "https://chess.cloud.blockscout.com/",
    },
  },
  contracts: {},
  testnet: true,
});
export const wagmiConfig = createConfig({
  chains: [chess],
  pollingInterval: 1000,
  transports: {
    [chess.id]: http(),
  },
});

export const client = wagmiConfig.getClient();
export type Client = typeof client;

export const chainConfig = megaethTestnet;
export const usdcAddress = "0x85c976Df26e086C5333a4E44bC484877fDF46974";
export const wethAddress = "0xB4Dfea29f84Abd6cF3c1800ebD3b89Cd8D9048Ac";

export const ZERODEV_PROJECT_ID = ""; // Project Id for MegaETH Tesstnet

export const TOKEN_CONFIG = {
  USDC: {
    address: usdcAddress,
    symbol: "USDC",
    decimals: 6,
    icon: HiOutlineCurrencyDollar,
    paymasterUrl: `https://rpc.zerodev.app/api/v2/paymaster/${ZERODEV_PROJECT_ID}?selfFunded=true`,
  },
  WETH: {
    address: wethAddress,
    symbol: "WETH",
    decimals: 18,
    icon: FaEthereum,
    paymasterUrl: `https://rpc.zerodev.app/api/v2/paymaster/${ZERODEV_PROJECT_ID}?selfFunded=true`,
  },
  // DAI: {
  //   address: DaiAddress,
  //   symbol: "DAI",
  //   decimals: 18,
  //   icon: HiOutlineCurrencyDollar,
  //   paymasterUrl: `https://rpc.zerodev.app/api/v2/paymaster/${ZERODEV_PROJECT_ID}?selfFunded=true`,
  // },
  // WBTC: {
  //   address: wbtcAddress,
  //   symbol: "WBTC",
  //   decimals: 18,
  //   icon: FaBitcoin,
  //   paymasterUrl: `https://rpc.zerodev.app/api/v2/paymaster/${ZERODEV_PROJECT_ID}?selfFunded=true`,
  // },
  // USDT: {
  //   address: usdtAddress,
  //   symbol: "USDT",
  //   decimals: 18,
  //   icon: HiOutlineCurrencyDollar,
  //   paymasterUrl: `https://rpc.zerodev.app/api/v2/paymaster/${ZERODEV_PROJECT_ID}?selfFunded=true`,
  // },
};

export const tokenDetails = {
  address: "0x792A9Fd227C690f02beB23678a52BF766849DFc0",
  abi2: [
    "function drop() external",
    "function stake() external",
    "function balanceOf(address) external view returns(uint256)",
    "function staked(address) external view returns(uint256)",
  ],
  abi: [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "Dropped",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "subtractedValue", type: "uint256" },
      ],
      name: "decreaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "drop",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "dropped",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "addedValue", type: "uint256" },
      ],
      name: "increaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "stake",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "staked",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
