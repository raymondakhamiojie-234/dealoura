'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calculator, DollarSign, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

const PRESET_AMOUNTS = [500, 1500, 3000, 7500, 15000]

export function SellerPayoutCalculator() {
  const [askingPrice, setAskingPrice] = useState<number>(2000)

  // Dealoura Standard Escrow Fee: 5%
  const feePercent = 0.05
  const escrowFee = askingPrice * feePercent
  const netPayout = askingPrice - escrowFee

  return (
    <div className="bg-white rounded-3xl border border-[#E4E7EC] shadow-xl p-6 sm:p-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-6 border-b border-[#E4E7EC]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#16A36A] uppercase tracking-wider font-mono">
            <Calculator className="w-4 h-4" />
            <span>Interactive Payout Calculator</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#101828] mt-1">
            Calculate Your Net Seller Earnings
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-mono text-[#667085] block">Standard Fee</span>
          <span className="text-sm font-extrabold text-[#16A36A] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            5% Flat Fee
          </span>
        </div>
      </div>

      {/* Input Slider & Quick Presets */}
      <div className="py-6 space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="asking-price" className="text-xs font-bold uppercase text-[#667085]">
              Target Sale Price (USD)
            </label>
            <div className="flex items-center gap-1 font-mono text-2xl font-black text-[#101828]">
              <span className="text-[#667085]">$</span>
              <input
                id="asking-price"
                type="number"
                min="50"
                step="50"
                value={askingPrice}
                onChange={(e) => setAskingPrice(Math.max(0, Number(e.target.value)))}
                className="w-36 text-right font-black text-2xl bg-[#F7F9FC] border border-[#E4E7EC] rounded-xl px-3 py-1 text-[#101828] focus:border-[#16A36A] focus:bg-white outline-none"
              />
            </div>
          </div>

          <input
            type="range"
            min="100"
            max="25000"
            step="100"
            value={askingPrice}
            onChange={(e) => setAskingPrice(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#16A36A]"
          />
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#667085] font-medium mr-1">Presets:</span>
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAskingPrice(amt)}
              className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border transition ${
                askingPrice === amt
                  ? 'bg-[#101828] text-white border-[#101828]'
                  : 'bg-[#F7F9FC] text-[#667085] border-[#E4E7EC] hover:bg-slate-200/60 hover:text-[#101828]'
              }`}
            >
              ${amt.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E4E7EC]">
        
        <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E4E7EC]">
          <span className="text-xs text-[#667085] block font-medium">Gross Asset Price</span>
          <span className="text-lg font-black text-[#101828] font-mono mt-1 block">
            ${askingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#667085] mt-1 block">Amount buyer deposits</span>
        </div>

        <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E4E7EC]">
          <span className="text-xs text-[#667085] block font-medium">Dealoura 5% Escrow Fee</span>
          <span className="text-lg font-black text-rose-600 font-mono mt-1 block">
            -${escrowFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#667085] mt-1 block">Covers 2FA audit &amp; wire</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
          <span className="text-xs text-[#16A36A] block font-bold">Your Guaranteed Net Payout</span>
          <span className="text-xl font-black text-[#16A36A] font-mono mt-1 block">
            ${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-700 mt-1 block">0% chargeback risk</span>
        </div>

      </div>

      {/* Transparency Note */}
      <div className="mt-6 p-4 rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] text-xs text-[#667085] space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-[#101828]">
          <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
          <span>What the 5% Escrow Fee Includes:</span>
        </div>
        <p className="leading-relaxed pl-5">
          Dedicated escrow officer oversight, multi-factor credential purging, primary email reassignment, buyer payment hold reconciliation, and irrevocable domestic wire or ACH disbursement.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link
          href="/dashboard/seller/listings/new"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#16A36A] hover:bg-[#138a59] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-900/20 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>List Your First Digital Asset Free</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
