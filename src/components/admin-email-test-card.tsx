'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { sendTestEmailAction } from '@/app/actions/admin'

export function AdminEmailTestCard() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; recipient?: string; error?: string } | null>(null)

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await sendTestEmailAction(email || undefined)
      setResult(res)
    } catch (err: any) {
      setResult({ error: err.message || 'Failed to dispatch test email' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#d2dde4] shadow-xs space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010b13] text-[#ebf1f5] rounded-xl">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#010b13]">Transactional Email Diagnostics</h3>
            <p className="text-xs text-[#526371]">Test live delivery of escrow notifications and receipt templates</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
          Engine Ready
        </span>
      </div>

      <form onSubmit={handleSendTest} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-[#010b13] mb-1.5 uppercase tracking-wider">
            Target Email Address <span className="text-[#526371] font-normal normal-case">(Defaults to current admin)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@dealoura.com"
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition disabled:opacity-50 shadow-xs shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Test Email
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Result feedback */}
      {result && (
        <div className="mt-3">
          {result.success ? (
            <div className="p-3.5 bg-[#ebf1f5] border border-[#d2dde4] rounded-xl flex items-start gap-2.5 text-xs text-[#010b13]">
              <CheckCircle2 className="w-4 h-4 text-[#010b13] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Test email dispatched successfully!</p>
                <p className="text-[11px] text-[#526371] mt-0.5">
                  Delivered to <strong>{result.recipient}</strong>. Check inbox and spam folders.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Delivery Notice:</p>
                <p className="text-[11px] text-amber-800 mt-0.5">{result.error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
