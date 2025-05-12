"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bitcoin,
  Code,
  Coins,
  Loader2,
  Shield,
  TrendingUp,
  Wallet,
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
                Experience <span className="text-blue-600">EIP-7702</span> in
                Action
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Try our DeFi demo powered by Gelato's Smart Wallet SDK. Borrow
                against your crypto or earn interest with seamless gas
                abstraction and smart account features.
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
          </div>

          {/* Decorative elements */}
          <div
            className="absolute -bottom-1 left-0 right-0 h-20 bg-white"
            style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 100%)" }}
          ></div>
        </section>

        {/* SDK Overview Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Powered by Gelato's Smart Wallet SDK
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                This demo showcases how Gelato's SDK transforms existing wallets
                into smart accounts with advanced features
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="bg-blue-50 p-4 rounded-full inline-flex mb-6">
                  <Code className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Upgrades</h3>
                <p className="text-gray-600">
                  Existing wallets are upgraded to smart accounts seamlessly
                  with EIP-7702 support.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="bg-blue-50 p-4 rounded-full inline-flex mb-6">
                  <Coins className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gas Abstraction</h3>
                <p className="text-gray-600">
                  Pay gas fees with USDC or other tokens instead of native ETH
                  across any chain.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="bg-blue-50 p-4 rounded-full inline-flex mb-6">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Advanced Security</h3>
                <p className="text-gray-600">
                  Built-in social recovery, spending limits, MFA, and session
                  management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Demo Features</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the power of smart wallets through our DeFi
                application
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Borrow Feature */}
              <div className="order-2 md:order-1">
                <div className="bg-orange-50 p-2 rounded-full inline-flex mb-6">
                  <Image
                    src="/bitcoin.svg"
                    alt="Bitcoin"
                    width={55}
                    height={55}
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
                    <span>Pay gas fees in USDC instead of ETH</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span>Smart account security protects your collateral</span>
                  </li>
                </ul>
              </div>

              {/* Borrow Illustration */}
              <div className="order-1 md:order-2 bg-gray-100 rounded-xl p-8 h-80 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -left-6 -top-6 bg-orange-100 rounded-full p-2">
                    <Image
                      src="/bitcoin.svg"
                      alt="Bitcoin"
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
                        <span className="text-gray-600">Gas Paid In</span>
                        <span className="font-medium">USDC</span>
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
                    <span>Gas abstraction for seamless transactions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SDK Technical Features */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Smart Wallet SDK Features
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The technology powering this demo can transform any wallet into
                a smart account
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Gas Abstraction Feature */}
              <div className="order-2 md:order-1">
                <div className="bg-blue-50 p-6 rounded-full inline-flex mb-6">
                  <Coins className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Gas Abstraction</h2>
                <p className="text-gray-600 text-lg mb-6">
                  Flexible gas sponsorship and ERC-20 payments from any EVM
                  chain. Remove the friction of gas fees from your user
                  experience.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span>Pay gas fees with any ERC-20 token</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span>Sponsor gas fees for your users</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span>Cross-chain gas payments with consistent UX</span>
                  </li>
                </ul>
              </div>

              {/* Gas Abstraction Illustration */}
              <div className="order-1 md:order-2 bg-gray-100 rounded-xl p-8 h-80 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -left-6 -top-6 bg-blue-100 rounded-full p-4">
                    <Coins className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 w-64">
                    <div className="text-center mb-4">
                      <div className="text-xl font-bold">Gas Options</div>
                      <div className="text-gray-500">
                        Choose how to pay for gas
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border border-blue-200 bg-blue-50 rounded-md">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <Image
                              src="/gelato.png"
                              alt="Gelato"
                              width={20}
                              height={20}
                            />
                          </div>
                          <span>Sponsored</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <Image
                              src="/weth.svg"
                              alt="ETH"
                              width={20}
                              height={20}
                            />
                          </div>
                          <span>Ethereum</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Image
                              src="/usdc.svg"
                              alt="USDC"
                              width={20}
                              height={20}
                            />
                          </div>
                          <span>USDC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-200 my-20"></div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Embedded Wallets Illustration */}
              <div className="bg-gray-100 rounded-xl p-8 h-80 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -left-6 -top-6 bg-blue-100 rounded-full p-4">
                    <Wallet className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 w-64">
                    <div className="text-center mb-4">
                      <div className="text-xl font-bold">Create Wallet</div>
                      <div className="text-gray-500">
                        Choose your login method
                      </div>
                    </div>
                    <div className="space-y-3">
                      <button className="w-full py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50">
                        <svg
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                          fill="#4285F4"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </button>
                      <button className="w-full py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50">
                        <svg
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                          fill="#1877F2"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </button>
                      <button className="w-full py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50">
                        <svg
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="2" y="4" width="20" height="16" rx="3" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Wallets Feature */}
              <div>
                <div className="bg-blue-50 p-6 rounded-full inline-flex mb-6">
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Embedded Wallets</h2>
                <p className="text-gray-600 text-lg mb-6">
                  Allow users to easily create new wallets in a single click
                  with familiar login methods like email, phone, or social
                  accounts.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span>
                      Seamless onboarding with familiar authentication
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span>Built-in social recovery options</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-green-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span>
                      Multi-factor authentication for enhanced security
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Reliability Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Proven Reliability & Performance
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Gelato's Smart Wallet SDK is trusted by industry leaders with
                years of production experience
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">4+</div>
                <p className="text-gray-600">
                  Years in production with 99.99% uptime
                </p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  $600M+
                </div>
                <p className="text-gray-600">
                  Total value locked across Gelato Chains
                </p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  500+
                </div>
                <p className="text-gray-600">
                  Applications using Gelato Web3 Services
                </p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                <p className="text-gray-600">Rollups deployed and supported</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-black text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Experience the future of DeFi
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Try our demo powered by Gelato's Smart Wallet SDK with EIP-7702
              support
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
                <div className="flex items-center justify-center h-12 px-8 text-lg rounded-md bg-white hover:bg-gray-800 text-black">
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
