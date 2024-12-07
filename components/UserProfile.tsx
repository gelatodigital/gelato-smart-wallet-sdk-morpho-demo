import React, { useState } from 'react';
import {Key, Mail, User, ExternalLink, Wallet, CloudUpload} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from 'next/image';
import {chainConfig} from "@/app/blockchain/config";
import {shortenAddress} from "@/app/blockchain/utils";

interface UserData {
  name: string;
  email: string;
  image?: string;
  passkeys: string[];
}

interface UserProfileProps {
  user: UserData;
  address?: string;
  isDeployed?: boolean;
  onRegisterPasskey?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, address, isDeployed, onRegisterPasskey }) => {
  const [imageError, setImageError] = useState(false);

  const renderAvatar = () => {
    if (!user.image || imageError) {
      return (
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center ring-2 ring-zinc-700/50">
          <User className="w-8 h-8 text-zinc-400" />
        </div>
      );
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative w-16 h-16 lg:w-20 lg:h-20 cursor-pointer">
            <Image
              src={user.image}
              alt={user.name}
              fill
              className="rounded-full object-cover ring-2 ring-zinc-700/50 shadow-lg transition-transform duration-200 hover:scale-105"
              onError={() => setImageError(true)}
            />
          </div>
        </DialogTrigger>
        <DialogContent className="bg-[#0A0A0A] border border-[#1E293B] p-4 rounded-2xl w-[90vw] max-w-[500px]">
          <div className="relative w-full aspect-square">
            <Image
              src={user.image}
              alt={user.name}
              fill
              className="object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="pb-4 md:pb-0 w-full h-auto px-4 sm:px-0 flex items-center justify-center">
      <div className="w-full max-w-[1135px] bg-[#101010] rounded-lg p-4 sm:p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Profile Details</h2>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-lg bg-zinc-800/50">
            {renderAvatar()}

            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                <div className="flex flex-col gap-2 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CloudUpload className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {isDeployed ? "Deployed" : "Not Deployed"}
                    </span>
                  </div>

                  <a
                    href={chainConfig.blockExplorerUrl + 'address/' + address}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                  >
                    <Wallet className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      {address ? shortenAddress(address) : ""}
                    </span>
                    <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
