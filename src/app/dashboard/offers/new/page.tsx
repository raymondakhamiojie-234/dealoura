import { createClient } from '@/utils/supabase/server'
import { makeOffer } from '@/app/actions/offers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, DollarSign, Lock, AlertCircle } from 'lucide-react'

export default async function NewOfferPage(props: { searchParams: Promise<{ listing_id: string }> }) {
  const searchParams = await props.searchParams
  const listingId = searchParams.listing_id
  if (!listingId) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('listings')
    .select('title, price, seller_id, status, platform')
    .eq('id', listingId)
    .single()

  if (!listing) notFound()

  // Prevent making offer on sold listing
  if (listing.status === 'sold') {
    return (
      <div className="min-h-screen bg-[#ebf1f5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-[#ffffff] border border-[#d2dde4] p-8 rounded-2xl text-center space-y-4 shadow-xs">
            <span className="inline-block px-3 py-1 bg-[#010b13] text-[#ebf1f5] text-[10px] font-mono font-bold rounded-full uppercase">
              Sold Out
            </span>
            <h2 className="text-xl font-black text-[#010b13]">This Asset Has Already Been Sold</h2>
            <p className="text-xs text-[#526371] leading-relaxed">
              This channel was successfully acquired and closed through the Dealoura Escrow Desk. Browse other verified live assets.
            </p>
            <div className="pt-2">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition"
              >
                Browse Available Channels
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Prevent making offer on own listing
  if (listing.seller_id === user.id) {
    return (
      <div className="min-h-screen bg-[#ebf1f5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-[#ffffff] border border-[#d2dde4] p-8 rounded-2xl text-center space-y-3 shadow-xs">
            <AlertCircle className="w-8 h-8 text-[#010b13] mx-auto" />
            <h2 className="text-lg font-black text-[#010b13]">Action Not Allowed</h2>
            <p className="text-xs text-[#526371]">
              You are the seller of this listing. You cannot submit an offer on your own digital asset.
            </p>
            <div className="pt-2">
              <Link
                href={`/marketplace/listings/${listingId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#010b13] underline"
              >
                Back to Listing Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ebf1f5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link
          href={`/marketplace/listings/${listingId}`}
          className="inline-flex items-center text-xs font-bold text-[#526371] hover:text-[#010b13] transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Listing
        </Link>

        {/* Card */}
        <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs space-y-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
              Escrow Negotiation
            </span>
            <h1 className="text-2xl font-black text-[#010b13] tracking-tight mt-2">Make an Offer</h1>
            <p className="text-xs text-[#526371] mt-1">
              Submit a formal purchase proposal to the seller. If accepted, you will proceed to the secure escrow deposit.
            </p>
          </div>

          {/* Listing Preview Box */}
          <div className="bg-[#ebf1f5] p-5 rounded-xl border border-[#d2dde4] flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#526371] block">Target Property</span>
              <h2 className="text-base font-black text-[#010b13] mt-0.5">{listing.title}</h2>
              <span className="text-xs text-[#526371] font-semibold">{listing.platform}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono uppercase text-[#526371] block">Asking Price</span>
              <span className="text-xl font-black font-mono text-[#010b13]">${listing.price}</span>
            </div>
          </div>

          <form action={makeOffer as any} className="space-y-5">
            <input type="hidden" name="listing_id" value={listingId} />
            
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
                  className="block w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 pl-8 pr-3.5 py-3 text-xs font-mono font-bold text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
                  placeholder="0.00"
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
                className="w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 p-3.5 text-xs text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
                placeholder="Explain your interest, requested handover timeline, or reason for your offer amount..."
              />
            </div>

            <div className="p-4 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-[11px] text-[#526371] flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-[#010b13] shrink-0" />
              <span>Offers are non-binding until accepted. No funds are transferred until the seller accepts and you initiate the escrow deposit.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#ebf1f5]" />
              <span>Submit Formal Escrow Offer</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
