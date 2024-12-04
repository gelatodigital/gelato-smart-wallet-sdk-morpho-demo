import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog'
import {shortenAddress} from "@/app/blockchain/utils";

interface HeaderProps {
  isLoggedIn: boolean
  onLogin: () => void
  addLog: (message: string) => void
  walletAddress?: string
  setShowLoginDialog: (value: boolean) => void;
  showLoginDialog: boolean;
}

export default function Header({ isLoggedIn, onLogin, addLog, walletAddress, setShowLoginDialog, showLoginDialog }: HeaderProps) {

  const handleLogin = () => {
    setShowLoginDialog(true)
    addLog('User clicked Log in.')
    onLogin()
  }

  return (
    <header className="bg-[#1A1B35] p-4 flex justify-between items-center">
      <h1 className="text-4xl font-bold text-[#2D9CDB]">Anichess</h1>
      {!isLoggedIn && (
        <Button onClick={handleLogin} className="bg-[#2D9CDB] text-white hover:bg-[#2D9CDB]/80 transition-colors duration-200 font-semibold px-6 py-2 rounded-full">
          Login
        </Button>
      )}
      {isLoggedIn && (
  <div className="flex items-center">
    <span className="text-green-400 font-semibold mr-2">Logged In</span>
    {walletAddress && (
      <a target={"_blank"} href={`https://chess.cloud.blockscout.com/address/${walletAddress}`} className="text-[#2D9CDB] hover:text-[#2D9CDB]/80 transition-colors duration-200">
        {shortenAddress(walletAddress)}
      </a>
    )}
  </div>
)}

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-[#1A1B35] border-2 border-[#2D9CDB]">
          <DialogHeader>
            <DialogTitle className="text-[#2D9CDB]">Logging in...</DialogTitle>
            <DialogDescription className="text-white">
              Please wait while we authenticate your account.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  )
}

