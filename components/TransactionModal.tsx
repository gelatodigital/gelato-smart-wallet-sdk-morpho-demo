"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Home } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  requiredBtc: string;
  status: "loading" | "success" | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  amount,
  requiredBtc,
  status,
}: TransactionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="flex flex-col items-center text-center">
          {status === "loading" ? (
            <>
              <div className="mb-4 p-4 rounded-full bg-blue-100">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Processing Transaction
              </h2>
              <p className="text-gray-600 mb-6">
                Please wait while we process your transaction. This may take a
                few moments.
              </p>
            </>
          ) : status === "success" ? (
            <>
              <div className="mb-4 p-4 rounded-full bg-green-100">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Transaction Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your loan has been successfully processed. You have borrowed{" "}
                {amount} USDC using {requiredBtc} BTC as collateral.
              </p>
              <Button
                onClick={onClose}
                className="w-full bg-black hover:bg-gray-800 text-white flex items-center justify-center"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
