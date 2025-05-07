"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bitcoin,
  Loader2,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  useGelatoSmartWalletProviderContext,
  GelatoSmartWalletConnectButton,
} from "@gelatonetwork/smartwallet-react-sdk";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  // 7702 configuration
  const {
    gelato: { client },
    logout,
  } = useGelatoSmartWalletProviderContext();

  useEffect(() => {
    async function createAccount() {
      if (client) {
        try {
          setIsInitializing(true);
          router.push("/dashboard");
        } catch (error) {
          console.error("Failed to create smart wallet client:", error);
          toast.error("Failed to initialize wallet");
        } finally {
          setIsInitializing(false);
        }
      }
    }
    createAccount();
  }, [client]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-white to-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                The DeFi platform for{" "}
                <span className="text-blue-600">everyone</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Borrow against your crypto or earn interest on your stablecoins
                with Morpho's secure, transparent, and efficient DeFi protocol.
              </p>

              {isInitializing ? (
                <Button
                  disabled
                  className="h-14 px-10 text-lg bg-black hover:bg-gray-800 text-white"
                >
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </Button>
              ) : (
                <GelatoSmartWalletConnectButton>
                  <div className="flex items-center justify-center h-12 px-8 text-lg rounded-md bg-black hover:bg-gray-800 text-white">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                </GelatoSmartWalletConnectButton>
              )}
            </div>
          </div>

          {/* Decorative elements */}
          <div
            className="absolute -bottom-1 left-0 right-0 h-20 bg-white"
            style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 100%)" }}
          ></div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Borrow Feature */}
              <div className="order-2 md:order-1">
                <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <Image
                    src="/bitcoin.svg"
                    alt="cbBTC"
                    width={50}
                    height={50}
                  />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  Borrow against your Bitcoin
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Access liquidity without selling your crypto. Use your BTC as
                  collateral to borrow USDC with competitive rates and flexible
                  terms.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span>
                      Keep your Bitcoin exposure while accessing liquidity
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span>Transparent terms with no hidden fees</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span>Competitive variable interest rates</span>
                  </li>
                </ul>
              </div>

              {/* Borrow Illustration */}
              <div className="order-1 md:order-2 bg-gray-100 rounded-xl p-8 h-80 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -left-6 -top-6 bg-orange-100 rounded-full p-2">
                    <Image
                      src="/bitcoin.svg"
                      alt="cbBTC"
                      width={50}
                      height={50}
                    />
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 w-64">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold">50%</div>
                      <div className="text-gray-500">Loan-to-Value</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Collateral</span>
                        <span className="font-medium">1 BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Borrow</span>
                        <span className="font-medium">10,000 USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest</span>
                        <span className="font-medium">4.98% APR</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 bg-blue-100 rounded-full p-2">
                    <Image src="/usdc.svg" alt="USDC" width={40} height={40} />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-200 my-20"></div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Earn Illustration */}
              <div className="bg-gray-100 rounded-xl p-8 h-80 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -left-6 -top-6 bg-blue-100 rounded-full p-2">
                    <Image src="/usdc.svg" alt="USDC" width={40} height={40} />
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 w-64">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold">3.21%</div>
                      <div className="text-gray-500">Annual Yield</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Supply</span>
                        <span className="font-medium">10,000 USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">1 Year</span>
                        <span className="font-medium">+321 USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Utilization</span>
                        <span className="font-medium">78%</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 bg-green-100 rounded-full p-4">
                    <TrendingUp className="h-10 w-10 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Earn Feature */}
              <div>
                <div className="bg-blue-50 p-6 rounded-full inline-flex mb-6">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  Earn interest on your USDC
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Put your stablecoins to work. Supply USDC to the Morpho
                  protocol and earn competitive yields with minimal risk.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span>Earn passive income on your stablecoins</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span>Withdraw anytime with no lock-up period</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span>
                      Competitive rates compared to traditional finance
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-black text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of users already using Morpho to borrow and earn.
            </p>

            {isInitializing ? (
              <Button
                disabled
                className="h-14 px-10 text-lg bg-white hover:bg-gray-100 text-black"
              >
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </Button>
            ) : (
              <GelatoSmartWalletConnectButton>
                <div className="flex items-center justify-center h-12 px-8 text-lg rounded-md bg-black hover:bg-gray-800 text-white">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </GelatoSmartWalletConnectButton>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
