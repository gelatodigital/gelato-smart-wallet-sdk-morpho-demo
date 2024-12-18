import { useQuery } from '@tanstack/react-query';
import { chainConfig, tokenDetails } from "@/app/blockchain/config";
import { Contract, JsonRpcProvider } from 'ethers';


interface TokenHoldingsResponse {
 tokens:number
 stakedTimeString:string
 sec:number
}

export const useTokenHoldings = (address: string | undefined) => {
  return useQuery({
    queryKey: ['tokenHoldings', address],
    queryFn: async (): Promise<TokenHoldingsResponse> => {
      if (!address) throw new Error('Address is required');

      const provider = new JsonRpcProvider(chainConfig.rpcUrls.default.http[0])
      const droppStakeContract = new Contract(tokenDetails.address, tokenDetails.abi,provider)
      const tokens = +(await droppStakeContract.balanceOf(address)).toString();
      const stakedTimestamp = +(await droppStakeContract.staked(address)).toString() * 1000
      const stakedTimeString =  stakedTimestamp == 0 ? "Not Staked" : new Date(stakedTimestamp).toLocaleTimeString()
      let now = Date.now()

      let sec = stakedTimestamp == 0 ? 0 : Math.floor((now - stakedTimestamp)/1000) 


      return { 
        tokens,
        stakedTimeString,
        sec
      }
    },
    enabled: !!address,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
  });
};
