import React from "react";

export default function Header() {
  return (
    <header>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 max-w-xl">
          <h1 className="text-3xl font-bold text-white">Gelato</h1>
          <p className="text-zinc-400 text-sm">
            Explore EIP-7702 and Smart EOAs in this interactive playground.
            Build seamless transaction experience across any EVM chain — smart
            wallets, gasless flows, and full-stack infra, all from one
            dashboard.
          </p>
        </div>

        <div className="flex items-center">
          <div className="px-4 py-2 bg-[#202020] border border-[#2A2A2A] rounded-md text-sm font-mono text-gray-300">
            npm i wallet-kit
          </div>
        </div>
      </div>
    </header>
  );
}
