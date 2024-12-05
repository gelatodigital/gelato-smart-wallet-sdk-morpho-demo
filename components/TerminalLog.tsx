import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface TerminalLogProps {
  logs: (string | JSX.Element)[]
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

export default function TerminalLog({ logs, isOpen, setIsOpen }: TerminalLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isOpen])

  return (
    <div onClick={() => setIsOpen(!isOpen)} className={`fixed ${isOpen ? 'bottom-0' : 'bottom-3'}  left-0 right-0 bg-black bg-opacity-80 text-green-400 font-mono text-sm transition-all duration-300 ease-in-out z-[9999] cursor-pointer ${isOpen ? 'md:h-64' : 'h-14'} border-t-[1px] border-t-white/15`}>
      <div className="flex justify-between items-center px-8 py-4 bg-[#101010]">
        <h3 className="text-white">Logs</h3>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          size="sm"
          className="text-white hover:text-[#00AFFA]"
        >
          {isOpen ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>
      <div className={`p-4 overflow-y-auto ${isOpen ? 'h-52' : 'h-0'}`}>
        {logs?.map((log: string | JSX.Element, index: number) => (
          <p key={index} className="mb-1">
            <span className="text-blue-400">[{new Date().toISOString()}]</span> {log}
          </p>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}

