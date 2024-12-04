import {useState, useCallback, useEffect} from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Confetti from 'react-confetti'
import { ExternalLink, Loader2 } from 'lucide-react'
import {shortenAddress} from "@/app/blockchain/utils"
import {BaseError, encodeFunctionData} from "viem"
import {Account} from "@/app/blockchain/account"
import {client} from "@/app/blockchain/config"
import {useWaitForTransactionReceipt} from "wagmi"
import {Ignis, Tyde} from "@/app/blockchain/contracts"

interface Guardian {
  id: number
  name: string
  image: string
}

interface SingleListing {
  id: number
  type: 'single'
  guardian: Guardian
}

interface BundleListing {
  id: number
  type: 'bundle'
  guardians: [Guardian, Guardian]
}

type Listing = SingleListing | BundleListing

interface AvatarMarketplaceProps {
  isLoggedIn: boolean
  addLog: (value: string | JSX.Element) => void
}

const guardians: Guardian[] = [
  {
    id: 1,
    name: 'Tyde',
    image: 'https://anichess.com/static/media/story-6.50b7eb8fe21bc74b8710.png',
  },
  {
    id: 2,
    name: 'Ignis',
    image: 'https://anichess.com/static/media/story-7.92adc9badf10d5ee1d7f.png',
  },
  {
    id: 3,
    name: 'Tempest',
    image: 'https://anichess.com/static/media/story-8.bbb546d81d8815bb5b28.png',
  },
  {
    id: 4,
    name: 'Acre',
    image: 'https://anichess.com/static/media/story-9.cb77c3ffaec97418604f.png',
  },
]

const listings: Listing[] = [
  {
    id: 1,
    type: 'single',
    guardian: guardians[0],
  },
  {
    id: 2,
    type: 'bundle',
    guardians: [guardians[1], guardians[2]],
  }
]

export default function AvatarMarketplace({ isLoggedIn, addLog }: AvatarMarketplaceProps) {
  const { data: account } = Account.useQuery()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [mintedListing, setMintedListing] = useState<Listing | null>(null)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [transactionHash, setTransactionHash] = useState('')
  const [isMinting, setIsMinting] = useState(false)

  const {
    data: mintHash,
    mutate: executeMint,
    error: mintError,
    ...executeQuery
  } = Account.useExecute({
    client,
  })

  const receiptQuery = useWaitForTransactionReceipt({ hash: mintHash })
  const isSuccess = receiptQuery.isSuccess && executeQuery.isSuccess

  const closeSuccessModal = useCallback(() => {
    setShowSuccessModal(false)
    setMintedListing(null)
    setSelectedListing(null)
    setTransactionHash('')
  }, [])

  const handlePurchase = useCallback((listing: Listing) => {
    if (!isLoggedIn || !account) {
      addLog('User attempted to mint without logging in')
      return
    }
    setIsMinting(true)
    setSelectedListing(listing)

    const avatarName = listing.type === 'single'
      ? listing.guardian.name
      : `${listing.guardians[0].name} + ${listing.guardians[1].name}`

    addLog(`NFT purchase request for "${avatarName}" was initiated by ${shortenAddress(account.address)}.`)

    executeMint({
      account,
      calls: [
        {
          to: Tyde.address,
          data: encodeFunctionData({
            abi: Tyde.abi,
            functionName: 'mint',
            args: [account.address],
          }),
        },
        ...(listing.type === 'bundle' ? [{
          to: Ignis.address,
          data: encodeFunctionData({
            abi: Ignis.abi,
            functionName: 'mint',
            args: [account.address],
          }),
        }] : [])
      ],
    })
  }, [addLog, isLoggedIn, executeMint, account])

  useEffect(() => {
    if (isMinting && account?.address) {
      addLog(`User ${account.address} is minting...`)
    }
  }, [isMinting, account])

  useEffect(() => {
    if (mintError) {
      const errorMessage = mintError instanceof BaseError
        ? mintError.shortMessage
        : (mintError as Error).message
      addLog(<span className="text-red-400">An error has occurred while minting: {errorMessage}</span>)
      setIsMinting(false)
    }
  }, [mintError, addLog])

  useEffect(() => {
    if (isSuccess && transactionHash) {
      addLog(<>
        NFT minted successfully.{" "}
        <a href={`https://chess.cloud.blockscout.com/tx/${transactionHash}`} target="_blank"
           className="underline underline-offset-2 hover:opacity-80">open on explorer</a>
      </>)

      setMintedListing(selectedListing)
      setShowSuccessModal(true)
      setIsMinting(false)
    }
  }, [isSuccess, transactionHash, addLog, selectedListing])

  useEffect(() => {
    if (mintHash) {
      setTransactionHash(mintHash)
    }
  }, [mintHash])

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#2D9CDB] drop-shadow-md">Guardians Marketplace</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-gradient-to-b from-[#1A1B35] to-[#0B0B1A] p-6 rounded-lg text-center shadow-lg transform hover:scale-105 transition-transform duration-200">
            {listing.type === 'single' ? (
              <div>
                <div className="aspect-[16/9] mb-4 overflow-hidden rounded-lg border-4 border-[#2D9CDB] relative">
                  <img
                    src={listing.guardian.image}
                    alt={listing.guardian.name}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{listing.guardian.name}</h3>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {listing.guardians.map((guardian) => (
                    <div key={guardian.id} className="aspect-[16/9] overflow-hidden rounded-lg border-4 border-[#2D9CDB] relative">
                      <img
                        src={guardian.image}
                        alt={guardian.name}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {listing.guardians[0].name} + {listing.guardians[1].name} Bundle
                </h3>
              </div>
            )}
            <Button
              onClick={() => handlePurchase(listing)}
              disabled={!isLoggedIn || isMinting}
              className="bg-[#2D9CDB] text-black hover:bg-[#2D9CDB]/80 transition-colors duration-200 font-semibold px-6 py-2 rounded-full shadow-md w-full"
            >
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                'Mint'
              )}
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showSuccessModal} onOpenChange={closeSuccessModal}>
        <DialogContent className="bg-[#1A1B35] border-2 border-[#2D9CDB]">
          <DialogHeader>
            <DialogTitle className="text-[#2D9CDB]">Congratulations!</DialogTitle>
            <DialogDescription className="text-white">
              You have successfully minted{' '}
              {mintedListing?.type === 'single'
                ? mintedListing.guardian.name
                : mintedListing?.type === 'bundle'
                  ? `${mintedListing.guardians[0].name} and ${mintedListing.guardians[1].name} bundle`
                  : ''}!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {mintedListing?.type === 'single' ? (
              <div className="w-full max-w-md aspect-[16/9] relative rounded-lg border-4 border-[#2D9CDB] overflow-hidden mb-4">
                <img
                  src={mintedListing.guardian.image}
                  alt={mintedListing.guardian.name}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
                />
              </div>
            ) : mintedListing?.type === 'bundle' ? (
              <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-4">
                {mintedListing.guardians.map((guardian) => (
                  <div key={guardian.id} className="aspect-[16/9] relative rounded-lg border-4 border-[#2D9CDB] overflow-hidden">
                    <img
                      src={guardian.image}
                      alt={guardian.name}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
            <p className="text-white mb-2">Transaction Hash:</p>
            {transactionHash && (
              <a
                href={`https://chess.cloud.blockscout.com/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center"
              >
                {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                <ExternalLink className="ml-2 w-4 h-4"/>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          <Confetti/>
        </div>
      )}
    </div>
  )
}