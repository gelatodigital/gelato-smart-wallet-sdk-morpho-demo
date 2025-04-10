import { ExternalLink, Info, Layers } from "lucide-react";
import { chainConfig } from "@/app/blockchain/config";

interface ActivityLogProps {
  logs: {
    message: string | JSX.Element;
    timestamp: string;
    details?: {
      userOpHash?: string;
      txHash?: string;
      gasDetails?: {
        estimatedGas?: string;
        actualGas?: string;
        gasToken?: string;
      };
      isSponsored?: boolean;
    };
  }[];
  onShowDetails: (details: any) => void;
}

export default function ActivityLog({ logs, onShowDetails }: ActivityLogProps) {
  return (
    <div className="w-full flex flex-col p-4 bg-[#161616] border rounded-[12px] border-[#2A2A2A]">
      <div className="w-full flex items-center mb-4">
        <div className="flex-shrink-0 w-10 h-10 bg-[#252525] rounded mr-3 flex items-center justify-center">
          <Layers className="w-5 h-5 text-[#807872]" />
        </div>
        <h3 className="text-text-title text-md font-medium break-words">
          Activity Log
        </h3>
      </div>

      <div className="space-y-4">
        {logs.slice(-4).map((log, index) => (
          <div
            key={index}
            className="flex items-center gap-3 text-sm min-h-[32px]"
          >
            <div className="w-1 h-1 rounded-full bg-green-400" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 text-zinc-400">
                  <span className="truncate">
                    {typeof log.message === "string"
                      ? log.message
                      : log.message}
                  </span>
                </div>
                {log.details && (
                  <button
                    onClick={() => onShowDetails(log.details)}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                      log.details.txHash
                        ? "bg-green-500/10 hover:bg-green-500/20"
                        : "bg-yellow-500/10 hover:bg-yellow-500/20"
                    }`}
                  >
                    <Info
                      className={`w-4 h-4 ${
                        log.details.txHash
                          ? "text-green-500"
                          : "text-yellow-500"
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
