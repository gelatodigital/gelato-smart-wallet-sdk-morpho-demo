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
import { TOKEN_CONFIG, chainConfig } from "@/app/blockchain/config";
import { tokenDetails } from "@/app/blockchain/config";
import { encodeFunctionData } from "viem";
import { ExternalLink } from "lucide-react";
import { entryPoint07Address } from "viem/account-abstraction";

interface GasEstimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (estimatedGas: string) => void;
  kernelClient: any;
  gasToken: "USDC" | "WETH";
  tokenBalance: string;
  pendingAction: "drop" | "stake";
}

export function GasEstimationModal({
  isOpen,
  onClose,
  onConfirm,
  kernelClient,
  gasToken,
  tokenBalance,
  pendingAction,
}: GasEstimationModalProps) {
  const [estimatedGas, setEstimatedGas] = useState<string>("");
  const [isEstimating, setIsEstimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEstimatedGas("");
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

      // Encode the actual transaction data
      const data = encodeFunctionData({
        abi: tokenDetails.abi,
        functionName: pendingAction === "drop" ? "drop" : "stake",
        args: [],
      });

      // Encode transaction calls for gas estimation
      const callData = await kernelClient.account.encodeCalls([
        // Approve the paymaster to spend gas tokens
        await getERC20PaymasterApproveCall(kernelClient.paymaster, {
          gasToken: gasTokenAddress as `0x${string}`,
          approveAmount: parseEther("1"),
          entryPoint,
        }),
        {
          to: tokenDetails.address as `0x${string}`,
          value: BigInt(0),
          data,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gas Fee Estimation</DialogTitle>
          <DialogDescription>
            This will estimate the gas fees for your {pendingAction} transaction
            in {TOKEN_CONFIG[gasToken].symbol}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Your Balance:</span>
            <span className="text-sm">
              {formatBalance(tokenBalance, TOKEN_CONFIG[gasToken].decimals)}{" "}
              {TOKEN_CONFIG[gasToken].symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Estimated Gas:</span>
            <span className="text-sm">
              {isEstimating ? "Estimating..." : estimatedGas}
            </span>
          </div>

          {/* Token Information Section */}
          <div className="mt-4 space-y-3">
            <div className="bg-zinc-900/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-zinc-400">
                Token Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">USDC Address:</span>
                  <a
                    href={`${chainConfig.blockExplorers.default.url}/token/${TOKEN_CONFIG.USDC.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00AEFA] hover:text-[#1093CD] flex items-center gap-1"
                  >
                    {TOKEN_CONFIG.USDC.address.slice(0, 6)}...
                    {TOKEN_CONFIG.USDC.address.slice(-4)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">WETH Address:</span>
                  <a
                    href={`${chainConfig.blockExplorers.default.url}/token/${TOKEN_CONFIG.WETH.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00AEFA] hover:text-[#1093CD] flex items-center gap-1"
                  >
                    {TOKEN_CONFIG.WETH.address.slice(0, 6)}...
                    {TOKEN_CONFIG.WETH.address.slice(-4)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="pt-2">
                  {gasToken === "USDC" ? (
                    <a
                      href="https://faucet.circle.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#00AEFA] hover:text-[#1093CD] flex items-center gap-1"
                    >
                      Get 10 USDC from Circle Faucet
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <a
                      href={`${chainConfig.blockExplorers.default.url}/address/${TOKEN_CONFIG[gasToken].address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#00AEFA] hover:text-[#1093CD] flex items-center gap-1"
                    >
                      Mint {TOKEN_CONFIG[gasToken].symbol} for your smart
                      account
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
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
            disabled={isEstimating}
            className="text-white text-sm font-bold duration-200 font-semibold px-8 py-3
              rounded-xl bg-gradient-to-r from-[#00AEFA] to-[#00AEFA]
              hover:from-[#1093CD] hover:to-[#00CECB]
              transform transition-all hover:scale-[1.02]
              shadow-lg hover:shadow-[#00AEFA]/25
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEstimating ? "Estimating..." : "Estimate Gas"}
          </Button>
          <Button
            onClick={() => onConfirm(estimatedGas)}
            disabled={!estimatedGas || isEstimating}
            className="text-white text-sm font-bold duration-200 font-semibold px-8 py-3
              rounded-xl bg-gradient-to-r from-[#00AEFA] to-[#00AEFA]
              hover:from-[#1093CD] hover:to-[#00CECB]
              transform transition-all hover:scale-[1.02]
              shadow-lg hover:shadow-[#00AEFA]/25
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
