import { QueryClient } from "@tanstack/react-query";
import { defineChain } from "viem";
import { http, createConfig } from "wagmi";
import { ethers } from "ethers";
import { sepolia } from "viem/chains";

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

let blueberry = {
  id: 88153591557,
  network: "blueberry",
  name: "Arbitrum Orbit Blueberry",
  nativeCurrency: {
    name: "CGT",
    symbol: "CGT",
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ["https://rpc.arb-blueberry.gelato.digital"],
    },
    default: {
      http: ["https://rpc.arb-blueberry.gelato.digital"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Scout",
      url: "https://arb-blueberry.gelatoscout.com/",
    },
  },
  contracts: {},
  testnet: true,
};
const CHAIN_ID = 88153591557;
export const arbitrumBlueberry = /*#__PURE__*/ defineChain({
  id: CHAIN_ID,
  network: "arbitrum-blueberry",
  name: "arbitrum-blueberry",
  nativeCurrency: { name: "Custom Gas Token", symbol: "CGT", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://rpc.arb-blueberry.gelato.digital/b87eafc1609447deaef76737a5210c36",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Arbitrum Blueberry Explorer",
      url: "https://arb-blueberry.gelatoscout.com/",
    },
  },
  testnet: true,
});
export const mikeTestnet = /*#__PURE__*/ defineChain({
  id: 123420001692,
  network: "mike-testnet",
  name: "mike-testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mike-testnet.t.raas.gelato.cloud"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mike Testnet Explorer",
      url: "https://mike-testnet.cloud.blockscout.com/",
    },
  },
  testnet: true,
});
export const chainConfig = mikeTestnet;

export const tokenDetails = {
  address: "0xa2202D3148ac0F0F44b0bED0153248a0524EdA8D",
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
