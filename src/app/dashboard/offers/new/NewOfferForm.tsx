'use client'

import { useState, useTransition } from 'react'
import { makeOffer } from '@/app/actions/offers'
import { ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react'

export function NewOfferForm({
  listingId,
  askingPrice,
}: {
  listingId: string
  askingPrice: number
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const amountVal = parseFloat(formData.get('amount') as string)
    if (isNaN(amountVal) || amountVal <= 0) {
      setError('Please specify a valid purchase offer amount.')
      return
    }

    startTransition(async () => {
      try {
        const result = await makeOffer(formData)
        if (result?.error) {
          setError(result.error)
        }
      } catch (err: any) {
        // Next.js redirect() throws a NEXT_REDIRECT error which is expected on successful navigation
        if (err?.message?.includes('NEXT_REDIRECT')) {
          return
        }
        setError(err?.message || 'Failed to submit offer. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="listing_id" value={listingId} />

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="amount" className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
          Your Offer Amount (USD) <span className="text-red-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <span className="text-[#526371] text-xs font-mono font-bold">$</span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            step="0.01"
            min="1"
            required
            disabled={isPending}
            className="block w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 pl-8 pr-3.5 py-3 text-xs font-mono font-bold text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition disabled:opacity-50"
            placeholder={askingPrice ? askingPrice.toString() : '0.00'}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
          Message to Seller <span className="text-[#526371] font-normal normal-case">(Optional)</span>
        </label>
        <textarea
          name="message"
          id="message"
          rows={3}
          disabled={isPending}
          className="w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 p-3.5 text-xs text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition disabled:opacity-50"
          placeholder="Explain your interest, requested handover timeline, or reason for your offer amount..."
        />
      </div>

      <div className="p-4 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-[11px] text-[#526371] flex items-center space-x-2.5">
        <ShieldCheck className="w-4 h-4 text-[#010b13] shrink-0" />
        <span>Offers are non-binding until accepted. No funds are transferred until the seller accepts and you initiate the escrow deposit.</span>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#ebf1f5]" />
            <span>Submitting Formal Offer...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 text-[#ebf1f5]" />
            <span>Submit Escrow Proposal</span>
          </>
        )}
      </button>
    </form>
  )
}
