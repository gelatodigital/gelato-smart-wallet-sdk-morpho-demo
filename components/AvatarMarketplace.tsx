import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Confetti from "react-confetti";
import { ExternalLink, Loader2 } from "lucide-react";
import { shortenAddress } from "@/app/blockchain/utils";
import { BaseError, encodeFunctionData } from "viem";
import { Account } from "@/app/blockchain/account";
import { client } from "@/app/blockchain/config";
import { useWaitForTransactionReceipt } from "wagmi";
import { Ignis, Tyde } from "@/app/blockchain/contracts";

interface Guardian {
  id: number;
  name: string;
  image: string;
}

interface SingleListing {
  id: number;
  type: "single";
  guardian: Guardian;
}

interface BundleListing {
  id: number;
  type: "bundle";
  guardians: [Guardian, Guardian];
}

type Listing = SingleListing | BundleListing;

interface AvatarMarketplaceProps {
  isLoggedIn: boolean;
  addLog: (value: string | JSX.Element) => void;
}

const guardians: Guardian[] = [
  {
    id: 1,
    name: "Tyde",
    image: "https://anichess.com/static/media/story-6.50b7eb8fe21bc74b8710.png",
  },
  {
    id: 2,
    name: "Ignis",
    image: "https://anichess.com/static/media/story-7.92adc9badf10d5ee1d7f.png",
  },
  {
    id: 3,
    name: "Tempest",
    image: "https://anichess.com/static/media/story-8.bbb546d81d8815bb5b28.png",
  },
  {
    id: 4,
    name: "Acre",
    image: "https://anichess.com/static/media/story-9.cb77c3ffaec97418604f.png",
  },
];

const listings: Listing[] = [
  {
    id: 1,
    type: "single",
    guardian: guardians[0],
  },
  {
    id: 2,
    type: "bundle",
    guardians: [guardians[1], guardians[2]],
  },
];

export default function AvatarMarketplace({
  isLoggedIn,
  addLog,
}: AvatarMarketplaceProps) {
  const { data: account } = Account.useQuery();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mintedListing, setMintedListing] = useState<Listing | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    data: mintHash,
    mutate: executeMint,
    error: mintError,
    ...executeQuery
  } = Account.useExecute({
    client,
  });

  const receiptQuery = useWaitForTransactionReceipt({ hash: mintHash });
  const isSuccess = receiptQuery.isSuccess && executeQuery.isSuccess;

  const closeSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    setMintedListing(null);
    setSelectedListing(null);
    setTransactionHash("");
  }, []);

  const handlePurchase = useCallback(
    (listing: Listing) => {
      if (!isLoggedIn || !account) {
        addLog("User attempted to mint without logging in");
        return;
      }
      setIsMinting(true);
      setSelectedListing(listing);

      const avatarName =
        listing.type === "single"
          ? listing.guardian.name
          : `${listing.guardians[0].name} + ${listing.guardians[1].name}`;

      addLog(
        `NFT purchase request for "${avatarName}" was initiated by ${shortenAddress(
          account.address
        )}.`
      );

      executeMint({
        account,
        calls: [
          {
            to: Tyde.address,
            data: encodeFunctionData({
              abi: Tyde.abi,
              functionName: "mint",
              args: [account.address],
            }),
          },
          ...(listing.type === "bundle"
            ? [
                {
                  to: Ignis.address,
                  data: encodeFunctionData({
                    abi: Ignis.abi,
                    functionName: "mint",
                    args: [account.address],
                  }),
                },
              ]
            : []),
        ],
      });
    },
    [addLog, isLoggedIn, executeMint, account]
  );

  useEffect(() => {
    if (isMinting && account?.address) {
      addLog(`User ${account.address} is minting...`);
    }
  }, [isMinting, account]);

  useEffect(() => {
    if (mintError) {
      const errorMessage =
        mintError instanceof BaseError
          ? mintError.shortMessage
          : (mintError as Error).message;
      addLog(
        <span className="text-red-400">
          An error has occurred while minting: {errorMessage}
        </span>
      );
      setIsMinting(false);
    }
  }, [mintError, addLog]);

  useEffect(() => {
    if (isSuccess && transactionHash) {
      addLog(
        <>
          NFT minted successfully.{" "}
          <a
            href={`https://chess.cloud.blockscout.com/tx/${transactionHash}`}
            target="_blank"
            className="underline underline-offset-2 hover:opacity-80"
          >
            open on explorer
          </a>
        </>
      );

      setMintedListing(selectedListing);
      setShowSuccessModal(true);
      setIsMinting(false);
    }
  }, [isSuccess, transactionHash, addLog, selectedListing]);

  useEffect(() => {
    if (mintHash) {
      setTransactionHash(mintHash);
    }
  }, [mintHash]);

  return (
    <div className="p-8 bg-black w-full max-w-[1200px]">
      <h2 className="text-2xl font-bold mb-8 text-center text-white drop-shadow-md">
        Guardians Marketplace
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="w-full bg-[#101010] p-8 rounded-lg text-center shadow-lg transform hover:scale-105 transition-transform duration-200 flex flex-col h-full"
          >
            {listing.type === "single" ? (
              <div>
                <div className="w-full h-[325px] mb-8 overflow-hidden rounded-lg border-4 border-[#00AFFA] relative bg-black">
                  <img
                    src={listing.guardian.image}
                    alt={listing.guardian.name}
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-8 text-white">
                  {listing.guardian.name}
                </h3>
              </div>
            ) : (
              <div>
                <div
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="w-full h-[325px] mb-8"
                >
                  <div className="relative w-full h-full">
                    {listing.guardians.map((guardian, index) => (
                      <div
                        key={guardian.id}
                        className={`
                        h-[325px]
                        overflow-hidden 
                        rounded-lg 
                        border-4 
                        border-[#00AFFA] 
                        absolute 
                        w-full
                        transition-all 
                        duration-500
                        bg-black
                        ${
                          isHovered
                            ? index === 0
                              ? "z-10 translate-x-4 translate-y-4"
                              : "z-20 -translate-x-4 -translate-y-4"
                            : index === 0
                            ? "z-20 -translate-x-4 -translate-y-4"
                            : "z-10 translate-x-4 translate-y-4"
                        }
                      `}
                      >
                        <img
                          src={guardian.image}
                          alt={guardian.name}
                          className="w-full h-full object-contain bg-black"
                        />
                      </div>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold mb-8 text-white text-center mt-8">
                    {listing.guardians[0].name} + {listing.guardians[1].name}{" "}
                    Bundle
                  </h3>
                </div>
              </div>
            )}
            <Button
              onClick={() => handlePurchase(listing)}
              disabled={!isLoggedIn || isMinting}
              className="bg-[#00AFFA] text-black hover:bg-[#00AFFA]/80 transition-colors duration-200 font-semibold px-6 py-2 rounded-full shadow-md w-full mt-auto"
            >
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : listing.type === "single" ? (
                "Mint NFT"
              ) : (
                "Mint NFTs"
              )}
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showSuccessModal} onOpenChange={closeSuccessModal}>
        <DialogContent className="bg-[#1A1B35] border-2 border-[#00AFFA] z-[99999]">
          <DialogHeader>
            <DialogTitle className="text-[#00AFFA]">
              Congratulations!
            </DialogTitle>
            <DialogDescription className="text-white">
              You have successfully minted{" "}
              {mintedListing?.type === "single"
                ? mintedListing.guardian.name
                : mintedListing?.type === "bundle"
                ? `${mintedListing.guardians[0].name} and ${mintedListing.guardians[1].name} bundle`
                : ""}
              !
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {mintedListing?.type === "single" ? (
              <div className="w-full max-w-md aspect-[16/9] relative rounded-lg border-4 border-[#00AFFA] overflow-hidden mb-4">
                <img
                  src={mintedListing.guardian.image}
                  alt={mintedListing.guardian.name}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
                />
              </div>
            ) : mintedListing?.type === "bundle" ? (
              <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-4">
                {mintedListing.guardians.map((guardian) => (
                  <div
                    key={guardian.id}
                    className="aspect-[16/9] relative rounded-lg border-4 border-[#00AFFA] overflow-hidden"
                  >
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
                <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          <Confetti />
        </div>
      )}
    </div>
  );
}
