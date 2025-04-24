"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Layers } from "lucide-react";
import ActivityLog from "./ActivityLog";

interface ActivityLogBarProps {
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

export default function ActivityLogBar({
  logs,
  onShowDetails,
}: ActivityLogBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Get the most recent log for the collapsed view
  const mostRecentLog = logs.length > 0 ? logs[logs.length - 1] : null;

  // Update expanded height when content changes
  useEffect(() => {
    if (contentRef.current) {
      setExpandedHeight(contentRef.current.scrollHeight);
    }
  }, [logs]);

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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="bg-white border-t border-gray-200 rounded-t-[12px] shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded ? `${expandedHeight + 60}px` : "60px",
          transition: "max-height 0.3s ease-in-out",
        }}
      >
        <div className="container mx-auto">
          <div
            className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center">
                <Layers className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-gray-900 text-sm font-medium">
                  Activity Log
                </h3>
                {!isExpanded && mostRecentLog && (
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="truncate max-w-[200px]">
                      {typeof mostRecentLog.message === "string"
                        ? mostRecentLog.message
                        : "Activity"}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{formatTimeAgo(mostRecentLog.timestamp)}</span>
                  </div>
                )}
              </div>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600 transition-transform duration-300" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600 transition-transform duration-300" />
            )}
          </div>

          <div
            ref={contentRef}
            className="overflow-y-auto transition-opacity duration-300"
            style={{
              opacity: isExpanded ? 1 : 0,
              maxHeight: isExpanded ? "300px" : "0px",
              transition:
                "opacity 0.2s ease-in-out, max-height 0.3s ease-in-out",
            }}
          >
            <ActivityLog logs={logs} onShowDetails={onShowDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}
