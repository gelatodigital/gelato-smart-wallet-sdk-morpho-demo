"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Copy, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GasDetails {
  estimatedGas?: string;
  actualGas?: string;
  gasToken?: string;
}

interface TransactionDetails {
  userOpHash?: string;
  txHash?: string;
  gasDetails?: GasDetails;
  isSponsored?: boolean;
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: TransactionDetails | null;
}

export default function TransactionDetailsModal({
  isOpen,
  onClose,
  details,
}: TransactionDetailsModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsCopied(false);
      setCopiedField(null);
    }
  }, [isOpen]);

  if (!details) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setCopiedField(field);
    toast.success("Copied to clipboard");

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
      setCopiedField(null);
    }, 2000);
  };

  const handleExplorerClick = (hash: string, isUserOp: boolean = false) => {
    // Use Gelato's relay for user operations and Base Sepolia Blockscout for transaction hashes
    const url = isUserOp
      ? `https://relay.gelato.digital/tasks/status/${hash}`
      : `https://base-sepolia.blockscout.com/tx/${hash}`;
    window.open(url, "_blank");
  };

  // Function to truncate hash for display
  const truncateHash = (hash: string) => {
    if (hash.length <= 10) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <Info className="w-4 h-4 text-gray-600" />
            </div>
            <span>Transaction Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {details.userOpHash && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">
                  User Operation Hash
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-gray-100"
                    onClick={() =>
                      handleCopy(details.userOpHash!, "userOpHash")
                    }
                  >
                    {isCopied && copiedField === "userOpHash" ? (
                      <Check className="h-3 w-3 text-black" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-gray-100"
                    onClick={() =>
                      handleExplorerClick(details.userOpHash!, true)
                    }
                  >
                    <ExternalLink className="h-3 w-3 text-gray-600" />
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-900 flex items-center justify-between border border-gray-200">
                <span>{truncateHash(details.userOpHash)}</span>
              </div>
            </div>
          )}

          {details.txHash && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">
                  Transaction Hash
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-gray-100"
                    onClick={() => handleCopy(details.txHash!, "txHash")}
                  >
                    {isCopied && copiedField === "txHash" ? (
                      <Check className="h-3 w-3 text-black" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-gray-100"
                    onClick={() => handleExplorerClick(details.txHash!)}
                  >
                    <ExternalLink className="h-3 w-3 text-gray-600" />
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-900 flex items-center justify-between border border-gray-200">
                <span>{truncateHash(details.txHash)}</span>
              </div>
            </div>
          )}

          {details.gasDetails && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Gas Details</h3>
              <div className="bg-gray-50 p-3 rounded space-y-2 border border-gray-200">
                {details.gasDetails.estimatedGas && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Estimated Gas</span>
                    <span className="text-xs text-gray-900">
                      {details.gasDetails.estimatedGas}
                    </span>
                  </div>
                )}
                {details.gasDetails.actualGas && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Actual Gas</span>
                    <span className="text-xs text-gray-900">
                      {details.gasDetails.actualGas}
                    </span>
                  </div>
                )}
                {details.gasDetails.gasToken && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Gas Token</span>
                    <span className="text-xs text-gray-900">
                      {details.gasDetails.gasToken}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {details.isSponsored !== undefined && (
            <div className="flex items-center justify-center p-2 bg-gray-50 rounded border border-gray-200">
              <span className="text-xs text-gray-900">
                {details.isSponsored
                  ? "Transaction was sponsored by Gelato's 1Balance"
                  : "Transaction was self-paid"}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
