"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";

interface Log {
  message: string;
  timestamp: string;
  details?: any;
}

interface ActivityLogContextType {
  logs: Log[];
  addLog: (log: Log | { message: string; details?: any }) => void;
  showDetails: (details: any) => void;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(
  undefined
);

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [modalDetails, setModalDetails] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addLog = (log: Log | { message: string; details?: any }) => {
    const newLog: Log = {
      message: log.message,
      timestamp: "timestamp" in log ? log.timestamp : new Date().toISOString(),
      details: log.details,
    };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  const showDetails = (details: any) => {
    setModalDetails(details);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalDetails(null);
  };

  return (
    <ActivityLogContext.Provider value={{ logs, addLog, showDetails }}>
      {children}
      <TransactionDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        details={modalDetails}
      />
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const context = useContext(ActivityLogContext);
  if (context === undefined) {
    throw new Error(
      "useActivityLog must be used within an ActivityLogProvider"
    );
  }
  return context;
}
