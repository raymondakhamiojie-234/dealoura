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
  AlertCircle,
  ExternalLink,
  Edit2,
  Coins,
} from 'lucide-react'
import { submitPaymentTransferProof, adminConfirmEscrowDeposit } from '@/app/actions/transactions'
import { ESCROW_BANK_CONFIG } from '@/config/escrow-bank'
import { ESCROW_CRYPTO_NETWORKS } from '@/config/escrow-crypto'

interface PaymentProof {
  payerName: string
  payerBank: string
  referenceCode: string
  amountPaid: number
  receiptUrl?: string | null
  notes?: string
  submittedAt: string
  paymentType?: string
  txHash?: string
  network?: string
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
  // Wallet system is paused per product instructions; wire and crypto are active
  const [selectedMethod, setSelectedMethod] = useState<'wire' | 'crypto'>('wire')
  const [selectedCryptoNetwork, setSelectedCryptoNetwork] = useState<string>('usdt_trc20')
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
  const currentCrypto = ESCROW_CRYPTO_NETWORKS[selectedCryptoNetwork] || ESCROW_CRYPTO_NETWORKS.usdt_trc20

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
    const isCryptoProof = existingProof.paymentType === 'crypto' || !!existingProof.txHash

    return (
      <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#010b13] text-[#ebf1f5] rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                Deposit Under Verification
              </span>
              <h3 className="text-xl font-black text-[#010b13] mt-1">
                {isCryptoProof ? 'Crypto Transfer Submitted' : 'Bank Transfer Submitted'}
              </h3>
            </div>
          </div>

          {isBuyer && (
            <button
              onClick={() => setIsEditing(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-xs font-bold text-[#010b13] hover:bg-[#010b13] hover:text-[#ebf1f5] transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Details
            </button>
          )}
        </div>

        {/* Submitted Data Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#ebf1f5] p-4 rounded-xl border border-[#d2dde4] text-xs">
          <div>
            <span className="text-[#526371] block text-[10px] uppercase font-bold">Payer / Source</span>
            <span className="font-bold text-[#010b13] truncate block mt-0.5">{existingProof.payerName || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[#526371] block text-[10px] uppercase font-bold">Payment Method</span>
            <span className="font-bold text-[#010b13] block mt-0.5">{existingProof.payerBank || (isCryptoProof ? 'Crypto Vault' : 'Bank Wire')}</span>
          </div>
          <div>
            <span className="text-[#526371] block text-[10px] uppercase font-bold">
              {isCryptoProof ? 'TxID / Reference' : 'Reference Code'}
            </span>
            <span className="font-mono font-bold text-[#010b13] truncate block mt-0.5">
              {existingProof.txHash || existingProof.referenceCode || referenceCode}
            </span>
          </div>
          <div>
            <span className="text-[#526371] block text-[10px] uppercase font-bold">Amount Paid</span>
            <span className="font-black text-[#010b13] block mt-0.5">${existingProof.amountPaid || totalAmount} USD</span>
          </div>
        </div>

        {isCryptoProof && existingProof.txHash && (
          <div className="p-3 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] flex items-center justify-between text-xs">
            <span className="text-[#526371] font-mono truncate max-w-sm">
              Blockchain TxID: {existingProof.txHash}
            </span>
            <a
              href={`https://tronscan.org/#/transaction/${existingProof.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#010b13] underline font-bold flex items-center gap-1 shrink-0 ml-2"
            >
              Verify on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {paymentProofUrl && (
          <div className="flex items-center gap-2 text-xs text-[#010b13]">
            <FileText className="w-4 h-4 text-[#526371]" />
            <a href={paymentProofUrl} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-1 font-semibold">
              View Uploaded Payment Receipt / Screenshot <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="bg-[#ebf1f5] p-4 rounded-xl text-xs text-[#526371] space-y-1 border border-[#d2dde4]">
          <p className="font-bold text-[#010b13]">What happens next?</p>
          <p className="text-[11px] leading-relaxed">
            The Dealoura Escrow Desk is reconciling your transfer. Once confirmed, the seller is notified to hand over the credentials to our agent. You will receive an instant notification and email.
          </p>
        </div>

        {/* DEVELOPER SIMULATION: Direct 1-Click Approval */}
        <div className="pt-3 border-t border-[#d2dde4] flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-mono text-[#526371] font-semibold">DEVELOPER / ADMIN SIMULATION:</span>
          <button
            type="button"
            onClick={async () => {
              if (confirm('Simulate escrow payment clearance right now? This will approve the deposit immediately.')) {
                await adminConfirmEscrowDeposit(transactionId)
              }
            }}
            className="py-1.5 px-3 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-bold text-xs rounded-lg transition cursor-pointer"
          >
            [Instant Simulation] Approve Escrow Deposit
          </button>
        </div>
      </div>
    )
  }

  // 2. DEFAULT VIEW: CHOOSE PAYMENT METHOD (WIRE OR CRYPTO)
  return (
    <div className="space-y-6">
      
      {/* 2-Option Payment Method Switcher (For Buyer) */}
      {isBuyer && (
        <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#d2dde4] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-[#526371]">Escrow Deposit Method:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod('wire')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedMethod === 'wire'
                  ? 'bg-[#010b13] text-[#ebf1f5]'
                  : 'bg-[#ebf1f5] text-[#010b13] hover:bg-[#d2dde4]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Bank Wire Transfer</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod('crypto')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedMethod === 'crypto'
                  ? 'bg-[#010b13] text-[#ebf1f5]'
                  : 'bg-[#ebf1f5] text-[#010b13] hover:bg-[#d2dde4]'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Crypto Escrow (USDT / USDC)</span>
            </button>
          </div>
        </div>
      )}

      {selectedMethod === 'crypto' && isBuyer ? (
        /* OPTION B: CRYPTO ESCROW DEPOSIT (USDT / USDC) */
        <div className="space-y-6">
          <div className="bg-[#010b13] text-[#ebf1f5] rounded-2xl p-6 sm:p-8 border border-[#18263B] space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#18263B] text-[#ebf1f5] rounded-xl flex items-center justify-center shrink-0 border border-[#d2dde4]/20">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#18263B] text-[#ebf1f5] border border-[#d2dde4]/20">
                    Segregated Crypto Escrow Vault
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#ebf1f5] mt-1">
                    Send Stablecoins to Dealoura Vault
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-[#526371] block">Amount Due</span>
                <span className="text-2xl font-black text-[#ebf1f5] font-mono">
                  {totalAmount.toLocaleString()} {currentCrypto.token}
                </span>
                <span className="text-[11px] text-[#526371] block font-mono">($1.00 USD = 1.00 {currentCrypto.token})</span>
              </div>
            </div>

            {/* Network Selector Tabs */}
            <div className="flex flex-wrap gap-2 pt-2">
              {Object.values(ESCROW_CRYPTO_NETWORKS).map((net) => (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => setSelectedCryptoNetwork(net.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    selectedCryptoNetwork === net.id
                      ? 'bg-[#ebf1f5] text-[#010b13]'
                      : 'bg-[#18263B] text-[#ebf1f5]/80 hover:text-[#ebf1f5]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  <span>{net.name}</span>
                  <span className="text-[10px] opacity-70 font-normal">{net.feeEstimate}</span>
                </button>
              ))}
            </div>

            {/* Crypto Deposit Box with QR Code & Copy */}
            <div className="bg-[#18263B]/60 rounded-xl p-5 border border-[#d2dde4]/20 space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-6">
                
                {/* QR Code */}
                <div className="bg-[#ffffff] p-2.5 rounded-xl shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentCrypto.address}`}
                    alt="Deposit QR Code"
                    className="w-32 h-32 rounded-lg object-contain"
                  />
                </div>

                {/* Address Details */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#ebf1f5]/70 block mb-1">
                      Dealoura Custodial Escrow Address ({currentCrypto.network})
                    </span>
                    <div className="flex items-center gap-2 bg-[#010b13] p-3 rounded-xl border border-[#d2dde4]/20 font-mono text-xs text-[#ebf1f5] break-all select-all">
                      <span className="flex-1">{currentCrypto.address}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('crypto_addr', currentCrypto.address)}
                        className="p-1.5 rounded-lg bg-[#18263B] hover:bg-[#ebf1f5] hover:text-[#010b13] text-[#ebf1f5] transition shrink-0 cursor-pointer"
                        title="Copy Address"
                      >
                        {copiedField === 'crypto_addr' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-[#ebf1f5]/70 gap-2">
                    <span className="flex items-center gap-1.5 text-[#ebf1f5]">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Required Confirmations: {currentCrypto.confirmationsNeeded} blocks</span>
                    </span>
                    <span className="font-mono text-[#ebf1f5] font-semibold text-[11px]">
                      Send only {currentCrypto.token} via {currentCrypto.network}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-1 text-[11px] text-[#ebf1f5]/70 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0 text-[#ebf1f5]" />
              <span>Funds are held safely in custody until the 7-day buyer evaluation ends.</span>
            </div>
          </div>

          {/* Crypto Confirmation Form */}
          <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#ebf1f5] text-[#010b13] rounded-xl border border-[#d2dde4]">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-black text-[#010b13]">
                  Confirm Crypto Transfer
                </h4>
                <p className="text-xs text-[#526371]">
                  After broadcasting the transaction on your wallet (Binance, TrustWallet, MetaMask, etc.), paste the Transaction Hash (TxID) below.
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
              <input type="hidden" name="payer_bank" value={`Crypto (${currentCrypto.symbol})`} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#010b13] mb-1">
                    Your Name or Handle *
                  </label>
                  <input
                    type="text"
                    name="payer_name"
                    required
                    placeholder="e.g. Alex M."
                    defaultValue={existingProof?.payerName || ''}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#010b13] mb-1">
                    Blockchain Transaction Hash (TxID) *
                  </label>
                  <input
                    type="text"
                    name="reference_code"
                    required
                    placeholder="e.g. 9b7a4c6e... or 0x8f2d..."
                    defaultValue={existingProof?.txHash || existingProof?.referenceCode || ''}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#010b13] mb-1">
                  Sender Wallet Address (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Your wallet address that sent the transaction..."
                  defaultValue={existingProof?.notes || ''}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs font-bold text-[#526371]">
                  Amount to Verify: <strong className="text-[#010b13]">{totalAmount} {currentCrypto.token}</strong>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3 px-6 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-extrabold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting Details...' : 'Confirm Crypto Escrow Deposit'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* OPTION A: BANK WIRE TRANSFER DETAILS */
        <div className="space-y-6">
          <div className="bg-[#010b13] text-[#ebf1f5] rounded-2xl p-6 sm:p-8 border border-[#18263B] space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#18263B] text-[#ebf1f5] rounded-xl flex items-center justify-center shrink-0 border border-[#d2dde4]/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#18263B] text-[#ebf1f5] border border-[#d2dde4]/20">
                    Segregated Trust Custody
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#ebf1f5] mt-1">
                    Escrow Bank Wire Instructions
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#526371] block">Total Due</span>
                <span className="text-2xl font-black text-[#ebf1f5] font-mono">${totalAmount.toLocaleString()} USD</span>
              </div>
            </div>

            <p className="text-xs text-[#ebf1f5]/80 leading-relaxed max-w-2xl">
              Transfer funds directly from your bank or online service (Wise, Revolut, Chase) to Dealoura&apos;s segregated escrow trust account. Once our desk verifies receipt, the seller is instructed to hand over the credentials.
            </p>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {bankDetails.map((item) => (
                <div
                  key={item.label}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.highlight
                      ? 'bg-[#18263B] border-[#d2dde4]/30'
                      : 'bg-[#010b13] border-[#18263B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-[#ebf1f5]/70">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.label, item.copyValue)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ebf1f5]/80 hover:text-[#ebf1f5] px-2 py-0.5 rounded-md hover:bg-[#18263B] transition cursor-pointer"
                      title={`Copy ${item.label}`}
                    >
                      {copiedField === item.label ? (
                        <>
                          <Check className="w-3 h-3 text-[#ebf1f5]" />
                          <span className="text-[#ebf1f5]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className={`font-mono font-bold tracking-tight ${item.highlight ? 'text-base text-[#ebf1f5]' : 'text-sm text-[#ebf1f5]'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-[#ebf1f5]/70 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0 text-[#ebf1f5]" />
              <span>Funds are held in a segregated client trust account and will never be released to the seller until your 7-day evaluation concludes.</span>
            </div>
          </div>

          {/* Payment Confirmation Form (For Buyer) */}
          {isBuyer && (
            <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#ebf1f5] text-[#010b13] rounded-xl border border-[#d2dde4]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#010b13]">
                    Confirm Your Transfer Details
                  </h4>
                  <p className="text-xs text-[#526371]">
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
                    <label className="block text-xs font-bold text-[#010b13] mb-1">
                      Sender Account Holder Name *
                    </label>
                    <input
                      type="text"
                      name="payer_name"
                      required
                      placeholder="e.g. Alex Morgan"
                      defaultValue={existingProof?.payerName || ''}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#010b13] mb-1">
                      Sending Bank / Service *
                    </label>
                    <input
                      type="text"
                      name="payer_bank"
                      required
                      placeholder="e.g. Chase, Wise, Revolut, Wire"
                      defaultValue={existingProof?.payerBank || ''}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#010b13] mb-1">
                      Transaction Reference / Narration Code *
                    </label>
                    <input
                      type="text"
                      name="reference_code"
                      required
                      defaultValue={existingProof?.referenceCode || referenceCode}
                      placeholder="e.g. DEAL-XXXX or your bank's TXN ID"
                      className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#010b13] mb-1">
                      Upload Transfer Receipt / Screenshot (Optional)
                    </label>
                    <input
                      type="file"
                      name="receipt_file"
                      accept="image/*,.pdf"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#010b13] file:text-[#ebf1f5] hover:file:opacity-90 transition cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#010b13] mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Any special reference or timing details for the escrow desk..."
                    defaultValue={existingProof?.notes || ''}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs font-bold text-[#526371]">
                    Amount to Verify: <strong className="text-[#010b13]">${totalAmount} USD</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2.5 text-xs font-bold text-[#526371] hover:bg-[#ebf1f5] rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-3 px-6 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-extrabold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
