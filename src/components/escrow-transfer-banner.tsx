'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Edit2,
  Zap,
  Wallet,
  Sparkles
} from 'lucide-react'
import { submitPaymentTransferProof, adminConfirmEscrowDeposit } from '@/app/actions/transactions'
import { getUserWallet, payEscrowFromWallet } from '@/app/actions/wallet'
import { ESCROW_BANK_CONFIG } from '@/config/escrow-bank'

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
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'wire'>('wallet')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWalletPaying, setIsWalletPaying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  // Fetch wallet balance on mount for buyer
  useEffect(() => {
    if (isBuyer) {
      getUserWallet().then(({ wallet }) => {
        if (wallet) {
          setWalletBalance(wallet.available_balance)
        }
      })
    }
  }, [isBuyer])

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
  const hasEnoughWalletBalance = walletBalance !== null && walletBalance >= totalAmount

  // Configurable Escrow Bank Account Details
  const bankDetails = [
    { label: 'Bank Name', value: ESCROW_BANK_CONFIG.bankName, copyValue: ESCROW_BANK_CONFIG.bankName },
    { label: 'Beneficiary / Account Name', value: ESCROW_BANK_CONFIG.accountName, copyValue: ESCROW_BANK_CONFIG.accountName },
    { label: 'Account Number / IBAN', value: ESCROW_BANK_CONFIG.accountNumber, copyValue: ESCROW_BANK_CONFIG.accountNumber.replace(/\s+/g, '') },
    { label: 'Routing / SWIFT Code', value: ESCROW_BANK_CONFIG.routingOrSwiftCode, copyValue: ESCROW_BANK_CONFIG.routingOrSwiftCode },
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

  const handleWalletPay = async () => {
    setIsWalletPaying(true)
    setErrorMsg(null)
    try {
      const res = await payEscrowFromWallet(transactionId)
      if (res?.error) {
        setErrorMsg(res.error)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to pay with wallet')
    } finally {
      setIsWalletPaying(false)
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
                Deposit Submitted
              </h3>
            </div>
          </div>

          {isBuyer && (
            <button
              onClick={() => setIsEditing(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-amber-900 hover:bg-amber-50 transition shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Details
            </button>
          )}
        </div>

        {/* Submitted Data Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-amber-200 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Payer / Source</span>
            <span className="font-bold text-gray-800">{existingProof.payerName || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Bank / Service</span>
            <span className="font-bold text-gray-800">{existingProof.payerBank || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Reference Code</span>
            <span className="font-mono font-bold text-blue-600">{existingProof.referenceCode || referenceCode}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Amount Paid</span>
            <span className="font-black text-emerald-600">${existingProof.amountPaid || totalAmount} USD</span>
          </div>
        </div>

        {paymentProofUrl && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <FileText className="w-4 h-4" />
            <a href={paymentProofUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 font-semibold">
              View Uploaded Payment Receipt / Screenshot <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="bg-amber-100/60 p-4 rounded-xl text-xs text-amber-900 space-y-1">
          <p className="font-bold">What happens next?</p>
          <p className="text-amber-800/90 text-[11px] leading-relaxed">
            The Dealoura Escrow Desk is reconciling your transfer. Once confirmed, the seller is notified to hand over the credentials to our agent. You will receive an instant notification and email.
          </p>
        </div>

        {/* DEVELOPER SIMULATION: Direct 1-Click Approval */}
        <div className="pt-2 border-t border-amber-200 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-mono text-amber-800 font-semibold">DEVELOPER / ADMIN SIMULATION:</span>
          <button
            type="button"
            onClick={async () => {
              if (confirm('Simulate escrow bank clearance right now? This will approve the deposit immediately.')) {
                await adminConfirmEscrowDeposit(transactionId)
              }
            }}
            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            [Instant Simulation] Approve Escrow Deposit
          </button>
        </div>
      </div>
    )
  }

  // 2. DEFAULT VIEW: CHOOSE PAYMENT METHOD (WALLET OR WIRE)
  return (
    <div className="space-y-6">
      
      {/* Payment Method Switcher (For Buyer) */}
      {isBuyer && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Payment Option:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod('wallet')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedMethod === 'wallet'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Dealoura Wallet (Instant)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('wire')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedMethod === 'wire'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Bank Wire Transfer</span>
            </button>
          </div>
        </div>
      )}

      {/* OPTION A: 1-CLICK WALLET BALANCE PAYMENT */}
      {selectedMethod === 'wallet' && isBuyer ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/30">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Instant Escrow Clearance
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Pay from Dealoura Wallet
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Escrow Required</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">${totalAmount.toLocaleString()} USD</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 text-rose-300 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {/* Balance Status Box */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3 relative z-10">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Your Available Balance:</span>
              <span className="font-mono font-bold text-base text-white">
                {walletBalance !== null ? `$${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : 'Checking balance...'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Order Amount + 5% Escrow Protection:</span>
              <span className="font-mono font-bold text-slate-300">
                ${totalAmount.toLocaleString()} USD
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Remaining Balance After Escrow:</span>
              <span className={`font-mono font-bold ${hasEnoughWalletBalance ? 'text-emerald-400' : 'text-rose-400'}`}>
                {walletBalance !== null
                  ? `$${(walletBalance - totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                  : '...'}
              </span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="relative z-10">
            {hasEnoughWalletBalance ? (
              <button
                type="button"
                onClick={handleWalletPay}
                disabled={isWalletPaying}
                className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isWalletPaying ? (
                  <span>Securing Funds in Vault...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Lock ${totalAmount.toLocaleString()} in Escrow with Wallet Balance</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Insufficient balance. You need ${(totalAmount - (walletBalance || 0)).toLocaleString()} more to pay from your wallet.
                  </span>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/dashboard/wallet"
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition text-center"
                  >
                    Top Up Wallet Balance &rarr;
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('wire')}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
                  >
                    Pay via Bank Wire Instead
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2 relative z-10">
            <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span>100% Escrow Protected: Funds stay locked in the Dealoura Vault until you inspect and approve the channel.</span>
          </div>
        </div>
      ) : (
        /* OPTION B: BANK WIRE TRANSFER DETAILS */
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/50 space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-400/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
                    Official Escrow Custody
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Escrow Bank Wire Instructions
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-blue-200/80 block">Total Due</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">${totalAmount.toLocaleString()} USD</span>
              </div>
            </div>

            <p className="text-xs text-blue-100/80 leading-relaxed max-w-2xl">
              Transfer funds directly from your bank or online account to Dealoura&apos;s segregated escrow trust account. Once our desk verifies receipt, the seller is instructed to hand over the credentials.
            </p>

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
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white/80 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition cursor-pointer"
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
                    After completing the bank wire, enter your transfer details below so our escrow desk can verify receipt.
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
                        className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
      )}

    </div>
  )
}
