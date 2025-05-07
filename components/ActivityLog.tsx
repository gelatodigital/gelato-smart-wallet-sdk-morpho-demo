import { ExternalLink, Info, Layers } from "lucide-react";
import { chainConfig } from "@/app/blockchain/config";
import { useState, useEffect } from "react";
import { formatTimeAgo } from "@/lib/utils";

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
  // Add state to trigger re-renders
  const [, setTimeUpdate] = useState(0);

  // Effect to update timestamps every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate((prev) => prev + 1);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Get the last 4 logs and reverse them to show the latest first
  const recentLogs = [...logs.slice(-4)].reverse();

  const handleShowDetails = (details: any) => {
    if (details && Object.keys(details).length > 0) {
      onShowDetails(details);
    }
  };

  return (
    <div className="w-full flex flex-col p-4 bg-white">
      <div className="space-y-4">
        {recentLogs.map((log, index) => (
          <div key={index} className="relative pl-3">
            {/* Vertical line */}
            <div className="absolute left-0 top-0 h-full w-0.5 bg-black/20" />

            {/* Dot indicator */}
            <div className="absolute left-[-3px] top-2 w-[7px] h-[7px] rounded-full bg-black" />

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 truncate block flex-1 mr-4">
                      {typeof log.message === "string"
                        ? log.message
                        : log.message}
                    </span>
                    {log.details && (
                      <button
                        onClick={() => handleShowDetails(log.details)}
                        className="flex-shrink-0 p-1.5 rounded-lg transition-colors bg-gray-100 hover:bg-gray-200"
                      >
                        <Info className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(log.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
