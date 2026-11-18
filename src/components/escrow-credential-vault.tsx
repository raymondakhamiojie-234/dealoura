'use client'

import { useState } from 'react'
import { submitAccountCredentials } from '@/app/actions/transactions'
import { Lock, KeyRound, ShieldAlert, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'

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
      <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#010b13] text-[#ebf1f5] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base sm:text-lg font-black text-[#010b13]">Credentials Safely Received by Escrow Agent</h4>
        <p className="text-xs text-[#526371] max-w-md mx-auto leading-relaxed">
          Our specialized escrow inspection desk is verifying account ownership and will securely invite the buyer as manager shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex items-start space-x-3.5 border-b border-[#d2dde4] pb-5">
        <div className="p-3 bg-[#010b13] text-[#ebf1f5] rounded-xl shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#526371] block">Step 2: Vault Hand-Off</span>
          <h3 className="text-base sm:text-lg font-black text-[#010b13] mt-0.5">Secure Account Hand-off to Escrow</h3>
          <p className="text-xs text-[#526371] mt-1 leading-relaxed">
            Buyer funds are verified and locked in the Dealoura Escrow Vault. Submit your temporary access credentials below for inspection.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 text-xs text-red-700 rounded-xl font-medium border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#010b13] uppercase tracking-wider mb-1.5">
            Login Email or Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="account_login"
            required
            placeholder="e.g. channel_admin@gmail.com"
            className="w-full text-xs font-medium rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#010b13] uppercase tracking-wider mb-1.5">
            Current Temporary Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="account_password"
            required
            placeholder="••••••••••••"
            className="w-full text-xs font-mono rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
          />
          <p className="text-[11px] text-[#526371] mt-1">
            Always set a temporary throwaway password before submitting to Escrow.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#010b13] uppercase tracking-wider mb-1.5">
            2FA Backup Codes / Verification PIN <span className="text-[#526371] font-normal normal-case">(Optional)</span>
          </label>
          <input
            type="text"
            name="backup_codes"
            placeholder="e.g. Backup codes: 49302, 19284 or Security question answers"
            className="w-full text-xs font-medium rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#010b13] uppercase tracking-wider mb-1.5">
            Special Hand-off Instructions <span className="text-[#526371] font-normal normal-case">(Optional)</span>
          </label>
          <textarea
            name="instructions"
            rows={2}
            placeholder="Any specific instructions on brand account transfer, primary owner invite timing, or email access..."
            className="w-full text-xs font-medium rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] p-3 focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
          />
        </div>

        <div className="p-3.5 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-[11px] text-[#526371] flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-[#010b13] shrink-0" />
          <span>Only the Dealoura Escrow Officer can decrypt these credentials. They are never shared directly with the buyer until ownership is verified.</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-extrabold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Encrypting & Submitting to Escrow...</span>
          ) : (
            <>
              <Lock className="w-4 h-4 text-[#ebf1f5]" />
              <span>Submit Credentials to Escrow Officer</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
