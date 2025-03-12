import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { shortenAddress } from "@/app/blockchain/utils";
import { chainConfig } from "@/app/blockchain/config";
import Image from "next/image";
import styles from "@/app/index.module.css";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

interface HeaderProps {
  isLoggedIn: boolean;
  addLog: (message: string) => void;
  walletAddress?: string;
  handleLogout?: () => void;
}

export default function Header({
  isLoggedIn,
  addLog,
  walletAddress,
  handleLogout,
}: HeaderProps) {
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <header className="w-full bg-[#101010] py-4 px-8 flex justify-between items-center">
      <div className="flex flex-col md:flex-row gap-x-4 items-start md:items-center">
        <img src="/logo.png" className="h-10 w-10 ml-5 -mr-12" alt="Logo" />
        <img
          src="https://www.gelato.network/images/v2/gelato-text.svg"
          alt="Gelato logo"
          className="w-[163px] h-[25px]"
        />
      </div>

      {!isLoggedIn && <DynamicWidget />}

      {isLoggedIn && (
        <div className="flex items-center gap-x-4">
          {walletAddress && (
            <a
              target="_blank"
              href={`${chainConfig.blockExplorers.default.url}/address/${walletAddress}`}
              className="text-white hover:text-[#00AFFA]/80 transition-colors duration-200"
            >
              {shortenAddress(walletAddress)}
            </a>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="bg-white/10 p-2 rounded"
          >
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
