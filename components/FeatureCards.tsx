import { Shield } from "lucide-react";
import React from "react";

export default function FeatureCards() {
  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Complete Wallet Stack */}
      <div className="w-full flex flex-col min-h-[260px] p-4 bg-[#161616] border rounded-[12px] border-[#2A2A2A]">
        <div className="w-full flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-[#252525] rounded mr-3 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#807872] rounded-md flex items-center justify-center">
              <div className="w-2.5 h-2.5 border-2 border-[#807872]"></div>
            </div>
          </div>
          <h3 className="text-text-title text-md font-medium break-words">
            Complete Wallet Stack
          </h3>
        </div>
        <p className="text-text-tertiary text-sm flex-grow break-words mb-4">
          Gelato smart contracts + Wallet Kit SDK. Build and deploy
          production-ready smart wallets on any EVM chain.
        </p>
      </div>

      {/* High-Performance Gas Stack */}
      <div className="w-full flex flex-col min-h-[260px] p-4 bg-[#161616] border rounded-[12px] border-[#2A2A2A]">
        <div className="w-full flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-[#252525] rounded mr-3 flex items-center justify-center">
            <div className="w-5 h-5 flex flex-col">
              <div className="flex mb-1">
                <div className="w-1.5 h-1.5 bg-[#807872] mr-1"></div>
                <div className="w-1.5 h-1.5 bg-[#807872]"></div>
              </div>
              <div className="flex">
                <div className="w-1.5 h-1.5 bg-[#807872] mr-1"></div>
                <div className="w-1.5 h-1.5 bg-[#807872]"></div>
              </div>
            </div>
          </div>
          <h3 className="text-text-title text-md font-medium break-words">
            High-Performance Gas Stack
          </h3>
        </div>
        <p className="text-text-tertiary text-sm flex-grow break-words mb-4">
          Gelato Bundler and Paymaster, engineered for ultra-low latency and gas
          efficiency. Scale confidently without compromising on speed or cost.
        </p>
      </div>

      {/* Wallet-as-a-Service */}
      <div className="w-full flex flex-col min-h-[260px] p-4 bg-[#161616] border rounded-[12px] border-[#2A2A2A]">
        <div className="w-full flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-[#252525] rounded mr-3 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#807872]" />
          </div>
          <h3 className="text-text-title text-md font-medium break-words">
            Wallet-as-a-Service
          </h3>
        </div>
        <p className="text-text-tertiary text-sm flex-grow break-words mb-4">
          Embedded wallet experience, powered by Dynamic. Fully integrated,
          seamless onboarding for your users.
        </p>
      </div>

      {/* Enterprise Ready */}
      <div className="w-full flex flex-col min-h-[260px] p-4 bg-[#161616] border rounded-[12px] border-[#2A2A2A]">
        <div className="w-full flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-[#252525] rounded mr-3 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#807872]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" />
            </svg>
          </div>
          <h3 className="text-text-title text-md font-medium break-words">
            Enterprise Ready
          </h3>
        </div>
        <p className="text-text-tertiary text-sm flex-grow break-words mb-4">
          Manage everything — contracts, SDK, paymaster, bundler, and wallet
          service, from a single dashboard. SOC2 compliant and production-ready.
        </p>
      </div>
    </div>
  );
}
