"use client";

import {useCallback, useEffect, useState} from "react";
import {ThemeProvider} from "@/components/theme-provider";
import Header from "@/components/Header";
import TerminalLog from "@/components/TerminalLog";
import WalletCard from "@/components/WalletCard";


import {createKernelAccount, createKernelAccountClient, KernelAccountClient} from "@zerodev/sdk";

import {ADAPTER_EVENTS, IProvider, WEB3AUTH_NETWORK} from "@web3auth/base";
import {decodeToken, Web3Auth} from "@web3auth/single-factor-auth";

import {PasskeysPlugin} from "@web3auth/passkeys-sfa-plugin";
import {WalletServicesPlugin} from "@web3auth/wallet-services-plugin";
import {EthereumPrivateKeyProvider} from "@web3auth/ethereum-provider";
import {chainConfig} from "@/app/blockchain/config";
import {shouldSupportPasskey} from "@/lib/utils";
import {entryPoint06Address, EntryPointVersion} from "viem/account-abstraction";
import {KERNEL_V2_4} from "@zerodev/sdk/constants";
import {signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {privateKeyToAccount} from "viem/accounts";
import {createPublicClient} from "viem";
import {http} from "wagmi";
import { CredentialResponse, googleLogout } from "@react-oauth/google";
import UserProfile from "@/components/UserProfile";
import {Contract} from "ethers";
import {EmptyState} from "@/components/EmptyState";

interface HomeProps {}

const tokenDetails = {
  address:"0xad78b5C28070b69e6C8f144D4CBaF596d4C3CC92",
  abi:["function drop() external"]
}

const verifier = "w3a-sfa-web-gelato";

export default function Home({}: HomeProps) {
  const [logs, setLogs] = useState<(string | JSX.Element)[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const [isDeployed, setIsDeployed]= useState<boolean>(false);
  const [user,setUser] = useState<any>(null)
  const [kernel, setKernel]= useState<KernelAccountClient | null>(null);
  const [smartAccount,setSmartAccount] = useState<any| null>(null)

  const [web3authSFAuth, setWeb3authSFAuth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [pkPlugin, setPkPlugin] = useState<PasskeysPlugin | null>(null);
  const [wsPlugin, setWsPlugin] = useState<WalletServicesPlugin | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [rpID, setRpID] = useState<string>("");
  const [rpName, setRpName] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(false);

  const addLog = useCallback((message: string | JSX.Element) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  }, []);

  const onSuccess = async (response: CredentialResponse) => {
    try {
      if (!web3authSFAuth) {
        addLog("Web3Auth Single Factor Auth SDK not initialized yet");
        return;
      }
      setIsLoggingIn(true);
      setOpen(false)
      const idToken = response.credential;
      // console.log(idToken);
      if (!idToken) {
        setIsLoggingIn(false);
        return;
      }
      const { payload } = decodeToken(idToken);
      await web3authSFAuth.connect({
        verifier,
        verifierId: (payload as any)?.email,
        idToken: idToken!,
      });

      setIsLoggingIn(false);
      setOpen(false)
      setOpen(false);
    } catch (err) {
      // Single Factor Auth SDK throws an error if the user has already enabled MFA
      // One can use the Web3AuthNoModal SDK to handle this case
      setIsLoggingIn(false);
      setOpen(false)
      console.error(err);
    }
  };

  const loginWithPasskey = async () => {
    try {

      if (!pkPlugin) throw new Error("Passkey plugin not initialized");
      const result = shouldSupportPasskey();
      if (!result.isBrowserSupported) {
        addLog("Browser not supported");
        return;
      }
      await pkPlugin.loginWithPasskey();
      addLog("Passkey logged in successfully");
      setIsLoggingIn(true);
      setOpen(false)
    } catch (error) {
      console.error((error as Error).message);
      addLog((error as Error).message);
    } finally {
      setIsLoggingIn(false);
      setOpen(false)
    }
  };

  const listAllPasskeys = async (pkPlugin:PasskeysPlugin) => {
    if (!pkPlugin) {
      addLog("plugin not initialized yet");
      return;
    }
    const res = await pkPlugin.listAllPasskeys();

    let passkeys = res.map(object=> object.credential_id)
    return passkeys

  };

  const getUserInfo = async (web3authSFAuth:Web3Auth,pkPlugin:PasskeysPlugin) => {
    if (!web3authSFAuth) {
      addLog("Web3Auth Single Factor Auth SDK not initialized yet");
      return;
    }
    const getUserInfo = await web3authSFAuth.getUserInfo();
    let passkeys =  await listAllPasskeys(pkPlugin);

    return { name: getUserInfo.name!, email:getUserInfo.email!, image: getUserInfo?.profileImage, passkeys:passkeys ?? []}
  };

  const logout = async () => {
    if (!web3authSFAuth) {
      addLog("Web3Auth Single Factor Auth SDK not initialized yet");
      return;
    }
    googleLogout();
    await web3authSFAuth.logout();
    window.location.reload();
    return;
  };


  const createKernelObject = async (web3authSFAuth: Web3Auth, pkPlugin:PasskeysPlugin)=> {
    let privatekey = ("0x" +
      (await web3authSFAuth.provider?.request({
        method: "eth_private_key", // use "private_key" for other non-evm chains
      }))) as "0x${string}";
    const _signer = privateKeyToAccount(
      privatekey
    );

    setSigner(_signer)

    const publicClient = createPublicClient({
      transport: http("https://rpc.arb-blueberry.gelato.digital"),
      chain:{
        id: 88153591557,
        network: "blueberry",
        name: "Arbitrum Orbit Blueberry",
        nativeCurrency: {
          name: "CGT",
          symbol: "CGT",
          decimals: 18,
        },
        rpcUrls: {
          public: {
            http: ["https://rpc.arb-blueberry.gelato.digital"],
          },
          default: {
            http: ["https://rpc.arb-blueberry.gelato.digital"],
          },
        },
        blockExplorers: {
          default: {
            name: "Block Scout",
            url: "https://arb-blueberry.gelatoscout.com/",
          },
        },
        contracts: {
        },
        testnet: true,
      },
    });


    const entryPoint = {
      address: entryPoint06Address as any,
      version: "0.6" as EntryPointVersion,
    };

    const kernelVersion = KERNEL_V2_4;
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer:_signer,
      entryPoint,
      kernelVersion,
    });
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion,
    });

    setSmartAccount(account)
    addLog(`Smart account ready to use: ${account?.address}`);
    let deployed = await account.isDeployed()
    addLog(`Account is deployed: ${deployed}`);
    setIsDeployed(deployed)
    const kernelClient = createKernelAccountClient({
      account,
      chain: {
        id: 88153591557,
        network: "blueberry",
        name: "Arbitrum Orbit Blueberry",
        nativeCurrency: {
          name: "CGT",
          symbol: "CGT",
          decimals: 18,
        },
        rpcUrls: {
          public: {
            http: ["https://rpc.arb-blueberry.gelato.digital"],
          },
          default: {
            http: ["https://rpc.arb-blueberry.gelato.digital"],
          },
        },
        blockExplorers: {
          default: {
            name: "Block Scout",
            url: "https://arb-blueberry.gelatoscout.com/",
          },
        },
        contracts: {
        },
        testnet: true,
      },
      bundlerTransport: http(
        "https://api.gelato.digital/bundlers/88153591557/rpc?sponsorApiKey=i8_8EpLHUrFGu4sSbFGHGlXtXcljIuv553g_ItudW4o_"
      ),
    });

    setKernel(kernelClient)

    let user = await getUserInfo(web3authSFAuth, pkPlugin)
    setUser(user as any)

  }

  const registerPasskey = async () => {
    try {
      if (!pkPlugin || !web3authSFAuth) {
        addLog("Plugin not initialized yet");
        return;
      }
      const result = shouldSupportPasskey();
      if (!result.isBrowserSupported) {
        addLog("Browser not supported");
        return;
      }
      const userInfo = await web3authSFAuth?.getUserInfo();
      const res = await pkPlugin.registerPasskey({
        username: `google|${userInfo?.email || userInfo?.name} - ${new Date().toLocaleDateString("en-GB")}`,
      });
      if (res) addLog("Passkey saved successfully");
      let user = await getUserInfo(web3authSFAuth, pkPlugin)
      setUser(user as any);
    } catch (error: unknown) {
      addLog((error as Error).message);
    }
  };

  const dropToken = async(signer:any, account:any, kernel: KernelAccountClient, setStatus:any) => {
    setLoadingTokens(true);
    try {
      const tokenContract: any = new Contract(tokenDetails.address as any, tokenDetails.abi as any, signer)
      const {data} = await tokenContract.drop.populateTransaction()
      const userOpHash = await kernel.sendUserOperation({
        callData: await account.encodeCalls([
          {
            to: tokenDetails.address,
            value: BigInt(0),
            data:  data,
          },
        ]),
        // Gelato-specific configurations
        maxFeePerGas: BigInt(0),
        maxPriorityFeePerGas: BigInt(0),
      });
      addLog(`Tokens claimed successfully! Transaction: ${userOpHash}`);
      addLog("Your tokens will appear in the dashboard once the transaction is indexed (15-30 seconds)");
    } catch (error: any) {
      addLog(`Error claiming tokens: ${typeof error === "string" ? error : error?.message || 'Unknown error occurred'}`);
    } finally {
      setLoadingTokens(false);
    }
  }

  useEffect(() => {
    const init = async () => {
      if (window.location.hostname === "localhost") {
        setRpID("localhost");
        setRpName("localhost");
      } else {
        const hostnameParts = window.location.hostname.split(".");
        if (hostnameParts.length >= 2) {
          setRpID("anichess-social-relay-demo.gelato.network");
          setRpName(window.location.hostname);
        } else {
          setRpID("anichess-social-relay-demo.gelato.network");
          setRpName(window.location.hostname);
        }
      }
      try {
        const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });
        // Initialising Web3Auth Single Factor Auth SDK
        const web3authSfa = new Web3Auth({
          clientId: "BGlfNOldMcUkLHqHiM4HyAEn-Uvq-6RIwvfbjPBCW0YD1TkfaNKGiizmGV6EHnB63RpQS518LOCw0OdfNmyRoa8", // Get your Client ID from Web3Auth Dashboard
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // ["sapphire_mainnet", "sapphire_devnet", "mainnet", "cyan", "aqua", and "testnet"]
          usePnPKey: false, // Setting this to true returns the same key as PnP Web SDK, By default, this SDK returns CoreKitKey.
          privateKeyProvider: ethereumPrivateKeyProvider,
        });
        const plugin = new PasskeysPlugin({
          rpID:"anichess-social-relay-demo.gelato.network",
          rpName,
          buildEnv: "staging",// "production",
        });
        web3authSfa?.addPlugin(plugin);
        setPkPlugin(plugin);
        const wsPlugin = new WalletServicesPlugin({
          walletInitOptions: {
            whiteLabel: {
              logoLight: "https://web3auth.io/images/web3auth-logo.svg",
              logoDark: "https://web3auth.io/images/web3auth-logo.svg",
            },
          },
        });
        web3authSfa?.addPlugin(wsPlugin);
        setWsPlugin(wsPlugin);
        web3authSfa.on(ADAPTER_EVENTS.CONNECTED, (data) => {
          // console.log("sfa:connected", data);
          // console.log("sfa:state", web3authSfa?.state);
          createKernelObject(web3authSfa,plugin)
          setProvider(web3authSfa.provider);
        });
        web3authSfa.on(ADAPTER_EVENTS.DISCONNECTED, () => {
          // console.log("sfa:disconnected");
          setProvider(null);
        });
        await web3authSfa.init();
        setWeb3authSFAuth(web3authSfa);
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-black text-white">
        <div className="relative min-h-screen pb-0">
          <Header
            isLoggedIn={!!user}
            onLogin={() => {
              addLog("Account creation request initiated by user.");
            }}
            addLog={addLog}
            walletAddress={smartAccount?.address}
            onSuccess={onSuccess}
            handleLogout={logout}
            onPasskeyLogin={loginWithPasskey}
            open={open}
            setOpen={setOpen}
          />
          <div className="flex-1 w-full h-full flex flex-col items-center">
            {!user && <EmptyState />}
            {
              !!user && (
                <>
                  <br/>
                  <UserProfile address={smartAccount?.address} user={user} isDeployed={isDeployed} onRegisterPasskey={registerPasskey}/>
                  <WalletCard isLoading={loadingTokens} address={smartAccount?.address} onClaimTokens={() => {
                    addLog("Claiming tokens...");
                    dropToken(signer, smartAccount, kernel as any, () => {
                    })
                  }} />
                </>
              )
            }
          </div>
          <TerminalLog
            logs={logs}
            isOpen={isTerminalOpen}
            setIsOpen={setIsTerminalOpen}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
