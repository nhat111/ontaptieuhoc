'use client'

import { useEffect } from 'react'
import { formatTime } from '@/lib/utils'

interface Props {
  timeLeft: number
  onTick: (t: number) => void
  stopped: boolean
}

export function QuizTimer({ timeLeft, onTick, stopped }: Props) {
  useEffect(() => {
    if (stopped || timeLeft <= 0) return
    const id = setInterval(() => onTick(timeLeft - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft, stopped, onTick])

  const urgent = timeLeft <= 60
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${urgent ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-700'}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
      </svg>
      {formatTime(timeLeft)}
    </div>
  )
}
