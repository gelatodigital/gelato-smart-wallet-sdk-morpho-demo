'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {ThemeProvider} from "@/components/theme-provider";
import Header from "@/components/Header";
import AvatarMarketplace from "@/components/AvatarMarketplace";
import TerminalLog from "@/components/TerminalLog";
import {Account} from "@/app/blockchain/account";
import {client} from "@/app/blockchain/config";
import {BaseError} from "viem";

// EIP7702

export default function Home() {
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [logs, setLogs] = useState<(string | JSX.Element)[]>([])
  const [isTerminalOpen, setIsTerminalOpen] = useState(true)

  const { data: account } = Account.useQuery()
  const {data: hash, ...createMutation} = Account.useCreate({
    client,
  })

  // Account Creation with Passkeys
  const loadMutation = Account.useLoad({client})
  const isPending = createMutation.isPending || loadMutation.isPending
  const error = createMutation.error || loadMutation.error

  const addLog = useCallback((message: string | JSX.Element) => {
    setLogs((prevLogs) => [...prevLogs, message])
  }, [])

  const isLoggedIn = useMemo(() => !!account?.address , [account]);

  const handleLogin = useCallback(() => {
    if (!isLoggedIn) {
      addLog('Account creation request initiated by user.')
      createMutation.mutate();
    }
  }, [isLoggedIn, addLog])

  useEffect(() => {
    if (hash) {
      addLog(<>
        Smart contract wallet generated for user.{" "}
        <a href={`https://chess.cloud.blockscout.com/tx/${hash}`} target="_blank"
           className="underline underline-offset-2 hover:opacity-80">open on explorer</a>
      </>)
      addLog('Account setup completed successfully.');
    }
    if (error) {
      addLog(<span className="text-red-400">An error has occurred: {error instanceof BaseError ? error.shortMessage : error.message}</span>);
    }
    setShowLoginDialog(false);
  }, [hash, error]);

  useEffect(() => {
    if (!account) return;
    addLog(<>
      Account connected:{" "}
      <a href={`https://chess.cloud.blockscout.com/address/${account.address}`} target="_blank"
         className="underline underline-offset-2 hover:opacity-80">{account.address}</a>
    </>)
  }, [account])

  console.log(isLoggedIn)

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <main className="min-h-screen bg-[#0B0B1A] text-white">
        <div className="min-h-screen">
          <Header showLoginDialog={showLoginDialog}
                  setShowLoginDialog={setShowLoginDialog} isLoggedIn={isLoggedIn} onLogin={handleLogin} addLog={addLog}
                  walletAddress={account?.address}/>
          <AvatarMarketplace isLoggedIn={isLoggedIn} addLog={addLog}/>
          <TerminalLog logs={logs} isOpen={isTerminalOpen} setIsOpen={setIsTerminalOpen}/>
        </div>
      </main>
    </ThemeProvider>
  )
}

