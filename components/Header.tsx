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

interface HeaderProps {
  isLoggedIn: boolean;
  onPasskeyLogin: () => void;
  onPasskeyRegister: () => void;
  addLog: (message: string) => void;
  walletAddress?: string;
  onSuccess?: any;
  handleLogout?: () => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  showSuccessModal: boolean;
  setShowSuccessModal: (value: boolean) => void;
  isRegistering?: boolean;
  isLoggingIn?: boolean;
}

export default function Header({
  isLoggedIn,
  onPasskeyRegister,
  onPasskeyLogin,
  addLog,
  walletAddress,
  onSuccess,
  handleLogout,
  open,
  setOpen,
  showSuccessModal,
  setShowSuccessModal,
  isRegistering = false,
  isLoggingIn = false,
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

  const renderLogos = () => (
    <div className="flex flex-col items-center justify-center w-full p-6">
      <div className="flex items-center justify-center gap-4">
        <a href="https://turnkey.com" target="_blank" rel="noopener noreferrer">
          <img
            src="/turnkey_image.png"
            alt="Turnkey Logo"
            className="w-24 h-6"
          />
        </a>
        <span className={styles.logoSeparator}>+</span>
        <a
          href="https://gelato.network"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/Gelato_white_.png"
            alt="Gelato Logo"
            className="w-24 h-7 pb-1"
          />
        </a>
      </div>
    </div>
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

      {!isLoggedIn && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTitle></DialogTitle>
          <DialogTrigger asChild>
            <Button className="text-white font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB]">
              Login
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0A] max-w-md border border-[#1E293B] p-0 rounded-2xl">
            {renderLogos()}

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 text-center">
                  Create a new wallet
                </h2>
                <div className="flex justify-center">
                  <button
                    onClick={onPasskeyRegister}
                    disabled={isRegistering}
                    className="text-white font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB] w-[210px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRegistering ? (
                      <>
                        <LoadingSpinner />
                        Creating...
                      </>
                    ) : (
                      "Create new wallet"
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-x-4">
                <div className="h-[1px] flex-1 bg-[#1E293B]"></div>
                <span className="text-sm text-gray-400">or</span>
                <div className="h-[1px] flex-1 bg-[#1E293B]"></div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white mb-4 text-center">
                  Already created your wallet? Log back in
                </h2>
                <div className="flex justify-center">
                  <button
                    onClick={onPasskeyLogin}
                    disabled={isLoggingIn}
                    className="text-white font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB] w-[210px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingIn ? (
                      <>
                        <LoadingSpinner />
                        Logging in...
                      </>
                    ) : (
                      "Login with Passkey"
                    )}
                  </button>
                </div>
              </div>

              <div className="hidden bg-[#1E293B]/50 backdrop-blur-sm rounded-xl p-4 flex items-start space-x-3 border border-[#1E293B]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#00AEFA] mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Before using Login with Passkey, you'll need to sign in with
                  Google and set up your passkeys.
                </p>
              </div>
            </div>

            <div className="border-t border-[#1E293B] p-4 flex items-center justify-center">
              <p className="text-xs text-center text-gray-400 flex items-center gap-x-1.5 margin-0">
                Powered by{" "}
                <img
                  src={"https://www.gelato.network/images/v2/gelato-text.svg"}
                  alt={"gelato logo"}
                  width={50}
                />
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {!isLoggedIn && showSuccessModal && (
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogTitle></DialogTitle>
          <DialogContent className="bg-[#0A0A0A] max-w-md border border-[#1E293B] p-0 rounded-2xl">
            {renderLogos()}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 text-center">
                Wallet created successfully. Login with Passkey.
              </h2>
              <div className="flex justify-center">
                <button
                  onClick={onPasskeyLogin}
                  disabled={isLoggingIn}
                  className="text-white font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB] w-[210px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <>
                      <LoadingSpinner />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </div>
            <div className="border-t border-[#1E293B] p-4 flex items-center justify-center">
              <p className="text-xs text-center text-gray-400 flex items-center gap-x-1.5 margin-0">
                Powered by{" "}
                <img
                  src={"https://www.gelato.network/images/v2/gelato-text.svg"}
                  alt={"gelato logo"}
                  width={50}
                />
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
