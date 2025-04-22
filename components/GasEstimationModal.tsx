import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { parseEther, formatUnits, http, Address } from "viem";
import {
  createZeroDevPaymasterClient,
  getERC20PaymasterApproveCall,
} from "@zerodev/sdk";
import { getEntryPoint } from "@zerodev/sdk/constants";
import { zeroAddress } from "viem";
import {
  TOKEN_CONFIG,
  chainConfig,
  morphoABI,
  morphoAddress,
  marketParams,
  tokenABI,
  oracleABI,
} from "@/app/blockchain/config";
import { encodeFunctionData } from "viem";
import { ExternalLink } from "lucide-react";
import { entryPoint07Address } from "viem/account-abstraction";
import { Contract, ethers } from "ethers";
import { toast } from "sonner";
import { useTokenHoldings } from "@/lib/useFetchBalances";

interface GasEstimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (estimatedGas: string, borrowAmount: string) => void;
  kernelClient: any;
  gasToken: "USDC" | "WETH";
  accountAddress: string;
}

export function GasEstimationModal({
  isOpen,
  onClose,
  onConfirm,
  kernelClient,
  gasToken,
  accountAddress,
}: GasEstimationModalProps) {
  const [estimatedGas, setEstimatedGas] = useState<string>("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [requiredBTCAmount, setRequiredBTCAmount] = useState<string>("0");
  const [btcPrice, setBtcPrice] = useState("");
  const [borrowAmount, setBorrowAmount] = useState<string>();
  const [isCalculatingSupply, setIsCalculatingSupply] = useState(false);
  const { data: tokenHoldings, refetch: refetchTokenHoldings } =
    useTokenHoldings(accountAddress as Address);

  const fetchBtcPrice = async (borrowAmount: string) => {
    try {
      setIsCalculatingSupply(true);
      setBorrowAmount(borrowAmount);
      if (borrowAmount == "0" || borrowAmount == "") {
        setRequiredBTCAmount("");
        return;
      }
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const oracleContract = new Contract(
        marketParams.oracle,
        oracleABI,
        provider
      );
      const price = await oracleContract.latestAnswer();
      console.log(price);
      setBtcPrice(Number(price).toString());
      calculateRequiredBTCAmount(Number(price), borrowAmount);
    } catch (error) {
      console.error("Error fetching BTC price:", error);
    } finally {
      setIsCalculatingSupply(false);
    }
  };

  const calculateRequiredBTCAmount = (
    btcPrice: number,
    borrowAmount: string
  ) => {
    try {
      if (btcPrice > 0 && borrowAmount) {
        const calculatedAmount = (Number(borrowAmount) / btcPrice) * 1e8; // Convert price from 8 decimals
        setRequiredBTCAmount(calculatedAmount.toFixed(8));
      }
    } catch (error) {
      console.error("Error calculating required BTC amount:", error);
    }
  };

  const formatBalance = (value: string, decimals: number) => {
    try {
      return parseFloat(formatUnits(BigInt(value), decimals)).toLocaleString(
        undefined,
        {
          maximumFractionDigits: 4,
          minimumFractionDigits: 0,
        }
      );
    } catch (e) {
      return value;
    }
  };

  const estimateGasFee = async () => {
    try {
      setIsEstimating(true);
      const gasTokenAddress = TOKEN_CONFIG[gasToken].address;
      const entryPoint = getEntryPoint("0.7");
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const oracleContract = new Contract(
        marketParams.oracle,
        oracleABI,
        provider
      );
      const price = await oracleContract.latestAnswer();
      // Convert input amounts to proper decimal format
      // 8 decimals for cbBTC
      const borrowAmountInDecimals = BigInt(
        Math.floor(parseFloat(borrowAmount as string) * 1000000)
      ); // 6 decimals for USDC

      const requiredBTCAmount = (Number(borrowAmount) / Number(price)) * 1e8; // Convert price from 8 decimals

      const supplyAmountInDecimals = BigInt(
        Math.floor(parseFloat(requiredBTCAmount.toString()) * 100000000)
      );
      if (
        Number(tokenHoldings?.cbBTCBalance as string) <
        Number(requiredBTCAmount)
      ) {
        toast.error("Insufficient collateral balance, Mint Now !!");
        return;
      }

      // Encode the supply and borrow transaction data
      const supplyData = encodeFunctionData({
        abi: morphoABI,
        functionName: "supplyCollateral",
        args: [
          marketParams,
          supplyAmountInDecimals,
          kernelClient.account.address,
          "0x",
        ],
      });

      const borrowData = encodeFunctionData({
        abi: morphoABI,
        functionName: "borrow",
        args: [
          marketParams,
          borrowAmountInDecimals,
          BigInt(0),
          kernelClient.account.address,
          kernelClient.account.address,
        ],
      });

      // Encode transaction calls for gas estimation
      const callData = await kernelClient.account.encodeCalls([
        // Approve the paymaster to spend gas tokens
        await getERC20PaymasterApproveCall(kernelClient.paymaster, {
          gasToken: TOKEN_CONFIG[gasToken].address as `0x${string}`,
          approveAmount: parseEther("1"),
          entryPoint: getEntryPoint("0.7"),
        }),
        {
          to: marketParams.collateralToken as `0x${string}`,
          data: encodeFunctionData({
            abi: tokenABI,
            functionName: "approve",
            args: [morphoAddress, supplyAmountInDecimals],
          }),
        },
        {
          to: morphoAddress as `0x${string}`,
          value: BigInt(0),
          data: supplyData,
        },
        {
          to: morphoAddress as `0x${string}`,
          value: BigInt(0),
          data: borrowData,
        },
      ]);

      // Prepare the user operation with the encoded transaction calls
      const userOp = await kernelClient.prepareUserOperation({ callData });

      // Estimate the gas cost in ERC20 tokens using the paymaster client
      const result = await kernelClient.paymaster.estimateGasInERC20({
        userOperation: userOp,
        gasTokenAddress: gasTokenAddress,
        entryPoint: entryPoint07Address,
      });

      setEstimatedGas(
        `${formatBalance(
          result.amount.toString(),
          TOKEN_CONFIG[gasToken].decimals
        )} ${TOKEN_CONFIG[gasToken].symbol} tokens`
      );
    } catch (error) {
      console.error("Error estimating gas:", error);
      setEstimatedGas("Error estimating gas");
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        onClose();
        setBorrowAmount("");
        setRequiredBTCAmount("");
        setEstimatedGas("");
        setBtcPrice("");
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Gas Fee Estimation
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            This will estimate the gas fees for your supply and borrow
            transaction in {TOKEN_CONFIG[gasToken].symbol}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
              <span className="text-sm">Current BTC Price:</span>
              <span className="text-sm">
                {isCalculatingSupply ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>calculating...</span>
                  </div>
                ) : (
                  `$${(Number(btcPrice) / 1e8).toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
              <span className="text-sm">Estimated Gas:</span>
              <span className="text-sm">
                {isEstimating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{estimatedGas.split(" ")[0]}</span>
                    <span className="px-2 py-0.5 bg-zinc-700 rounded-full text-xs">
                      {TOKEN_CONFIG[gasToken].symbol}
                    </span>
                  </div>
                )}
              </span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
              <span className="text-sm">Supply Amount:</span>
              <span className="text-sm">
                {isCalculatingSupply ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{requiredBTCAmount}</span>
                    <span className="px-2 py-0.5 bg-zinc-700 rounded-full text-xs">
                      cbBTC
                    </span>
                  </div>
                )}
              </span>
            </div>

            {/* Borrow Amount Input Field */}
            <div className="relative">
              <input
                type="number"
                value={borrowAmount}
                onChange={(e) => fetchBtcPrice(e.target.value)}
                placeholder="Enter borrow amount"
                className="w-full py-3 px-4 bg-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                USDC
              </div>
            </div>
          </div>

          {/* Token Information Section */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Token Address:</span>
                <a
                  href={`https://eth-sepolia.blockscout.com/token/${TOKEN_CONFIG[gasToken].address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {TOKEN_CONFIG[gasToken].address.slice(0, 6)}...
                  {TOKEN_CONFIG[gasToken].address.slice(-4)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="pt-2">
                <a
                  href={`https://eth-sepolia.blockscout.com/address/${TOKEN_CONFIG[gasToken].address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Mint {TOKEN_CONFIG[gasToken].symbol} for your smart account
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <p className="text-xs text-zinc-400 leading-relaxed">
              This transaction will be processed in four sequential steps:
            </p>
            <ol className="text-xs text-zinc-400 leading-relaxed mt-1 ml-4 list-decimal">
              <li>Approval of USDC for Gas Payment</li>
              <li>Approval of collateral tokens (cbBTC)</li>
              <li>Supplying collateral to the market</li>
              <li>Borrowing loan tokens (USDC)</li>
            </ol>
          </div>
        </div>
        {/* Transaction Steps Explanation */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              setBorrowAmount("");
              setRequiredBTCAmount("");
              setEstimatedGas("");
              setBtcPrice("");
            }}
            className="text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700"
          >
            Cancel
          </Button>
          <Button
            onClick={estimateGasFee}
            disabled={isEstimating || !borrowAmount}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isEstimating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Estimating...</span>
              </>
            ) : (
              <>
                <span>Estimate Gas</span>
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              onConfirm(estimatedGas, borrowAmount as string);
              setBorrowAmount("");
              setRequiredBTCAmount("");
            }}
            disabled={!estimatedGas || isEstimating || !borrowAmount}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-purple-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
