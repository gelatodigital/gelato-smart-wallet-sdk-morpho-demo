import React, { useState } from "react";
import {
  Key,
  Mail,
  User,
  ExternalLink,
  Wallet,
  CloudUpload,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";
import { chainConfig } from "@/app/blockchain/config";
import { shortenAddress } from "@/app/blockchain/utils";

interface UserProfileProps {
  address?: string;
  isDeployed?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ address, isDeployed }) => {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="pb-4 md:pb-0 w-full h-auto px-4 sm:px-0 flex items-center justify-center mb-6">
      <div className="w-full max-w-[1135px] bg-[#18181B] rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Profile Details</h2>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-lg bg-[#27272A]">
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <div className="flex flex-col gap-2 text-gray-400">
                  <div className="flex items-center gap-2">
                    <CloudUpload className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {isDeployed ? "Deployed" : "Not Deployed"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 flex-shrink-0" />
                    <a
                      href={
                        chainConfig.blockExplorers.default.url +
                        "/address/" +
                        address
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span>{address ? shortenAddress(address) : ""}</span>
                      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                    </a>
                    <button
                      onClick={() => address && copyToClipboard(address)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <h3 className="text-sm font-medium text-zinc-400">
                Passkeys {user.passkeys.length > 0 && `(${user.passkeys.length})`}
              </h3>
              <button
                onClick={onRegisterPasskey}
                className="w-full sm:w-auto text-white font-bold duration-200 font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-[#00AEFA] to-[#00AEFA] hover:from-[#1093CD] hover:to-[#00CECB]"
              >
                Register a passkey
              </button>
            </div>
            {user.passkeys.length > 0 ? (
              <div className="grid gap-2">
                {user.passkeys.map((key, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="p-2 rounded-md bg-zinc-700/50 group-hover:bg-zinc-700 transition-colors duration-200">
                      <Key size={14} className="text-zinc-300" />
                    </div>
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors duration-200 break-all">
                      {key}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex flex-col items-center justify-center gap-2 rounded-lg bg-zinc-800/30 border border-zinc-800">
                <Key size={20} className="text-zinc-600" />
                <p className="text-sm text-zinc-600">No passkeys registered</p>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
