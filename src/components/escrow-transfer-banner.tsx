'use client'

import { useState } from 'react'
import {
  Copy,
  Check,
  Building2,
  Lock,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Upload,
  AlertCircle,
  ExternalLink,
  Edit2
} from 'lucide-react'
import { submitPaymentTransferProof, adminConfirmEscrowDeposit } from '@/app/actions/transactions'

interface PaymentProof {
  payerName: string
  payerBank: string
  referenceCode: string
  amountPaid: number
  receiptUrl?: string | null
  notes?: string
  submittedAt: string
}

interface EscrowTransferBannerProps {
  transactionId: string
  agreedPrice: number
  escrowFee: number
  paymentProofData?: string | null
  paymentProofUrl?: string | null
  isBuyer: boolean
}

export function EscrowTransferBanner({
  transactionId,
  agreedPrice,
  escrowFee,
  paymentProofData,
  paymentProofUrl,
  isBuyer
}: EscrowTransferBannerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Parse existing proof if available
  let existingProof: PaymentProof | null = null
  if (paymentProofData) {
    try {
      existingProof = JSON.parse(paymentProofData)
    } catch {
      // Ignored
    }
  }

  const referenceCode = `DEAL-${transactionId.slice(0, 8).toUpperCase()}`
  const totalAmount = Math.round((agreedPrice + escrowFee) * 100) / 100

  // Configurable Escrow Bank Account Details
  const bankDetails = [
    { label: 'Bank Name', value: 'Mercury Bank / Evolve Bank & Trust', copyValue: 'Mercury Bank' },
    { label: 'Beneficiary / Account Name', value: 'Dealoura Escrow Holdings Ltd', copyValue: 'Dealoura Escrow Holdings Ltd' },
    { label: 'Account Number / IBAN', value: '0834 9182 7461', copyValue: '083491827461' },
    { label: 'Routing / SWIFT Code', value: '021000021 / EVBLUS33', copyValue: '021000021' },
    { label: 'Payment Reference (Mandatory)', value: referenceCode, copyValue: referenceCode, highlight: true },
    { label: 'Total Payable Amount', value: `$${totalAmount.toLocaleString()} USD`, copyValue: `${totalAmount}`, highlight: true }
  ]

  const handleCopy = async (field: string, text: string) => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
      }
    } catch {
      // Fallback
    }
  }

  const handleSubmitProof = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    const formData = new FormData(e.currentTarget)
    formData.set('transactionId', transactionId)
    formData.set('amount_paid', totalAmount.toString())

    try {
      const res = await submitPaymentTransferProof(formData)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setIsEditing(false)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit transfer proof')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1. IF BUYER HAS ALREADY SUBMITTED PROOF (And not editing) -> Show Under Verification Banner
  if (existingProof && !isEditing) {
    return (
      <div className="bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                Deposit Under Verification
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-1">
                Bank Transfer Submitted
              </h3>
            </div>
          </div>

          {isBuyer && (
            <button
              onClick={() => setIsEditing(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-amber-900 hover:bg-amber-50 transition shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Details
            </button>
          )}
        </div>

        <p className="text-xs text-amber-900/90 leading-relaxed max-w-2xl">
          Thank you! Our official Escrow Desk is reconciling your transfer with our bank ledger. Once confirmed, the seller will immediately be requested to hand over the account credentials to our Escrow Agent.
        </p>

        {/* Submitted Proof Summary Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Submitted Transfer Confirmation
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Sender / Payer:</span>
              <p className="font-bold text-gray-900 mt-0.5">{existingProof.payerName}</p>
            </div>
            <div>
              <span className="text-gray-500">Sending Bank / Method:</span>
              <p className="font-bold text-gray-900 mt-0.5">{existingProof.payerBank}</p>
            </div>
            <div>
              <span className="text-gray-500">Bank Reference Code:</span>
              <p className="font-mono font-bold text-blue-600 mt-0.5">{existingProof.referenceCode}</p>
            </div>
            <div>
              <span className="text-gray-500">Amount Sent:</span>
              <p className="font-extrabold text-emerald-600 mt-0.5">${existingProof.amountPaid} USD</p>
            </div>
          </div>

          {(paymentProofUrl || existingProof.receiptUrl) && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Attached Receipt / Screenshot:</span>
              <a
                href={paymentProofUrl || existingProof.receiptUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
              >
                View Uploaded Receipt <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Developer Sandbox Instant Confirm Tool */}
        <div className="pt-4 border-t border-amber-200/80 flex items-center justify-between flex-wrap gap-3">
          <span className="text-[11px] text-gray-500 font-medium">
            Escrow Desk typically reconciles deposits within 15–30 minutes.
          </span>
          <form action={adminConfirmEscrowDeposit.bind(null, transactionId) as any}>
            <button
              type="submit"
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              [Dev Sandbox] Instant Confirm Deposit
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 2. STANDARD TRANSFER DETAILS BANNER & SUBMISSION FORM
  return (
    <div className="space-y-6">
      
      {/* Official Bank Transfer Details Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/20">
              <Building2 className="w-3.5 h-3.5" />
              Official Dealoura Escrow Vault Account
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Protected Deposit
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black">
              Transfer Funds to Dealoura Escrow
            </h3>
            <p className="text-xs text-blue-100/80 mt-1 max-w-xl leading-relaxed">
              Please transfer the total amount via Online Banking, Wire, or Transfer to the escrow account below. Include the <strong>Payment Reference</strong> so our desk can match your payment instantly.
            </p>
          </div>

          {/* Account Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {bankDetails.map((item) => (
              <div
                key={item.label}
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.highlight
                    ? 'bg-blue-600/30 border-blue-400/50 shadow-inner'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-blue-200/90">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.label, item.copyValue)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-white/80 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition"
                    title={`Copy ${item.label}`}
                  >
                    {copiedField === item.label ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className={`font-mono font-bold tracking-tight ${item.highlight ? 'text-base text-white' : 'text-sm text-slate-100'}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-blue-200/70 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span>Funds are held in a segregated client trust account and will never be released to the seller until your 7-day evaluation concludes.</span>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Form (For Buyer) */}
      {isBuyer && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-900">
                Confirm Your Transfer Details
              </h4>
              <p className="text-xs text-gray-500">
                After completing the bank transfer, enter your transfer details below so our escrow desk can verify receipt.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitProof} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Sender Account Holder Name *
                </label>
                <input
                  type="text"
                  name="payer_name"
                  required
                  placeholder="e.g. Alex Morgan"
                  defaultValue={existingProof?.payerName || ''}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Sending Bank / Service *
                </label>
                <input
                  type="text"
                  name="payer_bank"
                  required
                  placeholder="e.g. Chase, Wise, Revolut, Wire"
                  defaultValue={existingProof?.payerBank || ''}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Transaction Reference / Narration Code *
                </label>
                <input
                  type="text"
                  name="reference_code"
                  required
                  defaultValue={existingProof?.referenceCode || referenceCode}
                  placeholder="e.g. DEAL-XXXX or your bank's TXN ID"
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Upload Transfer Receipt / Screenshot (Optional)
                </label>
                <input
                  type="file"
                  name="receipt_file"
                  accept="image/*,.pdf"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Any special reference or timing details for the escrow desk..."
                defaultValue={existingProof?.notes || ''}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold text-gray-500">
                Amount to Verify: <strong className="text-blue-600">${totalAmount} USD</strong>
              </span>

              <div className="flex items-center gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting Details...' : 'I Have Transferred — Confirm Payment'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
