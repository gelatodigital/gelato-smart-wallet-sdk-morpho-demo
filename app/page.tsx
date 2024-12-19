"use client";

import { useCallback, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import TerminalLog from "@/components/TerminalLog";
import WalletCard from "@/components/WalletCard";

import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  KernelAccountClient,
} from "@zerodev/sdk";
import {
  toPasskeyValidator,
  toWebAuthnKey,
  WebAuthnMode,
  PasskeyValidatorContractVersion,
} from "@zerodev/passkey-validator";
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { parseAbi, encodeFunctionData, zeroAddress } from "viem";

import {
  entryPoint06Address,
  EntryPointVersion,
} from "viem/account-abstraction";
import { KERNEL_V3_1} from "@zerodev/sdk/constants";
import { createPublicClient, defineChain } from "viem";
import { http } from "wagmi";
import UserProfile from "@/components/UserProfile";
import { Contract, JsonRpcProvider } from "ethers";
import { EmptyState } from "@/components/EmptyState";

interface HomeProps {}



import { projectId } from "./constants";
import { sepolia } from "viem/chains";
import { tokenDetails } from "./blockchain/config";

import { Toaster, toast } from 'sonner'

const BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${projectId}`//?provider=GELATO`;
const PAYMASTER_URL = `https://rpc.zerodev.app/api/v2/paymaster/${projectId}`;
const PASSKEY_SERVER_URL = `https://passkeys.zerodev.app/api/v3/${projectId}`;

// const blueberry = defineChain({
//   id: 88_153_591_557,
//   name: "Blueberry",
//   nativeCurrency: {
//     name: "CGT",
//     symbol: "CGT",
//     decimals: 18,
//   },
//   rpcUrls: {
//     public: {
//       http: ["https://rpc.arb-blueberry.gelato.digital"],
//     },
//     default: {
//       http: ["https://rpc.arb-blueberry.gelato.digital"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "Block Scout",
//       url: "https://arb-blueberry.gelatoscout.com",
//       apiUrl: "https://arb-blueberry.gelatoscout.com/api",
//     },
//   },
//   contracts: {
//     multicall3: {
//       address: "0xEc10A32fF915D672a8A062eea9d48370232072Df",
//       blockCreated: 7,
//     },
//   },
//   testnet: true,
// });

let CHAIN = sepolia
const entryPoint = ENTRYPOINT_ADDRESS_V07;
const publicClient = createPublicClient({
  transport: http(BUNDLER_URL),
});

let kernelAccount: any;
let kernelClient: any;

export default function Home({}: HomeProps) {
  const [mounted, setMounted] = useState(false);
  const [accountAddress, setAccountAddress] = useState("");
  const [isKernelClientReady, setIsKernelClientReady] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingUserOp, setIsSendingUserOp] = useState(false);
  const [userOpHash, setUserOpHash] = useState("");
  const [userOpStatus, setUserOpStatus] = useState("");

  const [logs, setLogs] = useState<(string | JSX.Element)[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [smartAccount, setSmartAccount] = useState<any | null>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(false);



  const kernelVersion = KERNEL_V3_1

  const createAccountAndClient = async (passkeyValidator: any) => {
    kernelAccount = await createKernelAccount(publicClient, {
      plugins: {
        sudo: passkeyValidator,
      },
      entryPoint,
      kernelVersion,
    });


    kernelClient = createKernelAccountClient({
      account: kernelAccount,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      entryPoint,
      middleware: {
        sponsorUserOperation: async ({ userOperation }) => {
          const zeroDevPaymaster = await createZeroDevPaymasterClient({
            chain: CHAIN,
            transport: http(PAYMASTER_URL),
            entryPoint,
          });
          return zeroDevPaymaster.sponsorUserOperation({
            userOperation,
            entryPoint,
          });
        },
      },
    });

   //let isDeployed = await kernelAccount.isDeployed()

    setIsKernelClientReady(true);
    checkIsDeployed(kernelAccount.address)
    setAccountAddress(kernelAccount.address);
    setUser(kernelAccount.address);
  };


  const checkIsDeployed = async (address:string) => {

    let provider = new JsonRpcProvider(CHAIN.rpcUrls.default.http[0])
    let code = await provider.getCode(address)
    if (code == "0x") {
      setIsDeployed(false)
    } else {
      setIsDeployed(true)
    }

  }

  // Function to be called when "Register" is clicked
  const handleRegister = async () => {
    setIsRegistering(true);

    const webAuthnKey = await toWebAuthnKey({
      passkeyName: "demo-custom",
      passkeyServerUrl: PASSKEY_SERVER_URL,
      mode: WebAuthnMode.Register,
      passkeyServerHeaders: {},
    });

    const passkeyValidator = await toPasskeyValidator(publicClient, {
      webAuthnKey,
      entryPoint,
      kernelVersion,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2,
    });

    await createAccountAndClient(passkeyValidator);
    setIsRegistering(false);
    toast.success("Register done.  Try sending UserOps.", { position: "top-center" });
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);

    const webAuthnKey = await toWebAuthnKey({
      passkeyName: "demo-custom-policy",
      passkeyServerUrl: PASSKEY_SERVER_URL,
      mode: WebAuthnMode.Login,
      passkeyServerHeaders: {},
    });

    const passkeyValidator = await toPasskeyValidator(publicClient, {
      webAuthnKey,
      entryPoint,
      kernelVersion,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2,
    });

    await createAccountAndClient(passkeyValidator);

    setIsLoggingIn(false);
    toast.success("Login done. Try sending UserOps.");
  };


  const logout = () => {};

  const addLog = useCallback((message: string | JSX.Element) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  }, []);

  const dropToken = async (
  ) => {
    setLoadingTokens(true);
    try {
 
      let data = encodeFunctionData({
        abi: tokenDetails.abi,
        functionName: "drop",
        args: [],
      })
 
   
      const userOpHash = await kernelClient.sendUserOperation({
        userOperation: {
          callData: await kernelAccount.encodeCallData({
            to: tokenDetails.address,
            value: BigInt(0),
            data,
          }),
        },
      });
  
      setUserOpHash(userOpHash);
  
      const bundlerClient = kernelClient.extend(
        bundlerActions(ENTRYPOINT_ADDRESS_V07)
      );
      await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });
      checkIsDeployed(accountAddress)
      addLog(`Tokens claimed successfully! Transaction: ${userOpHash}`);
      addLog(
        "Your tokens will appear in the dashboard once the transaction is indexed (15-30 seconds)"
      );
    } catch (error: any) {
      console.log(error)
      toast.error(`Error claiming token. Check the logs`)
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


  const stakeToken = async (
  ) => {
    setLoadingTokens(true);
    try {
    
      const userOpHash = await kernelClient.sendUserOperation({
        userOperation: {
          callData: await kernelAccount.encodeCallData({
            to: tokenDetails.address,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: tokenDetails.abi,
              functionName: "stake",
              args: [],
            }),
          }),
        },
      });
  
      setUserOpHash(userOpHash);
  
      const bundlerClient = kernelClient.extend(
        bundlerActions(ENTRYPOINT_ADDRESS_V07)
      );
      await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });
      checkIsDeployed(accountAddress)
      addLog(`Tokens staked successfully! Transaction: ${userOpHash}`);
      addLog(
        "Now you are able to sponsor all your transactions"
      );
    } catch (error: any) {
      toast.error(`Error staking token. Check the logs`)
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
          />
          <div className="flex-1 w-full h-full flex flex-col items-center py-4">
            {!user && <EmptyState />}
            {!!user && (
              <>
                <br />
                <UserProfile
                  address={accountAddress}
                  isDeployed={isDeployed}
                />
                <WalletCard
                  isLoading={loadingTokens}
                  address={accountAddress}
                  onClaimTokens={() => {
                    addLog('Claiming tokens...');
                    dropToken();
                  }}
                  onStakeTokens={() => {
                    addLog('Staken tokens...');
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
