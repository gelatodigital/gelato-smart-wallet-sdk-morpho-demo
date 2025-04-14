import React from "react";

export default function Header() {
  return (
    <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <div className="flex items-center mb-3">
          <h1 className="text-3xl font-bold text-white">Gelato</h1>
        </div>
        <p className="text-sm text-text-tertiary max-w-xl">
          Explore EIP-7702 and Smart EOAs in this interactive playground.<br/> Build seamless transaction experience across any EVM chain — smart wallets, gasless flows, and full-stack infra, all from one dashboard.
        </p>
      </div>
      <div className="flex items-center mt-4 md:mt-0">
        <div className="px-4 py-2 bg-[#202020] border border-[#2A2A2A] rounded-md text-sm font-mono text-gray-300">
          npm i wallet-kit
        </div>
      </div>
    </header>
  );
}
