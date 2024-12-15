import { QueryClient } from '@tanstack/react-query'
import { defineChain } from 'viem';
import { http, createConfig } from 'wagmi'
import {ethers} from "ethers";
import { sepolia } from 'viem/chains';


export const queryClient = new QueryClient()
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
})

export const client = wagmiConfig.getClient()
export type Client = typeof client

let blueberry ={
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
  contracts: {
  },
  testnet: true,
}

export const chainConfig = sepolia

