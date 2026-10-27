'use client'

import { useState } from 'react'
import { X, Building2, Coins, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { requestWithdrawal } from '@/app/actions/wallet'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  availableBalance: number
}

export function WithdrawModal({ isOpen, onClose, availableBalance }: WithdrawModalProps) {
  const [method, setMethod] = useState<'bank_wire' | 'usdt_trc20' | 'usdc_polygon'>('bank_wire')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const parsedAmount = parseFloat(amount) || 0
  const fee = method === 'bank_wire' ? 15.00 : method === 'usdt_trc20' ? 2.00 : 1.00
  const netPayout = Math.max(0, Math.round((parsedAmount - fee) * 100) / 100)

  const handleWithdrawSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (parsedAmount > availableBalance) {
      setErrorMsg(`Amount exceeds available balance of $${availableBalance.toLocaleString()} USD`)
      setIsSubmitting(false)
      return
    }

    if (parsedAmount < 20) {
      setErrorMsg('Minimum withdrawal amount is $20.00 USD')
      setIsSubmitting(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('amount', parsedAmount.toString())
    formData.set('method', method)

    try {
      const res = await requestWithdrawal(formData)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg(`Withdrawal of $${netPayout.toLocaleString()} USD requested! Our finance desk will disburse your payout within 24 hours.`)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Withdrawal failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Withdraw Earnings</h3>
              <p className="text-xs text-slate-400">Transfer your available balance to your bank or crypto wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Selector */}
        <div className="grid grid-cols-3 gap-2 p-4 border-b border-slate-100 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setMethod('bank_wire')}
            className={`p-3 rounded-xl border text-center transition ${
              method === 'bank_wire'
                ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
            <span className="text-xs font-bold block">Bank Wire</span>
            <span className="text-[10px] text-slate-400">$15 fee</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('usdt_trc20')}
            className={`p-3 rounded-xl border text-center transition ${
              method === 'usdt_trc20'
                ? 'border-emerald-600 bg-emerald-50/80 text-emerald-700 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Coins className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
            <span className="text-xs font-bold block">USDT (TRC-20)</span>
            <span className="text-[10px] text-slate-400">$2 fee</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('usdc_polygon')}
            className={`p-3 rounded-xl border text-center transition ${
              method === 'usdc_polygon'
                ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Coins className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
            <span className="text-xs font-bold block">USDC (Polygon)</span>
            <span className="text-[10px] text-slate-400">$1 fee</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4">
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

          {/* Amount input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase font-mono">
                Withdrawal Amount ($ USD)
              </label>
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toString())}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Max: ${availableBalance.toLocaleString()}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="20"
                max={availableBalance}
                step="any"
                required
                placeholder="20.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          {/* Destination Fields */}
          {method === 'bank_wire' ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                  Beneficiary / Account Name
                </label>
                <input
                  type="text"
                  name="accountName"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    required
                    placeholder="e.g. Chase / Mercury"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                    Routing / SWIFT Code
                  </label>
                  <input
                    type="text"
                    name="routingNumber"
                    required
                    placeholder="e.g. 021000021"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                  Account Number / IBAN
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  required
                  placeholder="e.g. 123456789"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
                  {method === 'usdt_trc20' ? 'USDT TRC-20 Address' : 'USDC Polygon Address'}
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  required
                  placeholder={method === 'usdt_trc20' ? 'T...' : '0x...'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:border-blue-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⚠ Please double-check your recipient address. Crypto transfers cannot be reversed.
              </p>
            </div>
          )}

          {/* Breakdown Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Gross Withdrawal:</span>
              <span className="font-bold text-slate-800">${parsedAmount.toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Processing Fee:</span>
              <span className="font-bold text-rose-600">-${fee.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black pt-1 border-t border-slate-200">
              <span>Net Payout to Receive:</span>
              <span className="text-emerald-600 font-mono text-sm">${netPayout.toLocaleString()} USD</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || parsedAmount <= fee || parsedAmount > availableBalance}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <span>Request Payout of ${netPayout.toLocaleString()} USD</span>
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
