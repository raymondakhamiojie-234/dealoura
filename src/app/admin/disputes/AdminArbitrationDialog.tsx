'use client'

import { useState } from 'react'
import {
  ShieldAlert,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FileText,
  Scale,
  ArrowRight,
  Eye,
} from 'lucide-react'
import { adminArbitrateDisputeAction, markDisputeUnderReview } from '@/app/actions/disputes'

interface AdminArbitrationDialogProps {
  dispute: {
    id: string
    transaction_id: string
    reason: string
    evidence_url?: string | null
    status: string
    resolution_notes?: string | null
    created_at: string
    transactions?: {
      agreed_price: number
      escrow_fee?: number | null
      listings?: {
        title: string
        platform: string
      } | null
      buyer?: {
        username: string
        email?: string
      } | null
      seller?: {
        username: string
        email?: string
      } | null
    } | null
  }
}

export function AdminArbitrationDialog({ dispute }: AdminArbitrationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [resolution, setResolution] = useState<'resolved_buyer' | 'resolved_seller'>('resolved_buyer')
  const [notes, setNotes] = useState('')
  const [confirmedReview, setConfirmedReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  const tx = dispute.transactions
  const listingTitle = tx?.listings?.title || 'Account Asset'
  const platform = tx?.listings?.platform || 'Social Asset'
  const agreedPrice = tx?.agreed_price || 0
  const escrowFee = tx?.escrow_fee || Math.round(agreedPrice * 0.05 * 100) / 100
  const netSeller = Math.max(0, agreedPrice - escrowFee)

  const handleSetUnderReview = async () => {
    setReviewLoading(true)
    setErrorMsg(null)
    try {
      const res = await markDisputeUnderReview(dispute.id, dispute.transaction_id)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update dispute status.')
    } finally {
      setReviewLoading(false)
    }
  }

  const handleArbitrate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!notes.trim()) {
      setErrorMsg('Please provide detailed findings and justification for the ruling.')
      return
    }
    if (!confirmedReview) {
      setErrorMsg('You must verify that you reviewed the evidence and communication history.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const formData = new FormData()
      formData.append('disputeId', dispute.id)
      formData.append('transactionId', dispute.transaction_id)
      formData.append('resolution', resolution)
      formData.append('notes', notes.trim())

      const res = await adminArbitrateDisputeAction(formData)
      if (res?.error) {
        setErrorMsg(res.error)
        setSubmitting(false)
      } else {
        setIsOpen(false)
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit arbitration verdict.')
      setSubmitting(false)
    }
  }

  const isResolved =
    dispute.status === 'resolved_buyer' ||
    dispute.status === 'resolved_seller' ||
    dispute.status === 'closed'

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* If open, button to start formal review */}
        {dispute.status === 'open' && (
          <button
            type="button"
            onClick={handleSetUnderReview}
            disabled={reviewLoading}
            className="py-2 px-3 rounded-xl border border-[#d2dde4] bg-[#ebf1f5] hover:bg-[#d2dde4] text-[#010b13] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{reviewLoading ? 'Updating...' : 'Assign to Investigation'}</span>
          </button>
        )}

        {/* Arbitrate Button */}
        {!isResolved ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="py-2 px-4 rounded-xl bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Arbitrate &amp; Issue Ruling</span>
          </button>
        ) : (
          <span className="text-[11px] font-bold text-[#526371] bg-[#ebf1f5] px-3 py-1.5 rounded-xl border border-[#d2dde4] inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Case Resolved
          </span>
        )}
      </div>

      {/* Arbitration Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#ffffff] rounded-3xl border border-[#d2dde4] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#d2dde4] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                      Escrow Arbitration Desk
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                      {platform}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#010b13] mt-1">
                    Arbitrate Case #{dispute.id.slice(0, 8).toUpperCase()}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#526371] hover:text-[#010b13] p-1.5 rounded-xl hover:bg-[#ebf1f5] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Case Summary Card */}
            <div className="bg-[#ebf1f5] border border-[#d2dde4] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <span className="text-[#526371] block text-[10px] uppercase font-mono font-bold">Listing Asset</span>
                  <strong className="text-sm text-[#010b13] font-black">{listingTitle}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[#526371] block text-[10px] uppercase font-mono font-bold">Escrow Vault Held</span>
                  <strong className="text-sm text-[#010b13] font-black">${agreedPrice} USD</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#d2dde4] text-xs">
                <div>
                  <span className="text-[#526371] text-[11px] block">Buyer:</span>
                  <span className="font-bold text-[#010b13]">@{tx?.buyer?.username || 'Buyer'}</span>
                </div>
                <div>
                  <span className="text-[#526371] text-[11px] block">Seller:</span>
                  <span className="font-bold text-[#010b13]">@{tx?.seller?.username || 'Seller'}</span>
                </div>
              </div>
            </div>

            {/* Buyer Claim & Evidence */}
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-red-950 uppercase tracking-wider text-[10px] block">
                  Buyer Reported Claim:
                </span>
                <p className="text-red-900 leading-relaxed whitespace-pre-wrap">{dispute.reason}</p>
              </div>

              {dispute.evidence_url && (
                <div className="bg-[#ffffff] border border-[#d2dde4] p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[#010b13] shrink-0" />
                    <span className="text-[#010b13] font-bold truncate">Attached Evidence Proof</span>
                  </div>
                  <a
                    href={dispute.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#010b13] underline hover:opacity-80 shrink-0"
                  >
                    <span>Inspect File</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Link to Escrow Deal Room */}
            <div className="text-right">
              <a
                href={`/dashboard/transactions/${dispute.transaction_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#010b13] underline hover:opacity-80 inline-flex items-center gap-1"
              >
                <span>Inspect Full Deal Room &amp; Messages in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Ruling Decision Form */}
            <form onSubmit={handleArbitrate} className="space-y-5 border-t border-[#d2dde4] pt-4">
              <div>
                <label className="block text-xs font-bold text-[#010b13] mb-2 uppercase tracking-wider">
                  Select Arbitration Ruling
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Refund Buyer */}
                  <div
                    onClick={() => setResolution('resolved_buyer')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      resolution === 'resolved_buyer'
                        ? 'border-red-600 bg-red-50 text-red-950'
                        : 'border-[#d2dde4] bg-[#ffffff] text-[#010b13] hover:border-[#010b13]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-xs">Refund Buyer</span>
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            resolution === 'resolved_buyer'
                              ? 'border-red-600 bg-red-600 text-white'
                              : 'border-[#d2dde4]'
                          }`}
                        >
                          {resolution === 'resolved_buyer' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-80">
                        Cancels transaction, returns full ${agreedPrice} deposit to buyer, revokes seller payout.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Release to Seller */}
                  <div
                    onClick={() => setResolution('resolved_seller')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      resolution === 'resolved_seller'
                        ? 'border-[#010b13] bg-[#010b13] text-[#ebf1f5]'
                        : 'border-[#d2dde4] bg-[#ffffff] text-[#010b13] hover:border-[#010b13]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-xs">Release to Seller</span>
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            resolution === 'resolved_seller'
                              ? 'border-[#ebf1f5] bg-[#ebf1f5] text-[#010b13]'
                              : 'border-[#d2dde4]'
                          }`}
                        >
                          {resolution === 'resolved_seller' && <span className="w-1.5 h-1.5 bg-[#010b13] rounded-full" />}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-80">
                        Marks transaction completed, releases net ${netSeller} to seller payout desk queue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Findings / Justification */}
              <div>
                <label className="block text-xs font-bold text-[#010b13] mb-1">
                  Official Arbitration Findings &amp; Ruling Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail the investigation results (e.g. 'Evidence confirmed credentials were changed by seller. 100% refund issued to buyer.')"
                  className="w-full text-xs rounded-xl border border-[#d2dde4] bg-[#ffffff] text-[#010b13] p-3 outline-none focus:border-[#010b13] transition"
                />
                <span className="text-[10px] text-[#526371] block mt-1">
                  This ruling explanation will be logged to the public escrow timeline and emailed to both parties.
                </span>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ebf1f5] border border-[#d2dde4] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={confirmedReview}
                  onChange={(e) => setConfirmedReview(e.target.checked)}
                  className="mt-0.5 rounded border-[#d2dde4] text-[#010b13] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-[#010b13] leading-relaxed">
                  I confirm that I have verified communication records, credentials, and evidence. This arbitration decision is final and legally binding on Dealoura Escrow.
                </span>
              </label>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={submitting}
                  className="py-2.5 px-4 rounded-xl border border-[#d2dde4] bg-white text-xs font-bold text-[#526371] hover:text-[#010b13] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !notes.trim() || !confirmedReview}
                  className={`py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 ${
                    resolution === 'resolved_buyer'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5]'
                  }`}
                >
                  <span>{submitting ? 'Executing Ruling...' : 'Confirm Binding Ruling'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
