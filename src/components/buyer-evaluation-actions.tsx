'use client'

import { useState } from 'react'
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  X, 
  Upload, 
  ArrowRight,
  FileText,
  Clock
} from 'lucide-react'
import { EvaluationCountdown } from './evaluation-countdown'
import { buyerAcceptAndRelease, buyerOpenDispute } from '@/app/actions/transactions'

interface BuyerEvaluationActionsProps {
  transactionId: string
  isBuyer: boolean
  agreedPrice: number
  platform?: string | null
  endsAt?: string | null
  startedAt?: string | null
  holdDurationMinutes?: number | null
  sellerPayoutStatus?: string | null
}

export function BuyerEvaluationActions({
  transactionId,
  isBuyer,
  agreedPrice,
  platform,
  endsAt,
  startedAt,
  holdDurationMinutes,
  sellerPayoutStatus,
}: BuyerEvaluationActionsProps) {
  const [isExpired, setIsExpired] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Checklist state for release
  const [check1, setCheck1] = useState(false)
  const [check2, setCheck2] = useState(false)
  const [check3, setCheck3] = useState(false)
  const canRelease = check1 && check2 && check3

  // Dispute form state
  const [disputeCategory, setDisputeCategory] = useState('invalid_credentials')
  const [disputeDescription, setDisputeDescription] = useState('')
  const [evidenceFileName, setEvidenceFileName] = useState<string | null>(null)

  const handleRelease = async () => {
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res: any = await buyerAcceptAndRelease(transactionId)
      if (res?.error) {
        setErrorMsg(res.error)
        setSubmitting(false)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to release escrow funds.')
      setSubmitting(false)
    }
  }

  const handleDisputeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    const formData = new FormData(e.currentTarget)
    formData.append('transactionId', transactionId)

    try {
      const res = await buyerOpenDispute(formData)
      if (res?.error) {
        setErrorMsg(res.error)
        setSubmitting(false)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to open dispute.')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 1. Live Platform-Specific Countdown Display */}
      <EvaluationCountdown
        endsAt={endsAt}
        startedAt={startedAt}
        platform={platform}
        holdDurationMinutes={holdDurationMinutes}
        onExpire={() => setIsExpired(true)}
      />

      {/* 2. Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Action Cards based on User Role */}
      {isBuyer ? (
        <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#010b13] text-[#ebf1f5]">
                Buyer Production Controls
              </span>
              <h3 className="text-base font-black text-[#010b13] mt-1">Inspection Window Verdict</h3>
              <p className="text-xs text-[#526371] mt-0.5">
                Once satisfied with the account transfer, you can release the funds to the seller early, or report any issue.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Release Early Button */}
            <button
              type="button"
              onClick={() => setShowReleaseModal(true)}
              className="py-3 px-4 rounded-xl bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Accept &amp; Release Funds Early</span>
            </button>

            {/* Open Dispute Button */}
            <button
              type="button"
              onClick={() => setShowDisputeModal(true)}
              className="py-3 px-4 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Report Issue / Open Dispute</span>
            </button>
          </div>
        </div>
      ) : (
        /* Seller View */
        <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#010b13]">
            <Clock className="w-4 h-4 text-[#526371]" />
            <span>Seller Custody Status</span>
          </div>
          <p className="text-xs text-[#526371] leading-relaxed">
            The buyer is actively reviewing your handed-over credentials. The escrow vault will automatically release your payout of <strong>${agreedPrice}</strong> when the inspection timer elapses or as soon as the buyer accepts.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EARLY RELEASE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 bg-[#010b13]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowReleaseModal(false)}
              className="absolute top-4 right-4 text-[#526371] hover:text-[#010b13]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#010b13]">Confirm Account Acceptance</h4>
                <p className="text-xs text-[#526371]">Release ${agreedPrice} USD from escrow to seller</p>
              </div>
            </div>

            <p className="text-xs text-[#526371] leading-relaxed">
              Before authorizing fund release, please verify that you have taken full ownership of the digital asset:
            </p>

            <div className="space-y-3 p-4 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={check1}
                  onChange={(e) => setCheck1(e.target.checked)}
                  className="mt-0.5 rounded border-[#d2dde4] text-[#010b13] focus:ring-0"
                />
                <span className="text-[#010b13] font-medium">
                  I have successfully logged into the account and changed the primary password.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={check2}
                  onChange={(e) => setCheck2(e.target.checked)}
                  className="mt-0.5 rounded border-[#d2dde4] text-[#010b13] focus:ring-0"
                />
                <span className="text-[#010b13] font-medium">
                  I have updated recovery email/phone numbers and removed previous 2FA devices.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={check3}
                  onChange={(e) => setCheck3(e.target.checked)}
                  className="mt-0.5 rounded border-[#d2dde4] text-[#010b13] focus:ring-0"
                />
                <span className="text-[#010b13] font-medium">
                  I verified audience statistics, monetization standing, and confirmed zero copyright strikes.
                </span>
              </label>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleRelease}
                disabled={!canRelease || submitting}
                className="flex-1 py-3 px-4 rounded-xl bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-bold text-xs uppercase tracking-wider transition disabled:opacity-40 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {submitting ? (
                  <span>Authorizing Release...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Authorize Payout to Seller</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowReleaseModal(false)}
                className="py-3 px-4 rounded-xl border border-[#d2dde4] text-xs font-bold text-[#526371] hover:bg-[#ebf1f5] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OPEN ESCROW DISPUTE MODAL */}
      {/* ========================================================================= */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-[#010b13]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowDisputeModal(false)}
              className="absolute top-4 right-4 text-[#526371] hover:text-[#010b13]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#010b13]">Open Escrow Dispute Ticket</h4>
                <p className="text-xs text-[#526371]">Locks all funds and initiates formal compliance audit</p>
              </div>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  Dispute Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  className="w-full text-xs font-bold rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-white outline-none transition"
                >
                  <option value="invalid_credentials">Invalid Credentials / Cannot Log In</option>
                  <option value="strike_or_demonetized">Account Has Copyright Strikes or Demonetized</option>
                  <option value="bot_or_metric_drop">Audience is Botted / Major Drop in Followers</option>
                  <option value="seller_recovery_attempt">Seller Attempted to Reclaim Account</option>
                  <option value="other">Other Violation of Listing Terms</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  Detailed Explanation <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  rows={4}
                  required
                  placeholder="Explain exactly what happened, when you attempted to access the asset, and what error you encountered..."
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] p-3 focus:border-[#010b13] focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  Screenshot Evidence Proof (Optional)
                </label>
                <div className="relative border-2 border-dashed border-[#d2dde4] hover:border-[#010b13] rounded-xl p-4 text-center bg-[#ebf1f5]/50 transition cursor-pointer">
                  <input
                    type="file"
                    name="evidence"
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    onChange={(e) => setEvidenceFileName(e.target.files?.[0]?.name || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 mx-auto text-[#526371] mb-1" />
                  <span className="text-xs font-bold text-[#010b13] block">
                    {evidenceFileName ? `Selected: ${evidenceFileName}` : 'Upload error screenshot proof'}
                  </span>
                  <span className="text-[10px] font-mono text-[#526371] block">JPG, PNG or PDF up to 10MB</span>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-900 leading-relaxed">
                <strong>Notice:</strong> Opening a dispute immediately freezes all escrow funds. Both parties will be summoned to provide evidence to the Dealoura Arbitration Officer.
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {submitting ? 'Submitting Dispute...' : 'Confirm & Open Dispute'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="py-3 px-4 rounded-xl border border-[#d2dde4] text-xs font-bold text-[#526371] hover:bg-[#ebf1f5] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
