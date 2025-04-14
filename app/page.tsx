"use client";

import { useCallback, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "../components/Header";
import WalletCard from "@/components/WalletCard";
import FeatureCards from "../components/FeatureCards";
import ActivityLog from "../components/ActivityLog";
import {
  createKernelAccountClient,
  getUserOperationGasPrice,
  createZeroDevPaymasterClient,
  getERC20PaymasterApproveCall,
} from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import {
  encodeFunctionData,
  parseEther,
  formatUnits,
  zeroAddress,
  createPublicClient,
} from "viem";
import { http } from "wagmi";
import UserProfile from "@/components/UserProfile";
import { Contract, JsonRpcProvider } from "ethers";
import { EmptyState } from "@/components/EmptyState";
import { chainConfig, TOKEN_CONFIG, tokenDetails } from "./blockchain/config";
import { Toaster, toast } from "sonner";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { GasEstimationModal } from "@/components/GasEstimationModal";
import { useTokenHoldings } from "@/lib/useFetchBalances";
import { Address, Log } from "viem";
import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";
import { useQuery } from "@tanstack/react-query";
import { TransactionModal } from "@/components/TransactionModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";

interface HomeProps {}

// Gas configuration for Gelato Bundler
type GasPrices = {
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
};

type EthGetUserOperationGasPriceRpc = {
  ReturnType: GasPrices;
  Parameters: [];
};

let CHAIN = chainConfig;
const GELATO_API_KEY = process.env.NEXT_PUBLIC_GELATO_API_KEY!;

const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

// Create a memoized deployment check function
const checkIsDeployed = async (address: string) => {
  try {
    const code = await provider.getCode(address);
    return code !== "0x";
  } catch (error) {
    console.error("Error checking deployment status:", error);
    return false;
  }
};

export default function Home({}: HomeProps) {
  const [accountAddress, setAccountAddress] = useState("");
  const [isKernelClientReady, setIsKernelClientReady] = useState(false);
  const [userOpHash, setUserOpHash] = useState("");
  const [kernelAccount, setKernelAccount] = useState<any>(null);
  const [kernelClient, setKernelClient] = useState<any>(null);
  const [logs, setLogs] = useState<
    {
      message: string | JSX.Element;
      timestamp: string;
      details?: {
        userOpHash?: string;
        txHash?: string;
        gasDetails?: {
          estimatedGas?: string;
          actualGas?: string;
          gasToken?: string;
        };
        isSponsored?: boolean;
      };
    }[]
  >([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [gasPaymentMethod, setGasPaymentMethod] = useState<
    "sponsored" | "erc20"
  >("sponsored");
  const [gasToken, setGasToken] = useState<"USDC" | "WETH">("USDC");

  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [showGasEstimation, setShowGasEstimation] = useState(false);
  const [pendingAction, setPendingAction] = useState<"drop" | null>(null);
  const [tokenBalance, setTokenBalance] = useState<any>("0");
  const [isCopied, setIsCopied] = useState(false);
  const [isTransactionProcessing, setIsTransactionProcessing] = useState(false);
  const [showTokenSelection, setShowTokenSelection] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState<string>("");

  const [transactionDetails, setTransactionDetails] = useState<{
    isOpen: boolean;
    userOpHash?: string;
    txHash?: string;
    gasDetails?: {
      estimatedGas: string;
      actualGas: string;
      gasToken: string;
    };
    isSponsored: boolean;
  }>({
    isOpen: false,
    isSponsored: true,
  });

  // 7702 configuration
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const connector: any = primaryWallet?.connector;
  const params = {
    withSponsorship: true,
  };
  let client: any;
  if (isZeroDevConnector(connector)) {
    client = connector?.getAccountAbstractionProvider(params);
  }

  const { data: tokenHoldings, refetch: refetchTokenHoldings } =
    useTokenHoldings(accountAddress as Address, gasToken);
  // Use React Query for deployment status
  const { data: isDeployed } = useQuery({
    queryKey: ["isDeployed", accountAddress],
    queryFn: () => checkIsDeployed(accountAddress),
    enabled: !!accountAddress,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  const createSponsoredKernelClient = async () => {
    const kernelClient = createKernelAccountClient({
      account: client.account,
      chain: CHAIN,
      bundlerTransport: http(
        `https://api.gelato.digital/bundlers/${CHAIN.id}/rpc?sponsorApiKey=${GELATO_API_KEY}`
      ),
      userOperation: {
        estimateFeesPerGas: async ({ bundlerClient }) => {
          return getUserOperationGasPrice(bundlerClient);
        },
      },
    });

    setUser(kernelClient.account.address);
    setKernelAccount(kernelClient.account);
    setAccountAddress(kernelClient.account.address);
    checkIsDeployed(kernelClient.account.address);
    setKernelClient(kernelClient);
    setIsKernelClientReady(true);
    return kernelClient;
  };

  const createERC20KernelClient = async (gasToken: "USDC" | "WETH") => {
    const gasTokenAddress = TOKEN_CONFIG[gasToken].address;

    // Create a ZeroDev Paymaster client for gas sponsorship
    const paymasterClient: any = createZeroDevPaymasterClient({
      chain: CHAIN,
      transport: http(TOKEN_CONFIG[gasToken].paymasterUrl),
    });
    // Initialize the Kernel Smart Account Client with bundler and erc20 paymaster support
    const kernelClient: any = createKernelAccountClient({
      account: client.account,
      chain: CHAIN,
      bundlerTransport: http(
        `https://api.gelato.digital/bundlers/${CHAIN.id}/rpc`
      ),
      paymaster: paymasterClient,
      paymasterContext: {
        token: gasTokenAddress,
      },
      userOperation: {
        // Function to estimate gas fees dynamically from the bundler
        estimateFeesPerGas: async ({ bundlerClient }) => {
          const gasPrices =
            await bundlerClient.request<EthGetUserOperationGasPriceRpc>({
              method: "eth_getUserOperationGasPrice",
              params: [],
            });

          return {
            maxFeePerGas: BigInt(gasPrices.maxFeePerGas),
            maxPriorityFeePerGas: BigInt(gasPrices.maxPriorityFeePerGas),
          };
        },
      },
    });
    setUser(kernelClient.account.address);
    setKernelAccount(kernelClient.account);
    setAccountAddress(kernelClient.account.address);
    checkIsDeployed(kernelClient.account.address);
    setKernelClient(kernelClient);
    setIsKernelClientReady(true);
    return kernelClient;
  };

  // Utility function for human readable datetime
  const humanReadableDateTime = (): string => {
    return new Date()
      .toLocaleString()
      .replaceAll("/", "-")
      .replaceAll(":", ".");
  };

  const logout = async () => {
    try {
      handleLogOut();
      setUser(null);
      setAccountAddress("");
      setOpen(false);
      setShowSuccessModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const addLog = useCallback(
    (
      message: string | JSX.Element,
      details?: {
        userOpHash?: string;
        txHash?: string;
        gasDetails?: {
          estimatedGas?: string;
          actualGas?: string;
          gasToken?: string;
        };
        isSponsored?: boolean;
      }
    ) => {
      setLogs((prevLogs) => [
        ...prevLogs,
        {
          message,
          timestamp: new Date().toISOString(),
          details,
        },
      ]);
    },
    []
  );

  const addTaskStatusLog = useCallback(
    (userOpHash: string) => {
      const taskStatusUrl = `https://relay.gelato.digital/tasks/status/${userOpHash}`;
      addLog(
        <span>
          View UserOp status:{" "}
          <a
            href={taskStatusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 underline"
          >
            {taskStatusUrl}
          </a>
        </span>
      );
    },
    [addLog]
  );

  const createKernelClient = async (method: "sponsored" | "erc20") => {
    if (method === "sponsored") {
      return createSponsoredKernelClient();
    } else {
      return createERC20KernelClient(gasToken);
    }
  };

  const getActualFees = async (
    txHash: string,
    gasTokenAddress: string,
    gasToken: "USDC" | "WETH"
  ) => {
    try {
      const publicClient = await (primaryWallet as any).getPublicClient();
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Find Transfer event from the gas token to the paymaster
      const transferEvents = receipt.logs.filter((log: Log) => {
        // Check if this is a Transfer event from the gas token contract
        return (
          log.address.toLowerCase() === gasTokenAddress.toLowerCase() &&
          log.topics[0] ===
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        ); // Transfer event signature
      });

      if (transferEvents.length > 0) {
        // Get the last transfer event which should be the fee payment
        const lastTransferEvent = transferEvents[transferEvents.length - 1];
        const amount = BigInt(lastTransferEvent.data);
        const formattedAmount = formatUnits(
          amount,
          TOKEN_CONFIG[gasToken].decimals
        );
        return `${formattedAmount} ${TOKEN_CONFIG[gasToken].symbol}`;
      }
      return "Fee information not available";
    } catch (error) {
      console.error("Error getting actual fees:", error);
      return "Error fetching fee information";
    }
  };

  const handleGasEstimationConfirm = async (estimatedGas: string) => {
    setShowGasEstimation(false);
    setLoadingTokens(true);
    setIsTransactionProcessing(true);
    try {
      if (!kernelClient) {
        throw new Error("Kernel client not initialized");
      }

      let data = encodeFunctionData({
        abi: tokenDetails.abi,
        functionName: pendingAction === "drop" ? "drop" : "stake",
        args: [],
      });

      const calls = [
        await getERC20PaymasterApproveCall(kernelClient.paymaster, {
          gasToken: TOKEN_CONFIG[gasToken].address as `0x${string}`,
          approveAmount: parseEther("1"),
          entryPoint: getEntryPoint("0.7"),
        }),
        {
          to: tokenDetails.address as `0x${string}`,
          value: BigInt(0),
          data,
        },
      ];

      const userOpHash = await kernelClient.sendUserOperation({
        callData: await kernelClient.account.encodeCalls(calls),
      });
      // Add initial log with estimated gas
      addLog(
        `Sending userOp through Gelato Bundler - paying gas with ${gasToken}`,
        {
          userOpHash,
          gasDetails: {
            estimatedGas,
            gasToken,
          },
          isSponsored: false,
        }
      );

      const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });
      const txHash = receipt.receipt.transactionHash;

      // Get actual gas fees
      const actualGas = await getActualFees(
        txHash,
        TOKEN_CONFIG[gasToken].address,
        gasToken
      );

      // Add completion log with all details
      addLog("Minted drop tokens on chain successfully", {
        userOpHash,
        txHash,
        gasDetails: {
          estimatedGas,
          actualGas,
          gasToken,
        },
        isSponsored: false,
      });

      toast.success(
        `${
          pendingAction === "drop" ? "Tokens claimed" : "Tokens staked"
        } successfully!`
      );

      // Refresh token holdings after successful transaction
      if (accountAddress) {
        refetchTokenHoldings();
      }
    } catch (error: any) {
      addLog(
        `Error ${pendingAction === "drop" ? "claiming" : "staking"} tokens: ${
          typeof error === "string"
            ? error
            : error?.message || "Unknown error occurred"
        }`
      );
      toast.error(
        `Error ${
          pendingAction === "drop" ? "claiming" : "staking"
        } token. Check the logs`
      );
    } finally {
      setLoadingTokens(false);
      setIsTransactionProcessing(false);
      setPendingAction(null);
    }
  };

  const dropToken = async () => {
    if (gasPaymentMethod === "erc20") {
      setPendingAction("drop");
      setShowGasEstimation(true);
      return;
    }

    setLoadingTokens(true);
    setIsTransactionProcessing(true);
    try {
      const kernelClient = await createKernelClient(gasPaymentMethod);
      let data = encodeFunctionData({
        abi: tokenDetails.abi,
        functionName: "drop",
        args: [],
      });

      const calls = [
        {
          to: tokenDetails.address as `0x${string}`,
          value: BigInt(0),
          data,
        },
      ];
      const userOpHash = await kernelClient.sendUserOperation({
        callData: await kernelClient.account.encodeCalls(calls),
        maxFeePerGas: BigInt(0),
        maxPriorityFeePerGas: BigInt(0),
      });

      addLog(
        gasPaymentMethod === "sponsored"
          ? "Sending userOp through Gelato Bundler - Sponsored"
          : `Sending UserOp through Gelato Bundler - paying gas with ${gasToken}`,
        {
          userOpHash,
          isSponsored: gasPaymentMethod === "sponsored",
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const txHash = await Promise.race([
        // First promise: Get hash from task status
        getTaskStatus(userOpHash).then((taskStatus) => {
          return taskStatus.task.transactionHash;
        }),
        // Second promise: Get hash from kernel client
        kernelClient
          .waitForUserOperationReceipt({
            hash: userOpHash,
          })
          .then((receipt: { receipt: { transactionHash: string } }) => {
            return receipt.receipt.transactionHash;
          }),
      ]);

      // Add success log
      addLog("Minted drop tokens on chain successfully", {
        userOpHash,
        txHash,
        isSponsored: gasPaymentMethod === "sponsored",
      });

      toast.success("Tokens claimed successfully!");

      // Refresh token holdings after successful transaction
      if (accountAddress) {
        refetchTokenHoldings();
      }
    } catch (error: any) {
      console.log(error);
      addLog(
        `Error claiming tokens: ${
          typeof error === "string"
            ? error
            : error?.message || "Unknown error occurred"
        }`
      );
      toast.error(`Error claiming token. Check the logs`);
    } finally {
      setLoadingTokens(false);
      setIsTransactionProcessing(false);
    }
  };
  async function getTaskStatus(userOpHash: string) {
    const url = `https://relay.gelato.digital/tasks/status/${userOpHash}`;
    const response = await fetch(url);
    return response.json();
  }
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(accountAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  }, [accountAddress]);

  useEffect(() => {
    async function createAccount() {
      if (client) {
        try {
          const kernelClient = await createKernelClient(gasPaymentMethod);
          // setUser(primaryWallet.address);
        } catch (error) {
          console.error("Failed to create kernel client:", error);
          toast.error("Failed to initialize wallet");
        } finally {
          setIsInitializing(false);
        }
      }
    }
    createAccount();
  }, [client, gasPaymentMethod, gasToken]);
  useEffect(() => {
    if (primaryWallet) {
      setIsInitializing(true);
    }
  }, [primaryWallet]);

  useEffect(() => {
    if (tokenHoldings) {
      setTokenBalance(
        gasToken === "USDC"
          ? tokenHoldings.usdcBalance
          : tokenHoldings.wethBalance
      );
    }
  }, [tokenHoldings, gasToken]);

  const handleShowTransactionDetails = useCallback((details: any) => {
    setTransactionDetails({
      isOpen: true,
      userOpHash: details.userOpHash,
      txHash: details.txHash,
      gasDetails: details.gasDetails,
      isSponsored: details.isSponsored,
    });
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-[#080808] text-white">
        {/* Transaction Processing Modal - Moved outside the main content flow */}
        {isTransactionProcessing && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-[#202020] border border-[#2A2A2A] rounded-[12px] shadow-xl w-80">
              <div className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-blue-400">
                    Processing Transaction
                  </p>
                  <p className="text-xs text-zinc-400">
                    Please wait while we confirm your transaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Header />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-4">
              <FeatureCards />
            </div>

            <div className="lg:col-span-2 space-y-4">
              {isInitializing ? (
                <div className="p-8 bg-[#161616] border border-[#2A2A2A] rounded-[12px] text-center">
                  <LoadingSpinner />
                </div>
              ) : !user ? (
                <div className="w-full flex flex-col p-4 bg-[#161616] border rounded-[12px] border-[#2A2A2A]">
                  <div className="flex flex-col items-center justify-center">
                    <DynamicConnectButton>
                      <div className="w-32 py-3 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative text-center text-sm text-white">
                        Login
                      </div>
                    </DynamicConnectButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full flex flex-col p-4 bg-[#161616] border rounded-[12px] border-[#2A2A2A]">
                    <div className="space-y-4">
                      {/* Wallet Card with Logout */}
                      <WalletCard
                        accountAddress={accountAddress}
                        gasToken={gasToken}
                        handleLogout={logout}
                      />

                      <div className="w-full flex flex-col p-4 bg-[#202020] border rounded-[12px] border-[#2A2A2A]">
                        <div className="w-full flex items-center mb-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-[#252525] rounded flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-[#807872]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                          </div>
                          <h3 className="text-white text-md font-medium break-words ps-2">
                            Gas sponsorship
                          </h3>
                        </div>
                        <p className="text-zinc-400 text-sm flex-grow break-words mb-4">
                          Sponsor transactions effortlessly and deliver a
                          frictionless user experience.
                        </p>
                        <div className="w-full mt-auto">
                          <button
                            onClick={() => {
                              setGasPaymentMethod("sponsored");
                              dropToken();
                            }}
                            disabled={loadingTokens || isTransactionProcessing}
                            className="w-full py-3 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative text-sm text-white"
                          >
                            {isTransactionProcessing &&
                            gasPaymentMethod === "sponsored" ? (
                              <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span>Processing Transaction...</span>
                              </div>
                            ) : loadingTokens &&
                              gasPaymentMethod === "sponsored" ? (
                              "Minting..."
                            ) : (
                              "Mint Drop Tokens"
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="w-full flex flex-col p-4 bg-[#202020] border rounded-[12px] border-[#2A2A2A]">
                        <div className="w-full flex items-center mb-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-[#252525] rounded flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-[#807872]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v12M6 12h12" />
                            </svg>
                          </div>
                          <h3 className="text-white text-md font-medium break-words ps-2">
                            ERC-20
                          </h3>
                        </div>
                        <p className="text-zinc-400 text-sm flex-grow break-words mb-4">
                          Allow your users to pay for transaction gas fees with
                          ERC-20 tokens.
                        </p>
                        <div className="w-full mt-auto">
                          {!showTokenSelection ? (
                            <button
                              onClick={() => setShowTokenSelection(true)}
                              disabled={
                                loadingTokens || isTransactionProcessing
                              }
                              className="w-full py-3 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white"
                            >
                              {isTransactionProcessing &&
                              gasPaymentMethod === "erc20" ? (
                                <div className="flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  <span>Processing Transaction...</span>
                                </div>
                              ) : loadingTokens &&
                                gasPaymentMethod === "erc20" ? (
                                "Minting..."
                              ) : (
                                "Mint Drop Tokens"
                              )}
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <button
                                onClick={async () => {
                                  setGasToken("USDC");
                                  setGasPaymentMethod("erc20");
                                  setPendingAction("drop");
                                  try {
                                    // Create a new kernel client with USDC configuration
                                    const kernelClient =
                                      await createERC20KernelClient("USDC");
                                    setKernelClient(kernelClient);
                                    setShowGasEstimation(true);
                                    setShowTokenSelection(false);
                                  } catch (error) {
                                    console.error(
                                      "Error creating USDC kernel client:",
                                      error
                                    );
                                    toast.error(
                                      "Failed to initialize USDC kernel client"
                                    );
                                  }
                                }}
                                disabled={
                                  loadingTokens || isTransactionProcessing
                                }
                                className="w-full py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm text-white"
                              >
                                {isTransactionProcessing &&
                                gasPaymentMethod === "erc20" ? (
                                  <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    <span>Processing Transaction...</span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="w-6 h-6 bg-[#2775CA]/10 rounded-full flex items-center justify-center">
                                      <Image
                                        src="/usdc.svg"
                                        alt="USDC"
                                        width={16}
                                        height={16}
                                        className="w-4 h-4"
                                      />
                                    </div>
                                    Use USDC
                                  </>
                                )}
                              </button>
                              <button
                                onClick={async () => {
                                  setGasToken("WETH");
                                  setGasPaymentMethod("erc20");
                                  setPendingAction("drop");
                                  try {
                                    // Create a new kernel client with WETH configuration
                                    const kernelClient =
                                      await createERC20KernelClient("WETH");
                                    setKernelClient(kernelClient);
                                    setShowGasEstimation(true);
                                    setShowTokenSelection(false);
                                  } catch (error) {
                                    console.error(
                                      "Error creating WETH kernel client:",
                                      error
                                    );
                                    toast.error(
                                      "Failed to initialize WETH kernel client"
                                    );
                                  }
                                }}
                                disabled={
                                  loadingTokens || isTransactionProcessing
                                }
                                className="w-full py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm text-white"
                              >
                                {isTransactionProcessing &&
                                gasPaymentMethod === "erc20" ? (
                                  <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    <span>Processing Transaction...</span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="w-6 h-6 bg-[#627EEA]/10 rounded-full flex items-center justify-center">
                                      <Image
                                        src="/weth.svg"
                                        alt="WETH"
                                        width={16}
                                        height={16}
                                        className="w-4 h-4"
                                      />
                                    </div>
                                    Use WETH
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setShowTokenSelection(false);
                                  // Refresh token holdings when canceling token selection
                                  if (accountAddress) {
                                    refetchTokenHoldings();
                                  }
                                }}
                                className="w-full py-2 text-zinc-400 hover:text-zinc-300 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Activity Log */}
                  <ActivityLog
                    logs={logs}
                    onShowDetails={handleShowTransactionDetails}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-[#2A2A2A] mt-auto">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <span>Built by Gelato</span>
              <span>•</span>
              <span>
                Powered by{" "}
                <a
                  href="https://eips.ethereum.org/EIPS/eip-7702"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  EIP7702
                </a>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://docs.gelato.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Documentation
              </a>
              <a
                href="https://github.com/gelatodigital/eip7702-next-demo/tree/gelato-7702"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>

        <GasEstimationModal
          isOpen={showGasEstimation}
          onClose={() => {
            setShowGasEstimation(false);
            setGasPaymentMethod("sponsored");
          }}
          onConfirm={handleGasEstimationConfirm}
          kernelClient={kernelClient}
          gasToken={gasToken}
          tokenBalance={tokenBalance}
          pendingAction={pendingAction!}
        />

        <TransactionModal
          isOpen={transactionDetails.isOpen}
          onClose={() =>
            setTransactionDetails((prev) => ({ ...prev, isOpen: false }))
          }
          userOpHash={transactionDetails.userOpHash}
          txHash={transactionDetails.txHash}
          gasDetails={transactionDetails.gasDetails}
          isSponsored={transactionDetails.isSponsored}
        />

        <Toaster richColors />
      </div>
    </ThemeProvider>
  );
}
