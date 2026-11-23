'use client'

import { useState } from 'react'
import { 
  DollarSign, 
  Wallet, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { submitSellerPayoutDetails } from '@/app/actions/transactions'

interface SellerPayoutCardProps {
  transactionId: string
  agreedPrice: number
  escrowFee?: number
  payoutStatus?: string | null
  payoutMethod?: string | null
  payoutDetails?: any
  payoutTxHash?: string | null
  payoutSentAt?: string | null
  isDealCompleted: boolean
}

export function SellerPayoutCard({
  transactionId,
  agreedPrice,
  escrowFee = 0,
  payoutStatus = 'unrequested',
  payoutMethod,
  payoutDetails,
  payoutTxHash,
  payoutSentAt,
  isDealCompleted,
}: SellerPayoutCardProps) {
  const calcFee = escrowFee || Math.round(agreedPrice * 0.05 * 100) / 100
  const netPayout = Math.max(0, agreedPrice - calcFee)

  const [activeTab, setActiveTab] = useState<'crypto' | 'bank'>(
    payoutMethod === 'bank_wire' ? 'bank' : 'crypto'
  )
  const [submitting, setSubmitting] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Crypto fields
  const [cryptoNetwork, setCryptoNetwork] = useState(payoutDetails?.network || 'TRC20')
  const [walletAddress, setWalletAddress] = useState(payoutDetails?.address || '')

  // Bank fields
  const [accountName, setAccountName] = useState(payoutDetails?.account_name || '')
  const [bankName, setBankName] = useState(payoutDetails?.bank_name || '')
  const [accountNumber, setAccountNumber] = useState(payoutDetails?.account_number || '')
  const [routingSwift, setRoutingSwift] = useState(payoutDetails?.routing_swift || '')
  const [country, setCountry] = useState(payoutDetails?.country || '')

  const copyHash = () => {
    if (payoutTxHash) {
      navigator.clipboard.writeText(payoutTxHash)
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('transactionId', transactionId)
    formData.append('payoutMethod', activeTab === 'crypto' ? 'crypto_usdt' : 'bank_wire')

    if (activeTab === 'crypto') {
      if (!walletAddress.trim()) {
        setErrorMsg('Please enter your USDT receiving wallet address.')
        setSubmitting(false)
        return
      }
      formData.append('network', cryptoNetwork)
      formData.append('address', walletAddress.trim())
    } else {
      if (!accountName.trim() || !bankName.trim() || !accountNumber.trim()) {
        setErrorMsg('Please fill in your account name, bank name, and account/IBAN number.')
        setSubmitting(false)
        return
      }
      formData.append('account_name', accountName.trim())
      formData.append('bank_name', bankName.trim())
      formData.append('account_number', accountNumber.trim())
      formData.append('routing_swift', routingSwift.trim())
      formData.append('country', country.trim())
    }

    try {
      const res = await submitSellerPayoutDetails(formData)
      if (res?.error) {
        setErrorMsg(res.error)
        setSubmitting(false)
      } else {
        setEditMode(false)
        setSubmitting(false)
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save payout details.')
      setSubmitting(false)
    }
  }

  const isPaid = payoutStatus === 'completed'
  const isPending = payoutStatus === 'pending' || payoutStatus === 'processing'
  const isDetailsOnRecord = Boolean(payoutDetails && (payoutDetails.address || payoutDetails.account_number))

  return (
    <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#d2dde4] pb-5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#010b13]">Seller Payout &amp; Net Proceeds</h3>
            <p className="text-xs text-[#526371]">
              Provide your settlement destination to receive escrow proceeds upon deal finalization.
            </p>
          </div>
        </div>

        {isPaid ? (
          <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Payout Disbursed</span>
          </span>
        ) : isPending ? (
          <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Disbursement Queued</span>
          </span>
        ) : (
          <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
            Settlement Pending
          </span>
        )}
      </div>

      {/* Payout Financial Breakdown Box */}
      <div className="p-4 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] space-y-2 text-xs">
        <div className="flex justify-between text-[#526371]">
          <span>Agreed Sale Value:</span>
          <span className="font-mono font-bold text-[#010b13]">${agreedPrice.toLocaleString()} USD</span>
        </div>
        <div className="flex justify-between text-[#526371]">
          <span>Dealoura Escrow Protocol Fee (5%):</span>
          <span className="font-mono text-[#010b13]">-${calcFee.toLocaleString()} USD</span>
        </div>
        <div className="flex justify-between text-[#010b13] font-black text-sm pt-2 border-t border-[#d2dde4]">
          <span>Net Seller Disbursable Amount:</span>
          <span className="font-mono text-base text-emerald-700">${netPayout.toLocaleString()} USD</span>
        </div>
      </div>

      {/* COMPLETED PAYOUT STATE */}
      {isPaid && (
        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 text-xs text-emerald-950">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Funds Disbursed &amp; Settled by Escrow Desk</span>
          </div>
          <p className="leading-relaxed">
            Your net payout of <strong>${netPayout} USD</strong> was dispatched to your destination on{' '}
            <span suppressHydrationWarning>{payoutSentAt ? new Date(payoutSentAt).toLocaleDateString() : 'recently'}</span>.
          </p>
          {payoutTxHash && (
            <div className="p-3 bg-white border border-emerald-200 rounded-lg flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[10px] font-mono text-[#526371] block">Reference / TxHash:</span>
                <span className="font-mono font-bold text-xs text-[#010b13] truncate">{payoutTxHash}</span>
              </div>
              <button
                type="button"
                onClick={copyHash}
                className="px-2.5 py-1.5 rounded-md bg-[#ebf1f5] hover:bg-[#d2dde4] text-[#010b13] text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHash ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* PENDING SUBMISSION / SUMMARY CARD */}
      {!isPaid && isDetailsOnRecord && !editMode && (
        <div className="p-5 bg-[#ebf1f5]/60 border border-[#d2dde4] rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#010b13] uppercase tracking-wider text-[11px]">
              Saved Payout Destination:
            </span>
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="text-xs font-bold text-[#010b13] underline hover:opacity-80"
            >
              Edit Details
            </button>
          </div>

          {payoutMethod === 'crypto_usdt' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#526371]" />
                <span className="font-bold text-[#010b13]">Crypto USDT ({payoutDetails?.network})</span>
              </div>
              <p className="font-mono text-[#526371] break-all bg-white p-2.5 rounded-lg border border-[#d2dde4]">
                {payoutDetails?.address}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#526371]" />
                <span className="font-bold text-[#010b13]">{payoutDetails?.bank_name}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#526371] bg-white p-3 rounded-lg border border-[#d2dde4]">
                <div>Beneficiary: <strong className="text-[#010b13]">{payoutDetails?.account_name}</strong></div>
                <div>Account/IBAN: <strong className="font-mono text-[#010b13]">{payoutDetails?.account_number}</strong></div>
                {payoutDetails?.routing_swift && (
                  <div>SWIFT/BIC: <strong className="font-mono text-[#010b13]">{payoutDetails?.routing_swift}</strong></div>
                )}
                {payoutDetails?.country && (
                  <div>Country: <strong className="text-[#010b13]">{payoutDetails?.country}</strong></div>
                )}
              </div>
            </div>
          )}

          <p className="text-[11px] text-[#526371]">
            {isDealCompleted
              ? 'Your payout details are queued with the compliance desk. Funds are disbursed within 2–4 hours.'
              : 'Details saved. Payout will automatically dispatch upon completion of the buyer evaluation period.'}
          </p>
        </div>
      )}

      {/* FORM: INPUT OR EDIT PAYOUT DESTINATION */}
      {(!isPaid && (!isDetailsOnRecord || editMode)) && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {/* Method Tabs */}
          <div className="flex items-center p-1 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('crypto')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'crypto'
                  ? 'bg-[#010b13] text-[#ebf1f5] shadow-xs'
                  : 'text-[#526371] hover:text-[#010b13]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Crypto USDT (Fastest)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'bank'
                  ? 'bg-[#010b13] text-[#ebf1f5] shadow-xs'
                  : 'text-[#526371] hover:text-[#010b13]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Direct Bank Wire</span>
            </button>
          </div>

          {/* CRYPTO TAB */}
          {activeTab === 'crypto' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  Select Blockchain Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'TRC20', label: 'TRC-20 (Tron)', fee: 'Low Fee (~$1)' },
                    { key: 'ERC20', label: 'ERC-20 (ETH)', fee: 'Standard' },
                    { key: 'BEP20', label: 'BEP-20 (BSC)', fee: 'Low Fee (~$0.5)' },
                  ].map((net) => (
                    <button
                      key={net.key}
                      type="button"
                      onClick={() => setCryptoNetwork(net.key)}
                      className={`p-3 rounded-xl border text-left transition ${
                        cryptoNetwork === net.key
                          ? 'border-[#010b13] bg-[#010b13] text-[#ebf1f5]'
                          : 'border-[#d2dde4] bg-[#ebf1f5]/50 text-[#010b13] hover:border-[#526371]'
                      }`}
                    >
                      <span className="font-bold text-xs block">{net.label}</span>
                      <span className="text-[10px] opacity-75 font-mono">{net.fee}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  Receiving USDT Wallet Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={cryptoNetwork === 'TRC20' ? 'T...' : '0x...'}
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-white outline-none transition"
                />
                <span className="text-[10px] text-[#526371] mt-1 block">
                  Verify your address matches the selected {cryptoNetwork} network to avoid loss of funds.
                </span>
              </div>
            </div>
          )}

          {/* BANK WIRE TAB */}
          {activeTab === 'bank' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  Beneficiary Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full legal name on bank account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JPMorgan Chase, Barclays, etc."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  Account Number / IBAN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Account number or international IBAN"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  SWIFT / BIC / Routing Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHASUS33 or 9-digit routing"
                  value={routingSwift}
                  onChange={(e) => setRoutingSwift(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-white outline-none transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                  Country of Bank Account
                </label>
                <input
                  type="text"
                  placeholder="e.g. United States, United Kingdom, Nigeria, etc."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-white outline-none transition"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="py-3 px-5 rounded-xl bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{submitting ? 'Saving Destination...' : 'Save Payout Destination'}</span>
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="py-3 px-4 rounded-xl border border-[#d2dde4] text-xs font-bold text-[#526371] hover:bg-[#ebf1f5] transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
