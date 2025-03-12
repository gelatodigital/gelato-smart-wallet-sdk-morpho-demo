"use client";

import { useCallback, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import TerminalLog from "@/components/TerminalLog";
import WalletCard from "@/components/WalletCard";
import { useTurnkey } from "@turnkey/sdk-react";
import { createAccount } from "@turnkey/viem";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  createKernelAccount,
  createKernelAccountClient,
  getUserOperationGasPrice,
} from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V2_4 } from "@zerodev/sdk/constants";
import { createPublicClient, encodeFunctionData } from "viem";
import { http } from "wagmi";
import UserProfile from "@/components/UserProfile";
import { Contract, JsonRpcProvider } from "ethers";
import { EmptyState } from "@/components/EmptyState";
import {
  arbitrumBlueberry,
  chainConfig,
  tokenDetails,
} from "./blockchain/config";
import { Toaster, toast } from "sonner";
import {
  DEFAULT_ETHEREUM_ACCOUNTS,
  TurnkeyApiTypes,
  Turnkey,
} from "@turnkey/sdk-server";
import { refineNonNull } from "./utils";

interface HomeProps {}

let CHAIN = arbitrumBlueberry;
const CHAIN_ID = arbitrumBlueberry.id;

const GELATO_API_KEY = process.env.NEXT_PUBLIC_GELATO_API_KEY!;

interface TWalletDetails {
  id: string;
  address: string;
  subOrgId: string;
}
type TAttestation = TurnkeyApiTypes["v1Attestation"];

export default function Home({}: HomeProps) {
  const { turnkey, passkeyClient } = useTurnkey();
  const [mounted, setMounted] = useState(false);
  const [accountAddress, setAccountAddress] = useState("");
  const [isKernelClientReady, setIsKernelClientReady] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userOpHash, setUserOpHash] = useState("");
  const [wallet, setWallet] = useState<TWalletDetails | null>(null);
  const [kernelAccount, setKernelAccount] = useState<any>(null);
  const [kernelClient, setKernelClient] = useState<any>(null);
  const [logs, setLogs] = useState<(string | JSX.Element)[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(false);

  const kernelVersion = KERNEL_V2_4;

  const createKernelClient = async () => {
    const publicClient = createPublicClient({
      transport: http(),
      chain: CHAIN,
    });

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

  const handleSmartAccountCreation = async (
    walletDetails: TWalletDetails,
    action: string
  ) => {
    const viemAccount = await createAccount({
      client: passkeyClient as any,
      organizationId: walletDetails.subOrgId,
      signWith: walletDetails.address,
      ethereumAddress: walletDetails.address,
    });

    const publicClient = createPublicClient({
      transport: http(),
      chain: CHAIN,
    });

    // Step 4: Configure ZeroDev Kernel account
    const entryPoint = getEntryPoint("0.6");
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: viemAccount,
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

    if (action === "login") {
      setUser(kernelAccount.address);
      setWallet(walletDetails);
      setKernelAccount(kernelAccount);
      setAccountAddress(kernelAccount.address);
      checkIsDeployed(kernelAccount.address);
    }
  };

  // Function to be called when "Register" is clicked
  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const subOrgName = `Turnkey Demo - ${humanReadableDateTime()}`;
      const turnkey = new Turnkey({
        apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
        apiPrivateKey: process.env.NEXT_PUBLIC_TURNKEY_API_PRIVATE_KEY!,
        apiPublicKey: process.env.NEXT_PUBLIC_TURNKEY_API_PUBLIC_KEY!,
        defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
      });
      const credential = await passkeyClient?.createUserPasskey({
        publicKey: {
          rp: {
            id: "localhost",
            name: "Turnkey Passkey",
          },
          user: {
            name: subOrgName,
            displayName: subOrgName,
          },
        },
      });
      console.log(credential);

      const apiClient = turnkey.apiClient();

      const walletName = `Default ETH Wallet`;

      const createSubOrgResponse = await apiClient.createSubOrganization({
        subOrganizationName: subOrgName,
        rootQuorumThreshold: 1,
        rootUsers: [
          {
            userName: "New User",
            apiKeys: [],
            authenticators: [
              {
                authenticatorName: "Gelato Turnkey PoC",
                challenge: credential?.encodedChallenge as string,
                attestation: credential?.attestation as TAttestation,
              },
            ],
            oauthProviders: [],
          },
        ],
        wallet: {
          walletName: walletName,
          accounts: DEFAULT_ETHEREUM_ACCOUNTS,
        },
      });

      const subOrgId = refineNonNull(createSubOrgResponse.subOrganizationId);
      const wallet = refineNonNull(createSubOrgResponse.wallet);

      const walletId = wallet.walletId;
      const walletAddress = wallet.addresses[0];

      if (!credential?.encodedChallenge || !credential?.attestation) {
        return false;
      }
      const walletDetails: TWalletDetails = {
        id: walletId,
        address: walletAddress,
        subOrgId: subOrgId,
      };
      console.log(walletDetails);
      await handleSmartAccountCreation(walletDetails, "register");
      setIsRegistering(false);
      setOpen(false);
      setShowSuccessModal(true);
      toast.success("Wallet created successfully. Login with Passkey.", {
        position: "top-center",
      });
    } catch (error) {
      console.error(error);
      setIsRegistering(false);
      toast.error("Registration failed. Please try again.");
    }
  };

  // Function to be called when "Login" is clicked
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const loginResponse = await passkeyClient?.login();
      if (!loginResponse?.organizationId) {
        return;
      }

      const currentUserSession = await turnkey?.currentUserSession();
      if (!currentUserSession) {
        return;
      }

      const walletsResponse = await currentUserSession?.getWallets();
      if (!walletsResponse?.wallets[0].walletId) {
        return;
      }

      const walletId = walletsResponse?.wallets[0].walletId;
      const walletAccountsResponse =
        await currentUserSession?.getWalletAccounts({
          organizationId: loginResponse?.organizationId,
          walletId,
        });

      if (!walletAccountsResponse?.accounts[0].address) {
        return;
      }

      const walletDetails = {
        id: walletId,
        address: walletAccountsResponse?.accounts[0].address,
        subOrgId: loginResponse.organizationId,
      } as TWalletDetails;
      console.log(walletDetails);

      await handleSmartAccountCreation(walletDetails, "login");
      setIsLoggingIn(false);

      toast.success("Login done. Try sending UserOps.");
    } catch (error) {
      console.error(error);
      setIsLoggingIn(false);
      toast.error("Login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await turnkey?.logoutUser();
      setWallet(null);
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
            to: tokenDetails.address,
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
            to: tokenDetails.address,
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
    setMounted(true);
  }, []);

  if (!mounted) return <></>;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-black text-white">
        <div className="relative min-h-screen pb-0">
          <Header
            isLoggedIn={!!user}
            addLog={addLog}
            walletAddress={accountAddress}
            handleLogout={logout}
            onPasskeyLogin={handleLogin}
            onPasskeyRegister={handleRegister}
            open={open}
            setOpen={setOpen}
            showSuccessModal={showSuccessModal}
            setShowSuccessModal={setShowSuccessModal}
            isRegistering={isRegistering}
            isLoggingIn={isLoggingIn}
          />
          <div className="flex-1 w-full h-full flex flex-col items-center py-4">
            {!user && <EmptyState />}
            {!!user && (
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
