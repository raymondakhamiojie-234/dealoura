import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ListingGallery from './ListingGallery'
import { ShieldCheck, Users, CheckCircle2, DollarSign, Tag, ArrowLeft } from 'lucide-react'

export default async function ListingDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the listing, seller profile, and listing media
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      user_profiles:seller_id (id, username, full_name, avatar_url),
      listing_media (id, media_url, display_order)
    `)
    .eq('id', params.id)
    .single()

  if (error || !listing) {
    notFound()
  }

  const isOwner = user?.id === listing.seller_id
  const isSold = listing.status === 'sold'
  const images = (listing.listing_media || []).sort(
    (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
  )

  const followersDisplay = listing.followers_count
    ? Number(listing.followers_count).toLocaleString()
    : 'N/A'

  const platformBg = listing.platform === 'Facebook'
    ? 'bg-[#1877F2] text-white'
    : 'bg-blue-100 text-blue-800'

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Top back navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Marketplace
        </Link>
      </div>

      {/* Top Sold Banner Alert */}
      {isSold && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-full uppercase tracking-wider shrink-0">
              SOLD
            </span>
            <div>
              <h4 className="text-sm font-bold text-rose-900">This account has been sold</h4>
              <p className="text-xs text-rose-700">The escrow transaction for this asset has been completed.</p>
            </div>
          </div>
          <Link href="/#browse" className="text-xs font-bold text-rose-800 hover:underline shrink-0 hidden sm:inline">
            Browse Active &rarr;
          </Link>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${isSold ? 'opacity-85' : ''}`}>
        
        {/* Left Column: Image Proof Gallery & Description (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <ListingGallery images={images} />

          {/* Detailed Description */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About this Account</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Right Column: Pricing, Verified Metrics, Actions, & Escrow (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
            
            {/* Title & Badge */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${platformBg}`}>
                  {listing.platform || 'Account'}
                </span>
                {isSold ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 uppercase">
                    SOLD
                  </span>
                ) : listing.monetized ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Monetized
                  </span>
                ) : null}
                {isOwner && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    Your Listing
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {listing.title}
              </h1>

              {listing.account_handle && (
                <p className="text-sm font-medium text-gray-500 mt-1">
                  Handle: <span className="text-gray-800 font-semibold">{listing.account_handle}</span>
                </p>
              )}
            </div>

            {/* Price Card */}
            <div className="bg-slate-50 p-4 rounded-xl flex items-baseline justify-between border border-slate-100">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Asking Price</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${isSold ? 'text-gray-400 line-through' : 'text-blue-600'}`}>
                  ${listing.price}
                </span>
                {isSold && (
                  <span className="bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded uppercase">
                    SOLD
                  </span>
                )}
              </div>
            </div>

            {/* Account Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center text-xs font-semibold text-gray-400 mb-1">
                  <Users className="w-3.5 h-3.5 mr-1 text-blue-500" /> AUDIENCE
                </div>
                <div className="text-base font-bold text-gray-900">{followersDisplay}</div>
                <div className="text-[11px] text-gray-400">Followers / Subs</div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center text-xs font-semibold text-gray-400 mb-1">
                  <Tag className="w-3.5 h-3.5 mr-1 text-purple-500" /> NICHE
                </div>
                <div className="text-base font-bold text-gray-900 truncate">{listing.niche || 'General'}</div>
                <div className="text-[11px] text-gray-400">Category</div>
              </div>
            </div>

            {/* Action Buttons */}
            {isSold ? (
              <div className="space-y-3 pt-2">
                <div className="w-full flex items-center justify-center py-3.5 px-6 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed">
                  Listing Sold & Completed
                </div>
                {!isOwner && user && (
                  <Link
                    href={`/dashboard/messages/new?listing_id=${listing.id}&seller_id=${listing.seller_id}`}
                    className="w-full flex items-center justify-center py-3 px-6 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
                  >
                    Message Seller
                  </Link>
                )}
              </div>
            ) : !isOwner && user ? (
              <div className="space-y-3 pt-2">
                <Link
                  href={`/dashboard/offers/new?listing_id=${listing.id}`}
                  className="w-full flex items-center justify-center py-3.5 px-6 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                  Make an Offer
                </Link>
                <Link
                  href={`/dashboard/messages/new?listing_id=${listing.id}&seller_id=${listing.seller_id}`}
                  className="w-full flex items-center justify-center py-3 px-6 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                  Message Seller
                </Link>
              </div>
            ) : null}

            {!user && !isSold && (
              <div className="bg-blue-50/50 rounded-xl p-5 text-center border border-blue-100">
                <p className="text-sm text-gray-700 mb-3">Log in to contact the seller or submit an offer.</p>
                <Link
                  href="/login"
                  className="inline-block py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition"
                >
                  Log In to Buy
                </Link>
              </div>
            )}

            {/* Seller Information Card */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Verified Seller</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {listing.user_profiles?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <Link
                      href={`/seller/${listing.user_profiles?.username}`}
                      className="font-bold text-gray-900 hover:text-blue-600 transition"
                    >
                      {listing.user_profiles?.username}
                    </Link>
                    <p className="text-xs text-gray-400">Verified Marketplace Member</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Dealoura Escrow Security Guarantee Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-blue-400">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-sm uppercase tracking-wide">Dealoura Escrow Protection</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your payment is never sent directly to the seller. Funds are locked in our secure escrow vault until the Dealoura Escrow Agent verifies the credentials and you complete your 7-day evaluation.
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}
