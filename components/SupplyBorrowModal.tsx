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
import { Contract, JsonRpcProvider } from "ethers";
import { marketParams, oracleABI } from "@/app/blockchain/config";

interface SupplyBorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (supplyAmount: string, borrowAmount: string) => void;
  borrowAmount: string;
}

export function SupplyBorrowModal({
  isOpen,
  onClose,
  onConfirm,
  borrowAmount,
}: SupplyBorrowModalProps) {
  const [requiredSupplyAmount, setRequiredSupplyAmount] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (isOpen && borrowAmount) {
      calculateRequiredSupply();
    }
  }, [isOpen, borrowAmount]);

  const calculateRequiredSupply = async () => {
    try {
      setIsCalculating(true);
      const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const oracleContract = new Contract(
        marketParams.oracle,
        oracleABI,
        provider
      );
      const price = await oracleContract.latestAnswer();

      // Format price with 2 decimal places
      const formattedPrice = (Number(price) / 1e8).toFixed(2);
      setCurrentPrice(formattedPrice);

      // Calculate required BTC amount based on borrow amount and price
      const requiredBTCAmount = (Number(borrowAmount) / Number(price)) * 1e8; // Convert price from 8 decimals
      setRequiredSupplyAmount(requiredBTCAmount.toFixed(8));
    } catch (error) {
      console.error("Error calculating required supply:", error);
      setRequiredSupplyAmount("Error calculating amount");
      setCurrentPrice("Error");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Required Supply Amount
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            To borrow {borrowAmount} USDC, you need to supply the following
            amount of cbBTC:
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
              <span className="text-sm">Current BTC Price:</span>
              <span className="text-sm">
                {isCalculating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{currentPrice}</span>
                    <span className="px-2 py-0.5 bg-zinc-700 rounded-full text-xs">
                      USD
                    </span>
                  </div>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
              <span className="text-sm">Required cbBTC:</span>
              <span className="text-sm">
                {isCalculating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{requiredSupplyAmount}</span>
                    <span className="px-2 py-0.5 bg-zinc-700 rounded-full text-xs">
                      cbBTC
                    </span>
                  </div>
                )}
              </span>
            </div>
          </div>

          <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <p className="text-xs text-zinc-400 leading-relaxed">
              This transaction will be processed in three sequential steps:
            </p>
            <ol className="text-xs text-zinc-400 leading-relaxed mt-1 ml-4 list-decimal">
              <li>Approval of collateral tokens (cbBTC)</li>
              <li>Supplying collateral to the market</li>
              <li>Borrowing loan tokens (USDC)</li>
            </ol>
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
            onClick={() => onConfirm(requiredSupplyAmount, borrowAmount)}
            disabled={isCalculating || !requiredSupplyAmount}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-purple-500/20"
          >
            {isCalculating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>calculating...</span>
              </>
            ) : (
              <>
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
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
