import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { shortenAddress } from "@/app/blockchain/utils";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { chainConfig } from "@/app/blockchain/config";

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
}: HeaderProps) {
  return (
    <header className="w-full bg-[#101010] py-4 px-8 flex justify-between items-center">
      <div className="flex flex-col md:flex-row gap-x-4 items-start md:items-center">
        <img
          src="/anichess.svg"
          alt="Anichess"
          className="w-[163px] h-[40px]"
        />
      </div>

      {!isLoggedIn && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="text-white font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB]">
              Login
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0A] max-w-md border border-[#1E293B] p-0 rounded-2xl">
            <div className="p-6 pb-0">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00AEFA] to-[#00CECB] bg-clip-text text-transparent">
                Login
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                <button
                  onClick={onPasskeyRegister}
                  className="text-white font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB] w-[210px]"
                >
                  Register Passkey
                </button>
              </div>

              <div className="flex items-center justify-center gap-x-4">
                <div className="h-[1px] flex-1 bg-[#1E293B]"></div>
                <span className="text-sm text-gray-400">or</span>
                <div className="h-[1px] flex-1 bg-[#1E293B]"></div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={onPasskeyLogin}
                  className="text-white font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB] w-[210px]"
                >
                  Login with Passkey
                </button>
              </div>

              <div className="bg-[#1E293B]/50 backdrop-blur-sm rounded-xl p-4 flex items-start space-x-3 border border-[#1E293B]">
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

      {isLoggedIn && (
        <div className="flex items-center gap-x-4">
          {walletAddress && (
            <a
              target="_blank"
              href={`${chainConfig.blockExplorerUrl}address/${walletAddress}`}
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
