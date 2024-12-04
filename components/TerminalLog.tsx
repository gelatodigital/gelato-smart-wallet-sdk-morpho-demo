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
    <div className={`fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 text-green-400 font-mono text-sm transition-all duration-300 ease-in-out z-[9999] ${isOpen ? 'h-64' : 'h-12'}`}>
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
        <h3 className="text-yellow-400">Onchain Terminal Log</h3>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          size="sm"
          className="text-yellow-400 hover:text-yellow-300"
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

