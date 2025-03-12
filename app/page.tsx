"use client";

import { useCallback, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import TerminalLog from "@/components/TerminalLog";
import WalletCard from "@/components/WalletCard";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  createKernelAccount,
  createKernelAccountClient,
  getUserOperationGasPrice,
} from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { encodeFunctionData } from "viem";
import { http } from "wagmi";
import UserProfile from "@/components/UserProfile";
import { Contract, JsonRpcProvider } from "ethers";
import { EmptyState } from "@/components/EmptyState";
import { chainConfig, tokenDetails } from "./blockchain/config";
import { Toaster, toast } from "sonner";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
interface HomeProps {}

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

  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  const kernelVersion = KERNEL_V3_1;
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const createKernelClient = async () => {
    console.log("Creating kernel client");
    const publicClient = await (primaryWallet as any).getPublicClient();
    const walletClient = await (primaryWallet as any).getWalletClient();
    const entryPoint = getEntryPoint("0.7");
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: walletClient,
      entryPoint,
      kernelVersion,
    });

    // Create Kernel account with validator
    const kernelAccount = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion,
    });
    console.log(kernelAccount.address);

    const kernelClient = createKernelAccountClient({
      account: kernelAccount,
      chain: CHAIN,
      bundlerTransport: http(
        `https://api.gelato.digital/bundlers/${CHAIN_ID}/rpc?sponsorApiKey=${GELATO_API_KEY}`
      ),
      client: publicClient,
      userOperation: {
        estimateFeesPerGas: async ({ bundlerClient }) => {
          return getUserOperationGasPrice(bundlerClient);
        },
      },
    });
    setUser(kernelAccount.address);
    setKernelAccount(kernelAccount);
    setAccountAddress(kernelAccount.address);
    checkIsDeployed(kernelAccount.address);
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

  const dropToken = async () => {
    setLoadingTokens(true);
    try {
      const kernelClient = await createKernelClient();
      let data = encodeFunctionData({
        abi: tokenDetails.abi,
        functionName: "drop",
        args: [],
      });
      const userOpHash = await kernelClient.sendUserOperation({
        callData: await kernelClient.account.encodeCalls([
          {
            to: tokenDetails.address as `0x${string}`,
            value: BigInt(0),
            data,
          },
        ]),
        maxFeePerGas: BigInt(0),
        maxPriorityFeePerGas: BigInt(0),
      });
      console.log(userOpHash);

      setUserOpHash(userOpHash);

      const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });
      console.log(receipt);

      const txHash = receipt.receipt.transactionHash;
      console.log("User Operation Completed, Transaction Hash:", txHash);

      checkIsDeployed(accountAddress);
      addLog(`Tokens claimed successfully! Transaction: ${userOpHash}`);
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
    setLoadingTokens(true);
    try {
      const kernelClient = await createKernelClient();
      const provider = new JsonRpcProvider(chainConfig.rpcUrls.default.http[0]);
      const droppStakeContract = new Contract(
        tokenDetails.address,
        tokenDetails.abi,
        provider
      );
      const tokens = +(
        await droppStakeContract.balanceOf(kernelClient.account.address)
      ).toString();
      if (tokens == 0) {
        toast.error("You don't have any tokens to stake");
        return;
      }
      const userOpHash = await kernelClient.sendUserOperation({
        callData: await kernelClient.account.encodeCalls([
          {
            to: tokenDetails.address as `0x${string}`,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: tokenDetails.abi,
              functionName: "stake",
              args: [],
            }),
          },
        ]),
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
      addLog(`Tokens staked successfully! Transaction: ${userOpHash}`);
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
      if (primaryWallet) {
        setIsInitializing(true);
        try {
          console.log(primaryWallet);
          const kernelClient = await createKernelClient();
          console.log(kernelClient);
          setUser(primaryWallet.address);
        } catch (error) {
          console.error("Failed to create kernel client:", error);
          toast.error("Failed to initialize wallet");
        } finally {
          setIsInitializing(false);
        }
      }
    }
    createAccount();
  }, [primaryWallet]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
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
                    addLog("Staken tokens...");
                    stakeToken();
                  }}
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
      </div>
      <Toaster richColors />
    </ThemeProvider>
  );
}
