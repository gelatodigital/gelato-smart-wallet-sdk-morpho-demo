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
    <header className="w-full bg-[#1A1B35] p-4 flex justify-between items-center">
      <img src="/anichess.svg" alt="Anichess" className="w-[163px] h-[40px]" />
      {!isLoggedIn && (
        <Button onClick={handleLogin} className="bg-[#00AFFA] text-black hover:bg-[#00AFFA]/80 transition-colors duration-200 font-semibold px-6 py-2 rounded-full">
          Login
        </Button>
      )}
      {isLoggedIn && (
  <div className="flex items-center">
    <span className="text-[#00AFFA] font-semibold mr-2">Logged In</span>
    {walletAddress && (
      <a target={"_blank"} href={`https://chess.cloud.blockscout.com/address/${walletAddress}`} className="text-white hover:text-[#00AFFA]/80 transition-colors duration-200">
        {shortenAddress(walletAddress)}
      </a>
    )}
  </div>
)}

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-[#1A1B35] border-2 border-[#00AFFA]">
          <DialogHeader>
            <DialogTitle className="text-[#00AFFA]">Logging in...</DialogTitle>
            <DialogDescription className="text-white">
              Please wait while we authenticate your account.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  )
}

