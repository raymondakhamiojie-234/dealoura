'use client'

import { useState, useEffect } from 'react'
import { Clock, ShieldCheck, AlertCircle } from 'lucide-react'

interface EvaluationCountdownProps {
  endsAt?: string | null
  startedAt?: string | null
}

export function EvaluationCountdown({ endsAt, startedAt }: EvaluationCountdownProps) {
  // If endsAt is not set, default to 7 days after startedAt (or 7 days from now)
  const targetDate = endsAt
    ? new Date(endsAt).getTime()
    : startedAt
    ? new Date(startedAt).getTime() + 7 * 24 * 60 * 60 * 1000
    : Date.now() + 7 * 24 * 60 * 60 * 1000

  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })

  useEffect(() => {
    function calculateTime() {
      const difference = targetDate - Date.now()

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false })
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-blue-100 pb-3">
        <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
          <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>7-Day Buyer Evaluation Hold</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
          {timeLeft.isExpired ? 'Hold Complete' : 'Active Cooldown'}
        </span>
      </div>

      {/* Countdown Digital Blocks */}
      {!timeLeft.isExpired ? (
        <div className="grid grid-cols-4 gap-2 text-center py-2">
          <div className="bg-white rounded-xl p-3 border border-blue-100 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">{timeLeft.days}</span>
            <span className="block text-[10px] font-bold text-gray-400 uppercase mt-0.5">Days</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-blue-100 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="block text-[10px] font-bold text-gray-400 uppercase mt-0.5">Hours</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-blue-100 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="block text-[10px] font-bold text-gray-400 uppercase mt-0.5">Mins</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-blue-100 shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-blue-600">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="block text-[10px] font-bold text-gray-400 uppercase mt-0.5">Secs</span>
          </div>
        </div>
      ) : (
        <div className="bg-green-100 text-green-900 p-4 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-700" />
          The 7-day evaluation period has concluded! Escrow Agent can now finalize ownership.
        </div>
      )}

      {/* Instructions Note */}
      <div className="text-xs text-blue-800 space-y-1.5 pt-1">
        <p className="flex items-start">
          <span className="mr-1.5 font-bold">•</span>
          <span>
            <strong>Manager Access Active:</strong> Inspect channel analytics, audience demographics, and verify there are no hidden community guideline strikes.
          </span>
        </p>
        <p className="flex items-start">
          <span className="mr-1.5 font-bold">•</span>
          <span>
            <strong>Platform Rule:</strong> Google/YouTube requires 7 days before primary owner status can be transferred. Funds remain locked safely in escrow.
          </span>
        </p>
      </div>
    </div>
  )
}
