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
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Resend Email Diagnostics</h3>
            <p className="text-xs text-gray-500">Test live delivery of transactional templates</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Engine Active
        </span>
      </div>

      <form onSubmit={handleSendTest} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Target Email Address (optional - defaults to current admin)
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-sm shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Test
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Result feedback */}
      {result && (
        <div className="mt-4">
          {result.success ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Test email dispatched successfully!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Delivered to <strong>{result.recipient}</strong>. Check your inbox and spam folder.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Dispatch note:</p>
                <p className="text-[11px] text-amber-700 mt-0.5">{result.error}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Ensure <code>RESEND_API_KEY</code> is configured in <code>.env.local</code> and on your hosting provider.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] text-gray-400 flex items-center justify-between">
        <span>Templates: Offers &bull; Escrow &bull; 7-Day Timer &bull; KYC</span>
        <span>Resend API v2</span>
      </div>
    </div>
  )
}
