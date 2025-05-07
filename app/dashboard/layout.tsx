"use client";

import { useActivityLog } from "@/contexts/ActivityLogContext";
import ActivityLogBar from "@/components/ActivityLogBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logs, showDetails } = useActivityLog();

  return (
    <>
      {children}
      <ActivityLogBar logs={logs} onShowDetails={showDetails} />
    </>
  );
}
