'use client'

import { useState } from 'react'
import { submitAccountCredentials } from '@/app/actions/transactions'
import { Lock, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react'

export function EscrowCredentialVault({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('transactionId', transactionId)

    const result = await submitAccountCredentials(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setIsSuccess(true)
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
        <h4 className="text-base font-bold text-green-900">Credentials Received by Escrow Agent!</h4>
        <p className="text-xs text-green-700">
          Our team is currently verifying account ownership and will invite the buyer as a manager shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-blue-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-start space-x-3 border-b border-gray-100 pb-4">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Secure Account Hand-off to Escrow</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Buyer funds are locked in Escrow. Please submit access credentials for verification.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-xs text-red-700 rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Login Email or Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="account_login"
            required
            placeholder="e.g. channel_admin@gmail.com"
            className="w-full text-sm rounded-xl border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Current Temporary Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="account_password"
            required
            placeholder="••••••••••••"
            className="w-full text-sm rounded-xl border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            2FA Backup Codes / Verification PIN <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="backup_codes"
            placeholder="e.g. Backup codes: 49302, 19284 or Security question answers"
            className="w-full text-sm rounded-xl border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Additional Instructions for Agent <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Any specific instructions (e.g. 'Invite buyer email buyer@example.com as Brand Manager')"
            className="w-full text-sm rounded-xl border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            These credentials are encrypted and accessible strictly by authorized Dealoura Escrow agents. Never send login credentials in open chat.
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-sm disabled:opacity-50"
        >
          {loading ? 'Submitting to Escrow...' : 'Submit Credentials to Escrow Agent'}
        </button>
      </form>
    </div>
  )
}
