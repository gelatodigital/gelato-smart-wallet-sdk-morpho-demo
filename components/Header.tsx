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
    // addLog('User clicked Log in.')
    onLogin()
  }

  return (
    <header className="w-full bg-[#101010] py-4 px-8 flex justify-between items-center">
     <div className="flex flex-col md:flex-row gap-x-4 items-start md:items-center">
       <img src="/abc.svg" alt="abc" className="w-[80px] h-[40px]" />
       <span className="text-sm flex flex-row"><span className="mr-4 hidden md:block">|</span>Passkeys & EIP-7702 demo</span>
     </div>
      {!isLoggedIn && (
        <Button onClick={handleLogin} className="bg-[#0cffff] text-black hover:bg-[#0cffff]/80 transition-colors duration-200 font-semibold px-6 py-2 rounded-full">
          Login
        </Button>
      )}
      {isLoggedIn && (
  <div className="flex items-center">
    {/* <span className="text-[#0cffff] font-semibold mr-2">Logged In</span> */}
    {walletAddress && (
      <a target={"_blank"} href={`https://explorer.abc.t.raas.gelato.cloud/address/${walletAddress}`} className="text-white hover:text-[#00AFFA]/80 transition-colors duration-200">
        {shortenAddress(walletAddress)}
      </a>
    )}
  </div>
)}

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-black border-2 border-[#0cffff]">
          <DialogHeader>
            <DialogTitle className="text-[#0cffff]">Logging in...</DialogTitle>
            <DialogDescription className="text-white">
              Please wait while we authenticate your account.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  )
}

