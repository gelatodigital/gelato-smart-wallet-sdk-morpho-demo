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
import { parseEther, formatUnits, http } from "viem";
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
} from "@/app/blockchain/config";
import { encodeFunctionData } from "viem";
import { ExternalLink } from "lucide-react";
import { entryPoint07Address } from "viem/account-abstraction";

interface GasEstimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    estimatedGas: string,
    supplyAmount: string,
    borrowAmount: string
  ) => void;
  kernelClient: any;
  gasToken: "USDC" | "WETH";
  tokenBalance: string;
}

export function GasEstimationModal({
  isOpen,
  onClose,
  onConfirm,
  kernelClient,
  gasToken,
  tokenBalance,
}: GasEstimationModalProps) {
  const [estimatedGas, setEstimatedGas] = useState<string>("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [supplyAmount, setSupplyAmount] = useState<string>("");
  const [borrowAmount, setBorrowAmount] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setEstimatedGas("");
      setSupplyAmount("");
      setBorrowAmount("");
    }
  }, [isOpen]);

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

      // Convert input amounts to proper decimal format
      const supplyAmountInDecimals = BigInt(
        Math.floor(parseFloat(supplyAmount) * 100000000)
      ); // 8 decimals for cbBTC
      const borrowAmountInDecimals = BigInt(
        Math.floor(parseFloat(borrowAmount) * 1000000)
      ); // 6 decimals for USDC

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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
            <span className="text-sm font-medium">Estimated Gas:</span>
            <span className="text-sm">
              {isEstimating ? "Estimating..." : estimatedGas}
            </span>
          </div>

          {/* Supply and Borrow Input Fields */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                value={supplyAmount}
                onChange={(e) => setSupplyAmount(e.target.value)}
                placeholder="Supply amount"
                className="w-full py-3 px-4 bg-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
                step="0.00000001"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                cbBTC
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                placeholder="Borrow amount"
                className="w-full py-3 px-4 bg-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
                step="0.000001"
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
                  href={`${chainConfig.blockExplorers.default.url}/token/${TOKEN_CONFIG[gasToken].address}`}
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
                {gasToken === "USDC" ? (
                  <a
                    href="https://faucet.circle.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Get 10 USDC from Circle Faucet
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <a
                    href={`${chainConfig.blockExplorers.default.url}/address/${TOKEN_CONFIG[gasToken].address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Mint {TOKEN_CONFIG[gasToken].symbol} for your smart account
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700"
          >
            Cancel
          </Button>
          <Button
            onClick={estimateGasFee}
            disabled={isEstimating || !supplyAmount || !borrowAmount}
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
            onClick={() => onConfirm(estimatedGas, supplyAmount, borrowAmount)}
            disabled={
              !estimatedGas || isEstimating || !supplyAmount || !borrowAmount
            }
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
