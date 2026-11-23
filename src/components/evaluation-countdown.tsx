'use client'

import { useState, useEffect } from 'react'
import { Clock, ShieldCheck, AlertCircle, Video, Smartphone } from 'lucide-react'

interface EvaluationCountdownProps {
  endsAt?: string | null
  startedAt?: string | null
  platform?: string | null
  holdDurationMinutes?: number | null
  onExpire?: () => void
}

export function EvaluationCountdown({
  endsAt,
  startedAt,
  platform,
  holdDurationMinutes,
  onExpire,
}: EvaluationCountdownProps) {
  const isYouTube = platform?.toLowerCase().includes('youtube') || (holdDurationMinutes && holdDurationMinutes >= 1440)
  
  // Default duration in ms: 7 Days for YouTube, 15 Minutes for all other platforms
  const defaultDurationMs = isYouTube 
    ? 7 * 24 * 60 * 60 * 1000 
    : 15 * 60 * 1000

  const targetDate = endsAt
    ? new Date(endsAt).getTime()
    : startedAt
    ? new Date(startedAt).getTime() + defaultDurationMs
    : Date.now() + defaultDurationMs

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
        if (onExpire) onExpire()
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
  }, [targetDate, onExpire])

  return (
    <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#d2dde4] pb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-3 text-[#010b13]">
          <div className="w-10 h-10 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center shrink-0">
            {isYouTube ? (
              <Video className="w-5 h-5 text-red-500" />
            ) : (
              <Clock className="w-5 h-5 animate-pulse text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight block">
                {isYouTube ? '7-Day YouTube Primary Ownership Hold' : '15-Minute Fast Credential Inspection'}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                {platform || 'Social Asset'}
              </span>
            </div>
            <p className="text-xs text-[#526371] mt-0.5 leading-relaxed">
              {isYouTube
                ? 'Google policy mandates a 7-day manager window before full primary channel ownership is granted.'
                : 'Inspect account credentials, update recovery phone/email, and verify analytics before automatic escrow release.'}
            </p>
          </div>
        </div>

        <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
          timeLeft.isExpired 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            : 'bg-[#ebf1f5] text-[#010b13] border-[#d2dde4]'
        }`}>
          {timeLeft.isExpired ? 'Inspection Complete' : 'Active Cooldown'}
        </span>
      </div>

      {/* Countdown Digital Blocks */}
      {!timeLeft.isExpired ? (
        <div className={`grid gap-2.5 sm:gap-3 text-center ${
          isYouTube ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4'
        }`}>
          {isYouTube && (
            <div className="bg-[#ebf1f5] rounded-xl p-3 sm:p-4 border border-[#d2dde4]">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#010b13]">{timeLeft.days}</span>
              <span className="block text-[10px] font-bold text-[#526371] uppercase tracking-wider mt-1">Days</span>
            </div>
          )}
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
        <div className="bg-[#010b13] text-[#ebf1f5] p-5 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2.5 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Evaluation hold has concluded with no active disputes. Funds are ready for payout release.</span>
        </div>
      )}
    </div>
  )
}
