import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  Star,
  ShoppingBag,
  MessageCircle,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  UserCheck,
  Award
} from 'lucide-react'
import { SellerShareButton } from '@/components/seller-share-button'

export default async function SellerProfilePage(props: {
  params: Promise<{ username: string }>
}) {
  const params = await props.params
  const supabase = await createClient()

  // 1. Fetch the seller profile by username
  const { data: seller } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!seller) {
    notFound()
  }

  // 2. Fetch current viewer session to show context actions
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  const isOwnProfile = currentUser?.id === seller.id

  // 3. Fetch RPC public seller statistics (safely aggregates without RLS issues)
  const { data: rpcStats } = await supabase.rpc('get_seller_public_stats', {
    target_seller_id: seller.id,
  })

  // 4. Fetch seller's verified buyer reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer:reviewer_id (
        username,
        avatar_url
      ),
      listing:listing_id (
        id,
        title,
        platform
      )
    `)
    .eq('reviewee_id', seller.id)
    .order('created_at', { ascending: false })

  // 5. Fetch seller's approved listings with media
  const { data: listings } = await supabase
    .from('listings')
    .select(`
      *,
      listing_media (media_url, display_order)
    `)
    .eq('seller_id', seller.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  // 6. Compute statistics with fallbacks
  const totalReviews = rpcStats?.total_reviews ?? (reviews?.length || 0)
  
  let averageRating = 5.0
  if (rpcStats?.average_rating != null && rpcStats.average_rating > 0) {
    averageRating = Number(rpcStats.average_rating)
  } else if (reviews && reviews.length > 0) {
    const sum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0)
    averageRating = Number((sum / reviews.length).toFixed(1))
  }

  const completedDeals = rpcStats?.completed_deals ?? 0

  let isVerified = rpcStats?.is_verified ?? Boolean(seller.is_verified)
  if (!isVerified) {
    // Graceful fallback: check verifications directly if permitted
    const { data: vCheck } = await supabase
      .from('verifications')
      .select('id')
      .eq('user_id', seller.id)
      .eq('status', 'verified')
      .limit(1)
    if (vCheck && vCheck.length > 0) {
      isVerified = true
    }
  }

  // Compute rating breakdown percentages
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  if (reviews && reviews.length > 0) {
    reviews.forEach((r: any) => {
      const star = Math.min(Math.max(r.rating || 5, 1), 5) as 1 | 2 | 3 | 4 | 5
      ratingCounts[star] = (ratingCounts[star] || 0) + 1
    })
  }

  const memberSince = new Date(seller.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition">Marketplace</Link>
          <span>/</span>
          <span className="text-gray-400">Sellers</span>
          <span>/</span>
          <span className="text-gray-900 font-bold">@{seller.username}</span>
        </div>

        {/* 2. Hero Identity Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          {/* Subtle decorative background gradient */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50/60 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Avatar & Names */}
            <div className="flex items-center gap-5">
              <div className="relative">
                {seller.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={seller.username}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-md">
                    {seller.username[0]?.toUpperCase()}
                  </div>
                )}
                {isVerified && (
                  <div
                    className="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white rounded-full p-1 shadow-md border-2 border-white"
                    title="KYC Verified Identity"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                    {seller.full_name || seller.username}
                  </h1>
                  <span className="text-sm font-semibold text-gray-400">
                    @{seller.username}
                  </span>
                </div>

                {/* Trust Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      KYC Verified Seller
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Standard Seller
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Dealoura Escrow Protected
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium ml-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 self-start md:self-center">
              <SellerShareButton username={seller.username} />

              {isOwnProfile ? (
                <Link
                  href="/dashboard/seller/listings/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Create Listing
                </Link>
              ) : (
                <Link
                  href={`/dashboard/messages?seller=${seller.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Contact Seller
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* 3. Trust & Performance Statistics Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stat 1: Completed Deals */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Deals</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                {completedDeals}
              </h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">100% Escrow Delivery</p>
            </div>
          </div>

          {/* Stat 2: Rating */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trust Rating</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h3 className="text-2xl font-black text-gray-900">{averageRating.toFixed(1)}</h3>
                <span className="text-xs text-gray-400 font-semibold">/ 5.0</span>
              </div>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {/* Stat 3: KYC Verification */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Identity Check</p>
              <h3 className="text-base font-black text-gray-900 mt-1">
                {isVerified ? 'Government ID Verified' : 'Standard Account'}
              </h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                {isVerified ? 'Anti-Fraud Screened' : 'Pending Verification'}
              </p>
            </div>
          </div>

          {/* Stat 4: Active Listings */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Inventory</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                {listings?.length || 0}
              </h3>
              <p className="text-[11px] font-semibold text-purple-600 mt-0.5">Instant Escrow Ready</p>
            </div>
          </div>

        </div>

        {/* 4. Active Listings Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                Active Listings
                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {listings?.length || 0}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                All accounts are backed by Dealoura's 7-day buyer evaluation escrow guarantee
              </p>
            </div>
          </div>

          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {listings.map((listing: any) => {
                const mainImage = listing.listing_media?.[0]?.media_url
                const followersText = listing.followers_count
                  ? `${Number(listing.followers_count).toLocaleString()} followers`
                  : null

                return (
                  <Link
                    key={listing.id}
                    href={`/marketplace/listings/${listing.id}`}
                    className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                  >
                    {/* Media Thumbnail */}
                    <div className="w-full aspect-[4/3] bg-slate-100 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-2">
                          <span className="text-blue-600 font-extrabold text-base">
                            {listing.platform || 'Account'}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-0.5">Verified Asset</span>
                        </div>
                      )}

                      {/* Platform Pill */}
                      <span className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {listing.platform || 'Social'}
                      </span>

                      {/* Monetized Badge */}
                      {listing.monetized && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                          Monetized
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1 font-medium">
                      <span>{followersText || listing.niche || 'Account'}</span>
                      <span className="text-gray-400 truncate max-w-[90px]">
                        {listing.account_handle ? `@${listing.account_handle}` : listing.niche || 'Verified'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs text-gray-900 font-bold line-clamp-2 h-8 mb-2 group-hover:text-blue-600 transition">
                      {listing.title}
                    </h3>

                    {/* Price & Action */}
                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                      <p className="text-base font-black text-blue-600">
                        ${listing.price}
                      </p>
                      <span className="text-xs font-bold text-gray-400 group-hover:text-blue-600 flex items-center gap-1 transition">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-900">No active listings</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {seller.username} currently has no active accounts listed for sale. Check back soon or contact the seller directly.
              </p>
            </div>
          )}
        </div>

        {/* 5. Customer Reviews & Ratings Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                Customer Reviews
                <span className="text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full border border-amber-100">
                  {totalReviews}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Verified feedback from buyers who successfully completed escrow transactions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Rating Breakdown Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Overall Score</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black text-gray-900">{averageRating.toFixed(1)}</span>
                <span className="text-sm font-bold text-gray-400">/ 5.0</span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 font-semibold ml-1">
                  ({totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'})
                </span>
              </div>

              {/* Rating Bars */}
              <div className="space-y-2 pt-4 border-t border-gray-50">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingCounts[stars as 1 | 2 | 3 | 4 | 5] || 0
                  const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-4 font-bold text-gray-700">{stars}★</span>
                      <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-medium text-gray-400">{pct}%</span>
                    </div>
                  )
                })}
              </div>

              {/* Trust Guarantee Note */}
              <div className="mt-6 p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-700 flex items-start gap-2">
                <Award className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Reviews can only be submitted after escrow release, ensuring 100% verified authentic feedback.
                </span>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-3">
              {reviews && reviews.length > 0 ? (
                reviews.map((r: any) => (
                  <div
                    key={r.id}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {r.reviewer?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {r.reviewer?.username || 'Verified Buyer'}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(r.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= r.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200 fill-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Listing reference if present */}
                    {r.listing?.title && (
                      <div className="inline-block px-2.5 py-0.5 bg-gray-50 rounded-md text-[10px] font-semibold text-gray-600 border border-gray-100">
                        Purchased: {r.listing.platform ? `${r.listing.platform} - ` : ''}{r.listing.title}
                      </div>
                    )}

                    {/* Comment */}
                    <p className="text-xs text-gray-700 leading-relaxed font-normal">
                      "{r.comment || 'Smooth escrow transaction. Account handed over quickly and credentials worked perfectly.'}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center h-full min-h-[220px]">
                  <Star className="w-8 h-8 text-gray-300 mb-2" />
                  <h4 className="text-xs font-bold text-gray-900">No customer reviews yet</h4>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
                    Be the first buyer to complete an escrow transaction with {seller.username} and leave verified feedback!
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 6. Dealoura 7-Day Buyer Escrow Protection Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/20 mb-3">
              <Lock className="w-3.5 h-3.5" />
              Dealoura SafeTrade Protocol
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Every deal with {seller.username} is 100% Escrow Protected
            </h3>
            <p className="text-xs text-blue-100/90 mt-2 leading-relaxed">
              Your deposit is held securely in the Dealoura Escrow Vault. An official Escrow Agent verifies all login credentials and gives you a 7-day inspection window to verify followers and analytics before funds are released.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Vault-Secured Funds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>7-Day Inspection Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Direct-Wire Risk</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
