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
  TrendingUp,
  UserCheck,
  Award,
  Tag,
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
    .in('status', ['approved', 'sold'])
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
    <div className="min-h-screen bg-[#ebf1f5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#526371]">
          <Link href="/marketplace" className="hover:text-[#010b13] transition">Marketplace</Link>
          <span>/</span>
          <span className="text-[#526371]">Sellers</span>
          <span>/</span>
          <span className="text-[#010b13]">@{seller.username}</span>
        </div>

        {/* 2. Hero Identity Card */}
        <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Avatar & Names */}
            <div className="flex items-center gap-5">
              <div className="relative">
                {seller.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={seller.username}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#d2dde4] shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#010b13] text-[#ebf1f5] font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xs">
                    {seller.username[0]?.toUpperCase()}
                  </div>
                )}
                {isVerified && (
                  <div
                    className="absolute -bottom-1.5 -right-1.5 bg-[#010b13] text-[#ebf1f5] rounded-full p-1 shadow-xs border-2 border-[#ffffff]"
                    title="KYC Verified Identity"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">
                    {seller.full_name || seller.username}
                  </h1>
                  <span className="text-xs font-mono font-bold text-[#526371]">
                    @{seller.username}
                  </span>
                </div>

                {/* Trust Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#010b13]" />
                      KYC Verified Merchant
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#ebf1f5] text-[#526371] border border-[#d2dde4]">
                      Registered Seller
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#010b13] text-[#ebf1f5]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ebf1f5]" />
                    Escrow Protected
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-[#526371] font-medium ml-1">
                    <Calendar className="w-3.5 h-3.5 text-[#526371]" />
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
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Create Listing
                </Link>
              ) : (
                <Link
                  href={`/dashboard/messages?seller=${seller.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold transition shadow-xs cursor-pointer"
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
          <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs flex items-start gap-4">
            <div className="p-3 bg-[#010b13] text-[#ebf1f5] rounded-xl shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-[#526371] uppercase tracking-wider">Completed Deals</p>
              <h3 className="text-2xl font-black font-mono text-[#010b13] mt-0.5">
                {completedDeals}
              </h3>
              <p className="text-[11px] font-semibold text-[#010b13] mt-0.5">100% Escrow Delivery</p>
            </div>
          </div>

          {/* Stat 2: Rating */}
          <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs flex items-start gap-4">
            <div className="p-3 bg-[#010b13] text-[#ebf1f5] rounded-xl shrink-0">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-[#526371] uppercase tracking-wider">Trust Score</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h3 className="text-2xl font-black font-mono text-[#010b13]">{averageRating.toFixed(1)}</h3>
                <span className="text-xs text-[#526371] font-mono">/ 5.0</span>
              </div>
              <p className="text-[11px] text-[#526371] mt-0.5">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {/* Stat 3: KYC Verification */}
          <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs flex items-start gap-4">
            <div className="p-3 bg-[#010b13] text-[#ebf1f5] rounded-xl shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-[#526371] uppercase tracking-wider">Identity Check</p>
              <h3 className="text-sm sm:text-base font-black text-[#010b13] mt-1">
                {isVerified ? 'Government Verified' : 'Standard Account'}
              </h3>
              <p className="text-[11px] text-[#526371] mt-0.5">
                {isVerified ? 'Anti-Fraud Screened' : 'Pending Verification'}
              </p>
            </div>
          </div>

          {/* Stat 4: Active Listings */}
          <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs flex items-start gap-4">
            <div className="p-3 bg-[#010b13] text-[#ebf1f5] rounded-xl shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-[#526371] uppercase tracking-wider">Active Inventory</p>
              <h3 className="text-2xl font-black font-mono text-[#010b13] mt-0.5">
                {listings?.length || 0}
              </h3>
              <p className="text-[11px] text-[#526371] mt-0.5">Instant Escrow Ready</p>
            </div>
          </div>

        </div>

        {/* 4. Active Listings Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#010b13] flex items-center gap-2">
                Merchant Listings
                <span className="text-xs font-mono font-bold bg-[#010b13] text-[#ebf1f5] px-2.5 py-0.5 rounded-full">
                  {listings?.length || 0}
                </span>
              </h2>
              <p className="text-xs text-[#526371] mt-0.5">
                All accounts are backed by Dealoura&apos;s 7-day buyer evaluation escrow guarantee
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

                const isSold = listing.status === 'sold'

                return (
                  <Link
                    key={listing.id}
                    href={`/marketplace/listings/${listing.id}`}
                    className={`group bg-[#ffffff] p-4 rounded-2xl border transition-all flex flex-col h-full ${
                      isSold
                        ? 'opacity-65 hover:opacity-85 border-[#d2dde4] shadow-none'
                        : 'border-[#d2dde4] hover:border-[#010b13] shadow-xs hover:shadow-sm'
                    }`}
                  >
                    {/* Media Thumbnail */}
                    <div className="w-full aspect-[4/3] bg-[#ebf1f5] rounded-xl mb-3 relative overflow-hidden flex items-center justify-center">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={listing.title}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            isSold ? 'grayscale-[30%]' : 'group-hover:scale-105'
                          }`}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-2">
                          <span className="text-[#010b13] font-black text-sm">
                            {listing.platform || 'Digital Asset'}
                          </span>
                          <span className="text-[10px] text-[#526371] mt-0.5">Verified Asset</span>
                        </div>
                      )}

                      {/* Sold Overlay */}
                      {isSold && (
                        <div className="absolute inset-0 bg-[#010b13]/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <span className="bg-[#010b13] text-[#ebf1f5] font-mono font-black text-xs uppercase px-3 py-1 rounded-full shadow-lg border border-[#ebf1f5]/30">
                            SOLD
                          </span>
                        </div>
                      )}

                      {/* Platform Pill */}
                      <span className="absolute top-2 left-2 bg-[#010b13] text-[#ebf1f5] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full z-20">
                        {listing.platform || 'Asset'}
                      </span>

                      {/* Monetized Badge */}
                      {listing.monetized && !isSold && (
                        <span className="absolute top-2 right-2 bg-[#ebf1f5] text-[#010b13] text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border border-[#d2dde4] uppercase z-20">
                          Monetized
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-[11px] text-[#526371] mb-1 font-medium">
                      <span>{followersText || listing.niche || 'Account'}</span>
                      <span className="text-[#526371] truncate max-w-[90px]">
                        {listing.account_handle ? `@${listing.account_handle}` : listing.niche || 'Verified'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`text-xs font-bold line-clamp-2 h-8 mb-2 transition ${
                      isSold ? 'text-[#526371]' : 'text-[#010b13] group-hover:underline'
                    }`}>
                      {listing.title}
                    </h3>

                    {/* Price & Action */}
                    <div className="mt-auto pt-3 border-t border-[#d2dde4] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-base font-black font-mono ${isSold ? 'text-[#526371] line-through' : 'text-[#010b13]'}`}>
                          ${listing.price}
                        </p>
                        {isSold && (
                          <span className="text-[9px] font-mono font-black text-[#526371] uppercase bg-[#ebf1f5] px-1 py-0.5 rounded border border-[#d2dde4]">
                            SOLD
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold flex items-center gap-1 text-[#010b13]">
                        {isSold ? 'SOLD' : <>View <ArrowRight className="w-3 h-3" /></>}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-[#ffffff] rounded-2xl p-10 text-center border border-[#d2dde4] shadow-xs">
              <ShoppingBag className="w-10 h-10 text-[#526371] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#010b13]">No active listings</h3>
              <p className="text-xs text-[#526371] mt-1 max-w-sm mx-auto">
                @{seller.username} currently has no active accounts listed for sale. Check back soon or contact the seller directly.
              </p>
            </div>
          )}
        </div>

        {/* 5. Customer Reviews & Ratings Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#010b13] flex items-center gap-2">
                Verified Buyer Feedback
                <span className="text-xs font-mono font-bold bg-[#010b13] text-[#ebf1f5] px-2.5 py-0.5 rounded-full">
                  {totalReviews}
                </span>
              </h2>
              <p className="text-xs text-[#526371] mt-0.5">
                Authentic reviews from buyers who completed escrow transactions with this seller
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Rating Breakdown Card */}
            <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#d2dde4] shadow-xs h-fit space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#526371]">Overall Trust Rating</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-[#010b13]">{averageRating.toFixed(1)}</span>
                <span className="text-sm font-bold font-mono text-[#526371]">/ 5.0</span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'text-[#010b13] fill-current'
                        : 'text-[#d2dde4] fill-current'
                    }`}
                  />
                ))}
                <span className="text-xs text-[#526371] font-semibold ml-1">
                  ({totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'})
                </span>
              </div>

              {/* Rating Bars */}
              <div className="space-y-2 pt-3 border-t border-[#d2dde4]">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingCounts[stars as 1 | 2 | 3 | 4 | 5] || 0
                  const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs text-[#526371]">
                      <span className="w-5 font-bold text-[#010b13]">{stars}★</span>
                      <div className="flex-1 bg-[#ebf1f5] h-2 rounded-full overflow-hidden border border-[#d2dde4]">
                        <div
                          className="bg-[#010b13] h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[10px] text-[#526371]">{pct}%</span>
                    </div>
                  )
                })}
              </div>

              {/* Trust Guarantee Note */}
              <div className="p-3 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-[11px] text-[#526371] flex items-start gap-2">
                <Award className="w-4 h-4 text-[#010b13] shrink-0 mt-0.5" />
                <span>
                  Feedback can only be posted after escrow payout release, guaranteeing 100% verified authentic trade reviews.
                </span>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-3">
              {reviews && reviews.length > 0 ? (
                reviews.map((r: any) => (
                  <div
                    key={r.id}
                    className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#010b13] text-[#ebf1f5] font-bold text-xs flex items-center justify-center">
                          {r.reviewer?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#010b13]">
                            @{r.reviewer?.username || 'Verified Buyer'}
                          </p>
                          <p className="text-[10px] font-mono text-[#526371]">
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
                                ? 'text-[#010b13] fill-current'
                                : 'text-[#d2dde4] fill-current'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Listing reference if present */}
                    {r.listing?.title && (
                      <div className="inline-block px-2.5 py-0.5 bg-[#ebf1f5] rounded-md text-[10px] font-mono font-semibold text-[#010b13] border border-[#d2dde4]">
                        Purchased: {r.listing.platform ? `${r.listing.platform} - ` : ''}{r.listing.title}
                      </div>
                    )}

                    {/* Comment */}
                    <p className="text-xs text-[#526371] leading-relaxed">
                      &ldquo;{r.comment || 'Smooth escrow transaction. Account handed over quickly and credentials worked perfectly.'}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-[#ffffff] rounded-2xl p-8 text-center border border-[#d2dde4] shadow-xs flex flex-col items-center justify-center h-full min-h-[220px]">
                  <Star className="w-8 h-8 text-[#526371] mb-2" />
                  <h4 className="text-xs font-bold text-[#010b13]">No customer reviews yet</h4>
                  <p className="text-[11px] text-[#526371] mt-1 max-w-xs">
                    Be the first buyer to complete an escrow transaction with @{seller.username} and leave verified feedback.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 6. Dealoura 7-Day Buyer Escrow Protection Banner */}
        <div className="bg-[#010b13] text-[#ebf1f5] rounded-2xl p-6 sm:p-8 border border-[#18263B] shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#18263B] text-[#ebf1f5] border border-[#d2dde4]/20 mb-3">
              <Lock className="w-3.5 h-3.5 text-[#ebf1f5]" />
              Dealoura SafeTrade Protocol
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#ebf1f5]">
              Every deal with @{seller.username} is 100% Escrow Protected
            </h3>
            <p className="text-xs text-[#ebf1f5]/80 mt-2 leading-relaxed">
              Your deposit is held securely in the Dealoura Escrow Vault. An official Escrow Agent inspects credentials and provides a 7-day inspection window to verify followers and analytics before any seller payout is released.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#18263B] text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ebf1f5] shrink-0" />
                <span>Vault-Secured Funds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ebf1f5] shrink-0" />
                <span>7-Day Inspection Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ebf1f5] shrink-0" />
                <span>Zero Off-Platform Wire Risk</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
