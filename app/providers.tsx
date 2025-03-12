"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { mergeNetworks } from "@dynamic-labs/sdk-react-core";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const evmNetworks = [
    {
      blockExplorerUrls: ["https://arb-blueberry.gelatoscout.com/"],
      chainId: 88153591557,
      chainName: "Arbitrum Blueberry",
      iconUrls: ["https://app.dynamic.xyz/assets/networks/base.svg"],
      name: "Arbitrum Blueberry",
      nativeCurrency: {
        decimals: 18,
        name: "Custom Gas Token",
        symbol: "CGT",
        iconUrl: "https://app.dynamic.xyz/assets/networks/eth.svg",
      },
      networkId: 88153591557,
      rpcUrls: [
        "https://rpc.arb-blueberry.gelato.digital/b87eafc1609447deaef76737a5210c36",
      ],
      vanityName: "Arbitrum Blueberry",
    },
    {
      blockExplorerUrls: ["https://mike-testnet.cloud.blockscout.com/"],
      chainId: 123420001692,
      chainName: "Mike Testnet",
      iconUrls: ["https://app.dynamic.xyz/assets/networks/base.svg"],
      name: "Mike Testnet",
      nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
        iconUrl: "https://app.dynamic.xyz/assets/networks/eth.svg",
      },
      networkId: 123420001692,
      rpcUrls: ["https://rpc.mike-testnet.t.raas.gelato.cloud"],
      vanityName: "Mike Testnet",
    },
  ];
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "1cc03587-8f17-4f55-9cd2-56b25b47e120",
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: (networks) => mergeNetworks(evmNetworks, networks),
        },
        events: {
          onAuthFlowOpen: () => console.log("Auth flow opened"),
          onAuthSuccess: () => console.log("Auth success"),
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </DynamicContextProvider>
  );
}
