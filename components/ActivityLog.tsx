import { ExternalLink, Info, Layers } from "lucide-react";
import { chainConfig } from "@/app/blockchain/config";
import { useState, useEffect } from "react";

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

  const formatTimeAgo = (timestamp: string) => {
    try {
      const now = new Date().getTime();
      const past = new Date(timestamp).getTime();
      const diff = now - past;

      // Convert to minutes
      const minutes = Math.floor(diff / (1000 * 60));

      if (minutes < 1) return "just now";
      if (minutes === 1) return "1 minute ago";
      if (minutes < 60) return `${minutes} minutes ago`;

      // Convert to hours
      const hours = Math.floor(minutes / 60);
      if (hours === 1) return "1 hour ago";
      if (hours < 24) return `${hours} hours ago`;

      // Convert to days
      const days = Math.floor(hours / 24);
      if (days === 1) return "1 day ago";
      return `${days} days ago`;
    } catch (error) {
      return "";
    }
  };

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
        {recentLogs.map((log, index) => (
          <div key={index} className="relative pl-3">
            {/* Vertical line */}
            <div className="absolute left-0 top-0 h-full w-0.5 bg-green-500/20" />

            {/* Dot indicator */}
            <div className="absolute left-[-3px] top-2 w-[7px] h-[7px] rounded-full bg-green-500" />

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 truncate block flex-1 mr-4">
                      {typeof log.message === "string"
                        ? log.message
                        : log.message}
                    </span>
                    {log.details && (
                      <button
                        onClick={() => onShowDetails(log.details)}
                        className="flex-shrink-0 p-1.5 rounded-lg transition-colors bg-green-500/10 hover:bg-green-500/20"
                      >
                        <Info className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-zinc-500">
                {formatTimeAgo(log.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
