'use client'

import { useState } from 'react'
import { X, Building2, Zap, Copy, Check, ArrowRight, ShieldCheck, Coins, Sparkles } from 'lucide-react'
import { depositFundsToWallet } from '@/app/actions/wallet'
import { ESCROW_BANK_CONFIG } from '@/config/escrow-bank'
import { ESCROW_CRYPTO_NETWORKS } from '@/config/escrow-crypto'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
}

export function DepositModal({ isOpen, onClose, currentUserId }: DepositModalProps) {
  const [activeTab, setActiveTab] = useState<'instant' | 'crypto' | 'wire'>('instant')
  const [selectedCrypto, setSelectedCrypto] = useState<string>('usdt_trc20')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amount, setAmount] = useState('1000')
  const [customAmount, setCustomAmount] = useState('')
  const [txHash, setTxHash] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const depositRef = `DEP-WLT-${currentUserId.slice(0, 6).toUpperCase()}`
  const cryptoConfig = ESCROW_CRYPTO_NETWORKS[selectedCrypto] || ESCROW_CRYPTO_NETWORKS.usdt_trc20

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleDepositSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const formData = new FormData(e.currentTarget)
    const effectiveAmount = activeTab === 'instant' ? (customAmount || amount) : customAmount
    formData.set('amount', effectiveAmount)
    formData.set(
      'method', 
      activeTab === 'instant' 
        ? 'instant_topup' 
        : activeTab === 'crypto' 
        ? `crypto_${cryptoConfig.symbol}` 
        : 'bank_wire'
    )
    formData.set('reference', txHash || depositRef)
    if (activeTab === 'crypto') {
      formData.set('notes', `Crypto deposit of ${effectiveAmount} ${cryptoConfig.token} via ${cryptoConfig.network}. TxID: ${txHash}`)
    }

    try {
      const res = await depositFundsToWallet(formData)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg(`Successfully credited $${parseFloat(effectiveAmount).toLocaleString()} USD to your Dealoura Wallet!`)
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Deposit failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Add Funds to Wallet</h3>
              <p className="text-xs text-slate-400">Load balance for instant 1-click escrow purchases</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 p-2 bg-slate-50/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'instant'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Instant Demo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crypto')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'crypto'
                ? 'bg-white text-emerald-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Crypto (USDT/USDC)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wire')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'wire'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bank Wire
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleDepositSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'instant' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Instantly load your wallet balance for immediate testing and 1-click checkout:
              </p>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                {['500', '1000', '2500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt)
                      setCustomAmount('')
                    }}
                    className={`py-3 rounded-xl border text-xs font-black transition cursor-pointer ${
                      amount === amt && !customAmount
                        ? 'border-blue-600 bg-blue-50/60 text-blue-600 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    ${parseInt(amt).toLocaleString()} USD
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                  Or Custom Amount ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="10"
                    max="50000"
                    placeholder="e.g. 1500"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'crypto' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Deposit stablecoins directly into Dealoura&apos;s vault. Funds are credited 1:1 in USD.
              </p>

              {/* Network Selector */}
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ESCROW_CRYPTO_NETWORKS).slice(0, 2).map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => setSelectedCrypto(net.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      selectedCrypto === net.id
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold block">{net.name}</span>
                    <span className="text-[10px] text-slate-400">{net.feeEstimate}</span>
                  </button>
                ))}
              </div>

              {/* QR and Address */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${cryptoConfig.address}`}
                    alt="Crypto QR"
                    className="w-20 h-20 rounded-xl bg-white p-1 border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                      Vault Address ({cryptoConfig.network})
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800 break-all bg-white p-2 rounded-xl border border-slate-200">
                      <span className="flex-1 select-all">{cryptoConfig.address}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('modal_crypto', cryptoConfig.address)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 shrink-0"
                      >
                        {copiedField === 'modal_crypto' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount and TxID inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                    Amount Sent ({cryptoConfig.token})
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    placeholder="e.g. 500"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                    Transaction Hash (TxID)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Blockchain TxID..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Transfer USD to the official Dealoura Escrow Trust Account. Always include your unique reference code so your balance is credited instantly upon clearance.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400">Beneficiary:</span>
                  <span className="font-bold text-slate-800">{ESCROW_BANK_CONFIG.accountName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-bold text-slate-800">{ESCROW_BANK_CONFIG.bankName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="font-mono font-bold text-slate-800">{ESCROW_BANK_CONFIG.accountNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-400">Routing / SWIFT:</span>
                  <span className="font-mono font-bold text-slate-800">{ESCROW_BANK_CONFIG.routingOrSwiftCode}</span>
                </div>
                <div className="flex justify-between items-center py-1 bg-amber-50 px-2 rounded-lg border border-amber-200">
                  <span className="text-amber-800 font-bold">Mandatory Reference:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-amber-900">{depositRef}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('ref', depositRef)}
                      className="p-1 text-amber-700 hover:text-amber-900"
                    >
                      {copiedField === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                  Amount Transferred ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="50"
                    required
                    placeholder="e.g. 2000"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Processing Deposit...</span>
              ) : (
                <>
                  <span>Credit ${parseFloat(customAmount || amount || '0').toLocaleString()} to Wallet</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
