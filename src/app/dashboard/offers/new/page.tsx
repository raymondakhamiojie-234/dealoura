import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { NewOfferForm } from './NewOfferForm'

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

          <NewOfferForm listingId={listingId} askingPrice={listing.price} />
        </div>

      </div>
    </div>
  )
}
