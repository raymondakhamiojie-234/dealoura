'use client'

import { useState } from 'react'
import { DollarSign, CheckCircle2, Copy, Check, X, ShieldCheck, Wallet, Building2, Send } from 'lucide-react'
import { adminDisburseSellerPayoutAction } from '@/app/actions/admin'

interface AdminPayoutDialogProps {
  transactionId: string
  agreedPrice: number
  escrowFee?: number
  sellerPayoutMethod?: string | null
  sellerPayoutDetails?: any
  payoutStatus?: string | null
  payoutTxHash?: string | null
  sellerUsername?: string | null
}

export function AdminPayoutDialog({
  transactionId,
  agreedPrice,
  escrowFee = 0,
  sellerPayoutMethod,
  sellerPayoutDetails,
  payoutStatus = 'unrequested',
  payoutTxHash,
  sellerUsername = 'seller',
}: AdminPayoutDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const calcFee = escrowFee || Math.round(agreedPrice * 0.05 * 100) / 100
  const netAmount = Math.max(0, agreedPrice - calcFee)

  const handleCopy = () => {
    if (payoutTxHash) {
      navigator.clipboard.writeText(payoutTxHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('transactionId', transactionId)
    formData.append('txHashOrRef', txHash.trim())

    try {
      const res = await adminDisburseSellerPayoutAction(formData)
      if (res?.error) {
        setErrorMsg(res.error)
        setSubmitting(false)
      } else {
        setOpen(false)
        setSubmitting(false)
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Disbursement recording failed.')
      setSubmitting(false)
    }
  }

  const isPaid = payoutStatus === 'completed'
  const isPending = payoutStatus === 'pending' || payoutStatus === 'processing'
  const hasDetails = Boolean(sellerPayoutDetails && (sellerPayoutDetails.address || sellerPayoutDetails.account_number))

  return (
    <div>
      {isPaid ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-mono font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Paid: ${netAmount}</span>
          {payoutTxHash && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-[#526371] hover:text-[#010b13] ml-1"
              title="Copy TxHash"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      ) : isPending && hasDetails ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer animate-pulse"
        >
          <Send className="w-3 h-3" />
          <span>Disburse Payout (${netAmount})</span>
        </button>
      ) : (
        <span className="text-[11px] font-mono text-[#526371] bg-[#ebf1f5] px-2.5 py-1 rounded-lg border border-[#d2dde4]">
          Payout unrequested by seller
        </span>
      )}

      {/* DISBURSEMENT MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-[#010b13]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-[#526371] hover:text-[#010b13]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#010b13]">Disburse Seller Proceeds</h4>
                <p className="text-xs text-[#526371]">Fulfill escrow payout to @{sellerUsername}</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            {/* Destination Summary */}
            <div className="p-4 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] space-y-2 text-xs">
              <div className="flex justify-between text-[#526371]">
                <span>Agreed Sale Price:</span>
                <span className="font-mono text-[#010b13]">${agreedPrice} USD</span>
              </div>
              <div className="flex justify-between text-[#526371]">
                <span>Platform Escrow Fee (5%):</span>
                <span className="font-mono text-[#010b13]">-${calcFee} USD</span>
              </div>
              <div className="flex justify-between text-[#010b13] font-black text-sm pt-2 border-t border-[#d2dde4]">
                <span>Net Transfer Amount:</span>
                <span className="font-mono text-emerald-700">${netAmount} USD</span>
              </div>

              <div className="pt-2 border-t border-[#d2dde4] space-y-1">
                <span className="font-bold text-[#010b13] block">Seller Destination:</span>
                {sellerPayoutMethod === 'crypto_usdt' ? (
                  <div className="bg-white p-2.5 rounded-lg border border-[#d2dde4] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#010b13]">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>USDT ({sellerPayoutDetails?.network})</span>
                    </div>
                    <p className="font-mono text-[11px] text-[#526371] break-all">
                      {sellerPayoutDetails?.address}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white p-2.5 rounded-lg border border-[#d2dde4] space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-[#010b13]">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{sellerPayoutDetails?.bank_name}</span>
                    </div>
                    <div>Account Name: <strong>{sellerPayoutDetails?.account_name}</strong></div>
                    <div>IBAN/Account: <strong className="font-mono">{sellerPayoutDetails?.account_number}</strong></div>
                    {sellerPayoutDetails?.routing_swift && (
                      <div>SWIFT: <strong className="font-mono">{sellerPayoutDetails?.routing_swift}</strong></div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  Blockchain TxHash or Bank Wire Ref <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Paste transaction hash (0x...) or bank reference..."
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-white outline-none transition"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Confirming...' : 'Confirm Disbursed'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
