import { useMutation, useQuery as useQuery_ } from '@tanstack/react-query'
import {
  type Address,
  type Hex,
  type PrivateKeyAccount,
  bytesToHex,
  concat,
  encodePacked,
  hexToBytes,
  keccak256,
  parseSignature,
  size,
  slice,
} from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from 'viem/actions'
import { signAuthorization } from 'viem/experimental'
import {
  type PublicKey,
  createCredential,
  parsePublicKey,
  sign,
} from 'webauthn-p256'
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import "ethers";
import { chess, type Client, queryClient } from './config'
import { ExperimentDelegation } from './contracts'
import { ethers } from 'ethers'
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

export namespace Account {
  /////////////////////////////////////////////////////////
  // Types
  /////////////////////////////////////////////////////////

  export type Account = {
    address: Address
    authTransactionHash?: Hex
    key: {
      id: string
      publicKey: {
        x: bigint
        y: bigint
      }
    }
  }

  export type Calls = { to: Address; value?: bigint; data?: Hex }[]

  /////////////////////////////////////////////////////////
  // Actions
  /////////////////////////////////////////////////////////

  /**
   * Generates a new EOA and injects the ExperimentDelegation contract onto it
   * with an authorized WebAuthn public key.
   */
  export async function create({ client }: { client: Client }) {
    const chainConfi2 = {
      chainId: "0xaa36a7",
      displayName: "Ethereum Sepolia Testnet",
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      tickerName: "Ethereum",
      ticker: "ETH",
      decimals: 18,
      rpcTarget: "https://rpc.ankr.com/eth_sepolia",
      blockExplorerUrl: "https://sepolia.etherscan.io",
      logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    };
  
    const web3auth = new Web3Auth({
      clientId:
        "BFolnrXUpJ8WScbI0MHGllgsP4Jgyy9tuAyfd4rLJ0d07b1iGMhZw3Eu2E10HECY2KIqYczag4_Z4q7KsEojUWU", // get it from Web3Auth Dashboard
      web3AuthNetwork: "sapphire_devnet",
      chainConfig:  {
        chainNamespace: "eip155",
        chainId: ethers.toBeHex(chess.id),
        rpcTarget: chess.rpcUrls.default.http[0],
        // Avoid using public rpcTarget in production.
        // Use services like Infura, Quicknode etc
        displayName: chess.name as string,
        blockExplorer: chess.blockExplorers.default.url,
        ticker: "ETH",
        tickerName: "ETH",
      }
    });
    await web3auth!.initModal({
      modalConfig: {
       
         // Disable TORUS
         [WALLET_ADAPTERS.TORUS_EVM]: {
          label: "torus",
          showOnModal: false,
        },
      },
    });
 
    const web3authProvider = await web3auth!.connect();
    let privatekey = ("0x" +
      (await web3auth.provider?.request({
        method: "eth_private_key", // use "private_key" for other non-evm chains
      }))) as "0x${string}";
    const account = privateKeyToAccount(privatekey)

    // Create a WebAuthn credential which will be used as an authorized key
    // for the EOA.
    const credential = await createCredential({
      user: {
        name: `Example Delegation (${truncate(account.address)})`,
        id: hexToBytes(account.address),
      },
    })

    const publicKey = parsePublicKey(credential.publicKey)

    // Authorize the WebAuthn key on the EOA.
    const hash = await authorize({
      account,
      client,
      publicKey,
    })

    await waitForTransactionReceipt(client, { hash })

    queryClient.setQueryData(['account'], {
      address: account.address,
      authTransactionHash: hash,
      key: {
        id: credential.id,
        publicKey,
      },
    })

    return hash
  }

  /**
   * Authorizes a WebAuthn public key on an EOA by sending an EIP-7702 authorization
   * transaction to inject the ExperimentDelegation contract onto it.
   */
  export async function authorize({
                                    account,
                                    client,
                                    publicKey,
                                  }: { account: PrivateKeyAccount; client: Client; publicKey: PublicKey }) {
    const nonce = BigInt(0) // initial nonce will always be 0
    const expiry = BigInt(0) // no expiry

    // Compute digest to sign for the authorize function.
    const digest = keccak256(
      encodePacked(
        ['uint256', 'uint256', 'uint256', 'uint256'],
        [nonce, publicKey.x, publicKey.y, expiry],
      ),
    )

    // Sign the authorize digest and parse signature to object format required by
    // the contract.
    const signature = parseSignature(await account.sign({ hash: digest }))

    // Sign an EIP-7702 authorization to inject the ExperimentDelegation contract
    // onto the EOA.
    const authorization = await signAuthorization(client, {
      account,
      contractAddress: ExperimentDelegation.address,
      delegate: true,
    })

    // Send an EIP-7702 contract write to authorize the WebAuthn key on the EOA.
    const hash = await writeContract(client, {
      abi: ExperimentDelegation.abi,
      address: account.address,
      functionName: 'authorize',
      args: [
        {
          x: publicKey.x,
          y: publicKey.y,
        },
        expiry,
        {
          r: BigInt(signature.r),
          s: BigInt(signature.s),
          yParity: signature.yParity,
        },
      ],
      authorizationList: [authorization],
      account: null, // defer to sequencer to fill
    })

    return hash
  }

  /**
   * Imports an existing EOA that holds an authorized WebAuthn public key
   * into account state.
   */
  export async function load({ client }: { client: Client }) {
    // Sign an empty hash to extract the user's WebAuthn credential.
    const { raw } = await sign({
      hash: '0x',
    })

    // Extract the EOA address from the WebAuthn user handle.
    const response = raw.response as AuthenticatorAssertionResponse
    const address = bytesToHex(new Uint8Array(response.userHandle!))

    // Extract the authorized WebAuthn key from the delegated EOA's contract.
    const [, , publicKey] = await readContract(client, {
      address,
      abi: ExperimentDelegation.abi,
      functionName: 'keys',
      args: [BigInt(0)],
    })

    queryClient.setQueryData(['account'], {
      address,
      delegation: ExperimentDelegation.address,
      key: {
        id: raw.id,
        publicKey,
      },
    })
  }

  /**
   * Executes calls with the delegated EOA's WebAuthn credential.
   */
  export async function execute({
                                  account,
                                  calls,
                                  client,
                                }: {
    account: Account
    calls: Calls
    client: Client
  }) {
    // Fetch the next available nonce from the delegated EOA's contract.
    let nonce = await readContract(client, {
      abi: ExperimentDelegation.abi,
      address: account.address,
      functionName: 'nonce',
    })

    // Encode calls into format required by the contract.
    const calls_encoded = concat(
      calls.map((call) =>
        encodePacked(
          ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
          [
            0,
            call.to,
            call.value ?? BigInt(0),
            BigInt(size(call.data ?? '0x')),
            call.data ?? '0x',
          ],
        ),
      ),
    )


    // Compute digest to sign for the execute function.
    const digest = keccak256(
      encodePacked(['uint256', 'bytes'], [nonce, calls_encoded]),
    )

    // Sign the digest with the authorized WebAuthn key.
    const { signature, webauthn } = await sign({
      hash: digest,
      credentialId: account.key.id,
    })

    // Extract r and s values from signature.
    const r = BigInt(slice(signature, 0, 32))
    const s = BigInt(slice(signature, 32, 64))
    const mintCalls =  calls.map((call) =>{ return  { target: call.to as  `0x${string}`, callData:call.data as  `0x${string}`}} )


    //Execute calls.
    // let hash =  await writeContract(client, {
    //   abi: ExperimentDelegation.abi,
    //   address: account.address,
    //   functionName: 'execute',
    //   args: [calls_encoded,{ r, s }, webauthn, 0],
    //   account: null, // defer to sequencer to fill
    // })

    //   const mintCalls =  calls.map((call) =>{ return  { target: call.to as  `0x${string}`, callData:call.data as  `0x${string}`}} )

    //   console.log(mintCalls)

    let hash =  await writeContract(client, {
      abi: ExperimentDelegation.abi,
      address: account.address,
      functionName: 'aggregate',
      args: [mintCalls],
      account: null, // defer to sequencer to fill
    })

    // let hash = await writeContract(client, {
    //   abi: ExperimentDelegation.abi,
    //   address: account.address,
    //   functionName: "forward",
    //   args: [account.address],
    //   account: null, // defer to sequencer to fill
    // });


    let rec = await waitForTransactionReceipt(client, { hash });
    return hash
  }

  /////////////////////////////////////////////////////////
  // Query
  /////////////////////////////////////////////////////////

  const queryKey = ['account']

  export function useQuery() {
    return useQuery_<Account>({ queryKey })
  }

  export function useCreate({ client }: { client: Client }) {
    return useMutation({
      mutationFn: async () => await create({ client }),
    })
  }

  export function useExecute({ client }: { client: Client }) {
    return useMutation({
      mutationFn: async ({
                           account,
                           calls,
                         }: {
        account: Account
        calls: Calls
      }) => await execute({ account, calls, client }),
    })
  }

  export function useLoad({ client }: { client: Client }) {
    return useMutation({
      mutationFn: async () => await load({ client }),
    })
  }
}

function truncate(
  str: string,
  { start = 8, end = 6 }: { start?: number; end?: number } = {},
) {
  if (str.length <= start + end) return str
  return `${str.slice(0, start)}\u2026${str.slice(-end)}`
}
