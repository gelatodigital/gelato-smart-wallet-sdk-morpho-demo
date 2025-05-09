"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { useGelatoSmartWalletProviderContext } from "@gelatonetwork/smartwallet-react-sdk";
import { useRouter } from "next/navigation";

interface Log {
  message: string;
  timestamp: string;
  details?: any;
}

interface ActivityLogContextType {
  logs: Log[];
  addLog: (log: Log | { message: string; details?: any }) => void;
  showDetails: (details: any) => void;
  clearLogs: () => void;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(
  undefined
);

const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds
const STORAGE_KEY = "activity_logs";

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [modalDetails, setModalDetails] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useGelatoSmartWalletProviderContext();
  const router = useRouter();

  // Load logs from localStorage on mount
  useEffect(() => {
    const storedLogs = localStorage.getItem(STORAGE_KEY);
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  // Handle user inactivity
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleInactivity, INACTIVITY_TIMEOUT);
    };

    const handleInactivity = async () => {
      await logout();
      clearLogs();
      router.push("/");
    };

    // Events to track user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [logout, router]);

  const addLog = (log: Log | { message: string; details?: any }) => {
    const newLog: Log = {
      message: log.message,
      timestamp: "timestamp" in log ? log.timestamp : new Date().toISOString(),
      details: log.details,
    };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem(STORAGE_KEY);
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
    <ActivityLogContext.Provider
      value={{ logs, addLog, showDetails, clearLogs }}
    >
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
