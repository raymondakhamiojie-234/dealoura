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
    <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#d2dde4] pb-4">
        <div className="flex items-center space-x-2.5 text-[#010b13]">
          <div className="w-8 h-8 rounded-lg bg-[#010b13] text-[#ebf1f5] flex items-center justify-center">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-sm block tracking-tight">7-Day Mandatory Evaluation Hold</span>
            <span className="text-[11px] text-[#526371]">Funds remain securely locked in the Dealoura Escrow Vault</span>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
          {timeLeft.isExpired ? 'Hold Complete' : 'Active Cooldown'}
        </span>
      </div>

      {/* Countdown Digital Blocks */}
      {!timeLeft.isExpired ? (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
          <div className="bg-[#ebf1f5] rounded-xl p-3 sm:p-4 border border-[#d2dde4]">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#010b13]">{timeLeft.days}</span>
            <span className="block text-[10px] font-bold text-[#526371] uppercase tracking-wider mt-1">Days</span>
          </div>
          <div className="bg-[#ebf1f5] rounded-xl p-3 sm:p-4 border border-[#d2dde4]">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#010b13]">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="block text-[10px] font-bold text-[#526371] uppercase tracking-wider mt-1">Hours</span>
          </div>
          <div className="bg-[#ebf1f5] rounded-xl p-3 sm:p-4 border border-[#d2dde4]">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#010b13]">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="block text-[10px] font-bold text-[#526371] uppercase tracking-wider mt-1">Mins</span>
          </div>
          <div className="bg-[#ebf1f5] rounded-xl p-3 sm:p-4 border border-[#d2dde4]">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#010b13]">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="block text-[10px] font-bold text-[#526371] uppercase tracking-wider mt-1">Secs</span>
          </div>
        </div>
      ) : (
        <div className="bg-[#010b13] text-[#ebf1f5] p-5 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#ebf1f5]" />
          <span>The 7-day evaluation hold has concluded. The Escrow Agent can now transfer primary ownership and release seller payout.</span>
        </div>
      )}

      {/* Instructions Note */}
      <div className="bg-[#ebf1f5] p-4 rounded-xl text-xs text-[#526371] flex items-start space-x-2.5 border border-[#d2dde4]">
        <ShieldCheck className="w-4 h-4 text-[#010b13] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#010b13]">Buyer Protection Rule:</strong> YouTube and major digital platforms enforce a mandatory 7-day waiting period before a newly added manager can be promoted to Primary Owner. Dealoura holds 100% of the funds in the escrow vault until this period completes safely.
        </p>
      </div>
    </div>
  )
}
