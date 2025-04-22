import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { chainConfig } from "@/app/blockchain/config";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userOpHash?: string;
  txHash?: string;
  gasDetails?: {
    estimatedGas: string;
    actualGas: string;
    gasToken: string;
  };
  isSponsored: boolean;
}

export function TransactionModal({
  isOpen,
  onClose,
  userOpHash,
  txHash,
  gasDetails,
  isSponsored,
}: TransactionModalProps) {
  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {userOpHash && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">User Operation Status</span>
              <a
                href={`https://relay.gelato.digital/tasks/status/${userOpHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-2 text-sm"
              >
                {truncateHash(userOpHash)}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {txHash && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Transaction</span>
              <a
                href={`https://base-sepolia.blockscout.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-2 text-sm"
              >
                {truncateHash(txHash)}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {!isSponsored && gasDetails && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Gas Details</span>
              <div className="text-sm space-y-1">
                <p>Estimated Gas: {gasDetails.estimatedGas}</p>
                {gasDetails.actualGas && (
                  <p>Actual Gas: {gasDetails.actualGas}</p>
                )}
              </div>
            </div>
          )}

          {isSponsored && (
            <div className="text-sm text-green-400">
              This transaction was sponsored via 1Balance
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
