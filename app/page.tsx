"use client";

import { useCallback, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import TerminalLog from "@/components/TerminalLog";
import WalletCard from "@/components/WalletCard";
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
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { GasEstimationModal } from "@/components/GasEstimationModal";
import { useTokenHoldings } from "@/lib/useFetchBlueberryBalances";
import { Address, Log } from "viem";
import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";

interface HomeProps {}
type GasPrices = {
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
};

type EthGetUserOperationGasPriceRpc = {
  ReturnType: GasPrices;
  Parameters: [];
};

let CHAIN = chainConfig;
const CHAIN_ID = chainConfig.id;

const GELATO_API_KEY = process.env.NEXT_PUBLIC_GELATO_API_KEY!;

export default function Home({}: HomeProps) {
  const [accountAddress, setAccountAddress] = useState("");
  const [isKernelClientReady, setIsKernelClientReady] = useState(false);
  const [userOpHash, setUserOpHash] = useState("");
  const [kernelAccount, setKernelAccount] = useState<any>(null);
  const [kernelClient, setKernelClient] = useState<any>(null);
  const [logs, setLogs] = useState<(string | JSX.Element)[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [gasPaymentMethod, setGasPaymentMethod] = useState<
    "sponsored" | "erc20"
  >("sponsored");
  const [gasToken, setGasToken] = useState<"USDC" | "WETH">("USDC");

  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [showGasEstimation, setShowGasEstimation] = useState(false);
  const [pendingAction, setPendingAction] = useState<"drop" | "stake" | null>(
    null
  );
  const [tokenBalance, setTokenBalance] = useState("0");

  const kernelVersion = KERNEL_V3_1;
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const connector: any = primaryWallet?.connector;
  const params = {
    withSponsorship: true,
  };
  let client: any;
  if (isZeroDevConnector(connector)) {
    client = connector?.getAccountAbstractionProvider(params);
  }

  const { data: tokenHoldings } = useTokenHoldings(
    accountAddress as Address,
    gasToken
  );

  const createSponsoredKernelClient = async () => {
    console.log("Creating sponsored kernel client");
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

  const createERC20KernelClient = async () => {
    console.log("Creating ERC20 kernel client");
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
        `https://api.staging.gelato.digital/bundlers/${CHAIN.id}/rpc`
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

          console.log("Gas Prices:", gasPrices);

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

  const checkIsDeployed = async (address: string) => {
    let provider = new JsonRpcProvider(CHAIN.rpcUrls.default.http[0]);
    let code = await provider.getCode(address);
    if (code == "0x") {
      setIsDeployed(false);
    } else {
      setIsDeployed(true);
    }
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

  const addLog = useCallback((message: string | JSX.Element) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  }, []);

  const createKernelClient = async (method: "sponsored" | "erc20") => {
    if (method === "sponsored") {
      return createSponsoredKernelClient();
    } else {
      return createERC20KernelClient();
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

  const handleGasEstimationConfirm = async () => {
    setShowGasEstimation(false);
    setLoadingTokens(true);
    try {
      const kernelClient = await createKernelClient("erc20");
      let data = encodeFunctionData({
        abi: tokenDetails.abi,
        functionName: pendingAction === "drop" ? "drop" : "stake",
        args: [],
      });

      const calls = [
        // Approve the paymaster to spend gas tokens
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
      console.log(userOpHash);

      setUserOpHash(userOpHash);

      const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      const txHash = receipt.receipt.transactionHash;
      console.log("User Operation Completed, Transaction Hash:", txHash);

      // Get actual gas fees
      const actualFees = await getActualFees(
        txHash,
        TOKEN_CONFIG[gasToken].address,
        gasToken
      );

      checkIsDeployed(accountAddress);
      addLog(
        `Tokens ${
          pendingAction === "drop" ? "claimed" : "staked"
        } successfully! Transaction: ${
          chainConfig.blockExplorers.default.url
        }/tx/${txHash}`
      );
      addLog(`Actual gas fees: ${actualFees}`);
      if (pendingAction === "drop") {
        addLog(
          "Your tokens will appear in the dashboard once the transaction is indexed (15-30 seconds)"
        );
      } else {
        addLog(
          "Now you will be able to sponsor all your transactions after 5 min"
        );
      }
    } catch (error: any) {
      toast.error(
        `Error ${
          pendingAction === "drop" ? "claiming" : "staking"
        } token. Check the logs`
      );
      addLog(
        `Error ${pendingAction === "drop" ? "claiming" : "staking"} tokens: ${
          typeof error === "string"
            ? error
            : error?.message || "Unknown error occurred"
        }`
      );
    } finally {
      setLoadingTokens(false);
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

      setUserOpHash(userOpHash);

      const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      const txHash = receipt.receipt.transactionHash;
      console.log("User Operation Completed, Transaction Hash:", txHash);

      checkIsDeployed(accountAddress);
      addLog(
        `Tokens claimed successfully! Transaction: ${chainConfig.blockExplorers.default.url}/tx/${txHash}`
      );
      addLog(
        "Your tokens will appear in the dashboard once the transaction is indexed (15-30 seconds)"
      );
    } catch (error: any) {
      console.log(error);
      toast.error(`Error claiming token. Check the logs`);
      addLog(
        `Error claiming tokens: ${
          typeof error === "string"
            ? error
            : error?.message || "Unknown error occurred"
        }`
      );
    } finally {
      setLoadingTokens(false);
    }
  };

  const stakeToken = async () => {
    if (gasPaymentMethod === "erc20") {
      setPendingAction("stake");
      setShowGasEstimation(true);
      return;
    }

    setLoadingTokens(true);
    try {
      const kernelClient = await createKernelClient(gasPaymentMethod);
      const provider = new JsonRpcProvider(chainConfig.rpcUrls.default.http[0]);
      const dropStakeContract = new Contract(
        tokenDetails.address,
        tokenDetails.abi,
        provider
      );
      const tokens = +(
        await dropStakeContract.balanceOf(kernelClient.account.address)
      ).toString();
      if (tokens == 0) {
        toast.error("You don't have any tokens to stake");
        return;
      }

      const calls = [
        {
          to: tokenDetails.address as `0x${string}`,
          value: BigInt(0),
          data: encodeFunctionData({
            abi: tokenDetails.abi,
            functionName: "stake",
            args: [],
          }),
        },
      ];

      const userOpHash = await kernelClient.sendUserOperation({
        callData: await kernelClient.account.encodeCalls(calls),
        maxFeePerGas: BigInt(0),
        maxPriorityFeePerGas: BigInt(0),
      });

      setUserOpHash(userOpHash);

      const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      const txHash = receipt.receipt.transactionHash;
      console.log("User Operation Completed, Transaction Hash:", txHash);

      checkIsDeployed(accountAddress);
      addLog(
        `Tokens staked successfully! Transaction: ${chainConfig.blockExplorers.default.url}/tx/${txHash}`
      );
      addLog(
        "Now you will be able to sponsor all your transactions after 5 min"
      );
    } catch (error: any) {
      toast.error(`Error staking token. Check the logs`);
      addLog(
        `Error staking tokens: ${
          typeof error === "string"
            ? error
            : error?.message || "Unknown error occurred"
        }`
      );
    } finally {
      setLoadingTokens(false);
    }
  };

  useEffect(() => {
    async function createAccount() {
      if (client) {
        try {
          console.log(client);
          const kernelClient = await createKernelClient(gasPaymentMethod);
          console.log(kernelClient);
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

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-black text-white">
        <div className="relative min-h-screen pb-0">
          <Header
            isLoggedIn={!!user}
            addLog={addLog}
            walletAddress={accountAddress}
            handleLogout={logout}
          />
          <div className="flex-1 w-full h-full flex flex-col items-center py-4">
            {isInitializing && (
              <div className="flex flex-col items-center justify-center mt-20">
                <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Initializing wallet...</p>
              </div>
            )}
            {!isInitializing && !user && <EmptyState />}
            {!isInitializing && !!user && (
              <>
                <br />
                <UserProfile address={accountAddress} isDeployed={isDeployed} />
                <WalletCard
                  isLoading={loadingTokens}
                  address={accountAddress}
                  onClaimTokens={() => {
                    addLog("Claiming tokens...");
                    dropToken();
                  }}
                  onStakeTokens={() => {
                    addLog("Staking tokens...");
                    stakeToken();
                  }}
                  gasPaymentMethod={gasPaymentMethod}
                  onGasPaymentMethodChange={setGasPaymentMethod}
                  gasToken={gasToken}
                  onGasTokenChange={setGasToken}
                />
              </>
            )}
          </div>

          <TerminalLog
            logs={logs}
            isOpen={isTerminalOpen}
            setIsOpen={setIsTerminalOpen}
          />
        </div>
        <GasEstimationModal
          isOpen={showGasEstimation}
          onClose={() => {
            setShowGasEstimation(false);
            setPendingAction(null);
          }}
          onConfirm={handleGasEstimationConfirm}
          kernelClient={kernelClient}
          gasToken={gasToken}
          tokenBalance={tokenBalance}
          pendingAction={pendingAction!}
        />
      </div>
      <Toaster richColors />
    </ThemeProvider>
  );
}
