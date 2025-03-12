import { Wallet2 } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="relative w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center px-4">
      <div
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          backgroundImage:
            "url('https://anichess.com/static/media/slower-lighter.125f83617d2db89bcc24.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative z-10 max-w-md text-center space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-full bg-gray-800/50 p-6">
            <Wallet2 className="w-12 h-12 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome to Gelato Demo
            </h2>
            <p className="text-gray-400">
              Experience seamless authentication using turnkey passkeys powered
              by Gelato AA
            </p>
          </div>
        </div>
        <div className="border border-gray-800 rounded-lg p-6 bg-black/50">
          <ul className="space-y-4 text-left">
            <li className="flex items-start gap-3">
              <span className="font-mono bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                1
              </span>
              <span className="text-gray-300">Get a smart contract wallet</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                2
              </span>
              <span className="text-gray-300">Claim tokens</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                3
              </span>
              <span className="text-gray-300">Stake tokens</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
