import { useQuery } from '@tanstack/react-query';

interface TokenData {
  address: string;
  circulating_market_cap: number | null;
  decimals: string;
  exchange_rate: number | null;
  holders: string;
  icon_url: string | null;
  name: string;
  symbol: string;
  total_supply: string;
  type: 'ERC-20' | 'ERC-721' | 'ERC-1155';
  volume_24h: number | null;
}

interface TokenHolding {
  token: TokenData;
  token_id: string | null;
  token_instance: any | null;
  value: string;
}

interface TokenHoldingsResponse {
  items: TokenHolding[];
  next_page_params: any | null;
}

export const useTokenHoldings = (address: string | undefined) => {
  return useQuery({
    queryKey: ['tokenHoldings', address],
    queryFn: async (): Promise<TokenHoldingsResponse> => {
      if (!address) throw new Error('Address is required');

      const response = await fetch(
        `https://arb-blueberry.gelatoscout.com/api/v2/addresses/${address}/tokens?type=ERC-20%2CERC-721%2CERC-1155`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch token holdings');
      }

      return response.json();
    },
    enabled: !!address,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
  });
};
