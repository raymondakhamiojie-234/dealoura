import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ListingGallery from './ListingGallery'
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Tag, 
  ArrowLeft, 
  Lock, 
  Sparkles,
  Star
} from 'lucide-react'

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('title, platform, price, description')
    .eq('id', params.id)
    .single()

  if (!listing) {
    return { title: 'Listing Not Found | Dealoura' }
  }

  return {
    title: `${listing.title} — ${listing.platform || 'Digital Asset'} for $${listing.price} | Dealoura Escrow`,
    description: listing.description?.slice(0, 160) || 'Verified digital asset with guaranteed escrow protection on Dealoura.',
  }
}

export default async function ListingDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the listing, seller profile, and listing media
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      user_profiles:seller_id (id, username, full_name, avatar_url, is_verified, verification_level, is_trusted),
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

  const platformBadgeStyle = listing.platform === 'Facebook'
    ? 'bg-[#1877F2] text-white'
    : listing.platform === 'YouTube'
    ? 'bg-[#FF0000] text-white'
    : listing.platform === 'TikTok'
    ? 'bg-[#010b13] text-[#ebf1f5]'
    : listing.platform === 'Instagram'
    ? 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white'
    : listing.platform === 'Discord'
    ? 'bg-[#5865F2] text-white'
    : listing.platform === 'Twitter / X'
    ? 'bg-[#010b13] text-[#ebf1f5]'
    : 'bg-[#010b13] text-[#ebf1f5]'

  return (
    <div className="bg-[#ebf1f5] min-h-screen py-10 font-sans text-[#010b13]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Back Navigation & Guarantee Badge */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/marketplace"
            className="inline-flex items-center text-xs font-bold text-[#526371] hover:text-[#010b13] transition gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#010b13] font-bold bg-white border border-[#d2dde4] px-3.5 py-1.5 rounded-full w-fit shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#010b13]" />
            <span>Dealoura Escrow Protection Guaranteed</span>
          </div>
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
                <p className="text-xs text-rose-700">The escrow transaction and ownership handover for this asset have successfully concluded.</p>
              </div>
            </div>
            <Link href="/marketplace" className="text-xs font-bold text-rose-800 hover:underline shrink-0 hidden sm:inline">
              Browse Active Channels &rarr;
            </Link>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${isSold ? 'opacity-85' : ''}`}>
          
          {/* Left Column: Image Proof Gallery & Description (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#d2dde4] shadow-xs">
              <ListingGallery images={images} platform={listing.platform} title={listing.title} />
            </div>

            {/* Detailed Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d2dde4]">
                <h3 className="text-lg font-bold text-[#010b13]">Account Overview &amp; Analytics</h3>
                <span className="text-[11px] font-mono text-[#526371]">Audited Listing</span>
              </div>
              <p className="text-[#010b13]/90 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {listing.description}
              </p>
            </div>

            {/* Escrow Handover Protocol */}
            <div className="bg-white rounded-2xl p-6 border border-[#d2dde4] shadow-xs">
              <h4 className="text-sm font-bold text-[#010b13] mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#010b13]" />
                <span>Supervised Handover Checklist for this Asset</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#526371]">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#ebf1f5] border border-[#d2dde4]">
                  <CheckCircle2 className="w-4 h-4 text-[#010b13] shrink-0" />
                  <span className="text-[#010b13] font-medium">Primary Email Transfer</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#ebf1f5] border border-[#d2dde4]">
                  <CheckCircle2 className="w-4 h-4 text-[#010b13] shrink-0" />
                  <span className="text-[#010b13] font-medium">2FA Phone Removal</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#ebf1f5] border border-[#d2dde4]">
                  <CheckCircle2 className="w-4 h-4 text-[#010b13] shrink-0" />
                  <span className="text-[#010b13] font-medium">Clean Copyright Standing</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#ebf1f5] border border-[#d2dde4]">
                  <CheckCircle2 className="w-4 h-4 text-[#010b13] shrink-0" />
                  <span className="text-[#010b13] font-medium">7-Day Evaluation Window</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Metrics, CTAs, & Seller Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs space-y-6">
              
              {/* Title & Badge */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${platformBadgeStyle}`}>
                    {listing.platform || 'Account'}
                  </span>
                  {isSold ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 uppercase">
                      SOLD
                    </span>
                  ) : listing.monetized ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                      <Sparkles className="w-3 h-3 mr-1 text-[#010b13]" /> Monetized
                    </span>
                  ) : null}
                  {isOwner && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                      Your Listing
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-black text-[#010b13] leading-tight">
                  {listing.title}
                </h1>

                {listing.account_handle && (
                  <p className="text-xs font-mono text-[#526371] mt-1.5">
                    Handle: <span className="text-[#010b13] font-semibold">{listing.account_handle}</span>
                  </p>
                )}
              </div>

              {/* Asking Price Card */}
              <div className="bg-[#ebf1f5] p-4 rounded-xl flex items-baseline justify-between border border-[#d2dde4]">
                <span className="text-xs font-mono font-bold text-[#526371] uppercase tracking-wider">Asking Price</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${isSold ? 'text-slate-400 line-through' : 'text-[#010b13]'}`}>
                    ${Number(listing.price).toLocaleString()}
                  </span>
                  {isSold && (
                    <span className="bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded uppercase">
                      SOLD
                    </span>
                  )}
                </div>
              </div>

              {/* Account Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#ebf1f5] p-3.5 rounded-xl border border-[#d2dde4]">
                  <div className="flex items-center text-[10px] font-mono font-bold text-[#526371] mb-1">
                    <Users className="w-3.5 h-3.5 mr-1 text-[#010b13]" /> AUDIENCE
                  </div>
                  <div className="text-base font-black text-[#010b13]">{followersDisplay}</div>
                  <div className="text-[11px] text-[#526371]">Followers / Subs</div>
                </div>

                <div className="bg-[#ebf1f5] p-3.5 rounded-xl border border-[#d2dde4]">
                  <div className="flex items-center text-[10px] font-mono font-bold text-[#526371] mb-1">
                    <Tag className="w-3.5 h-3.5 mr-1 text-[#010b13]" /> NICHE
                  </div>
                  <div className="text-base font-black text-[#010b13] truncate">{listing.niche || 'General'}</div>
                  <div className="text-[11px] text-[#526371]">Category</div>
                </div>
              </div>

              {/* Action Buttons */}
              {isSold ? (
                <div className="space-y-3 pt-2">
                  <div className="w-full flex items-center justify-center py-3.5 px-6 border border-[#d2dde4] rounded-xl bg-[#ebf1f5] text-[#526371] font-bold text-sm cursor-not-allowed">
                    Listing Sold &amp; Completed
                  </div>
                  {!isOwner && user && (
                    <Link
                      href={`/dashboard/messages/new?listing_id=${listing.id}&seller_id=${listing.seller_id}`}
                      className="w-full flex items-center justify-center py-3 px-6 border border-[#d2dde4] rounded-xl text-sm font-semibold text-[#010b13] bg-[#ebf1f5] hover:bg-[#d2dde4] transition"
                    >
                      Message Seller
                    </Link>
                  )}
                </div>
              ) : !isOwner && user ? (
                <div className="space-y-3 pt-2">
                  <Link
                    href={`/dashboard/offers/new?listing_id=${listing.id}`}
                    className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl shadow-md text-sm font-bold text-[#ebf1f5] bg-[#010b13] hover:bg-[#0a1722] transition"
                  >
                    Make an Escrow Offer
                  </Link>
                  <Link
                    href={`/dashboard/messages/new?listing_id=${listing.id}&seller_id=${listing.seller_id}`}
                    className="w-full flex items-center justify-center py-3 px-6 border border-[#d2dde4] rounded-xl text-sm font-semibold text-[#010b13] bg-[#ebf1f5] hover:bg-[#d2dde4] transition"
                  >
                    Message Seller
                  </Link>
                </div>
              ) : null}

              {!user && !isSold && (
                <div className="bg-[#ebf1f5] rounded-xl p-5 text-center border border-[#d2dde4] space-y-3">
                  <p className="text-xs text-[#526371]">
                    Sign in or create an account to submit an escrow offer or speak with this seller.
                  </p>
                  <Link
                    href={`/login?redirect=/marketplace/listings/${listing.id}`}
                    className="inline-block w-full py-3 px-6 bg-[#010b13] hover:bg-[#0a1722] text-[#ebf1f5] font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    Sign In to Make an Escrow Offer
                  </Link>
                </div>
              )}

              {/* Seller Information Card */}
              <div className="border-t border-[#d2dde4] pt-5">
                <h4 className="text-[10px] font-mono font-bold text-[#526371] uppercase tracking-wider mb-3">
                  Seller Profile
                </h4>
                {(() => {
                  const sellerProf = listing.user_profiles as any
                  const isTrusted = Boolean(sellerProf?.is_trusted || (sellerProf?.verification_level && sellerProf.verification_level >= 3))
                  const isVerified = Boolean(sellerProf?.is_verified || (sellerProf?.verification_level && sellerProf.verification_level >= 2) || isTrusted)

                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-[#010b13] text-[#ebf1f5] flex items-center justify-center font-bold text-base">
                          {listing.user_profiles?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link
                              href={`/seller/${listing.user_profiles?.username}`}
                              className="font-bold text-sm text-[#010b13] hover:underline transition"
                            >
                              @{listing.user_profiles?.username || 'seller'}
                            </Link>
                            {isTrusted ? (
                              <span className="text-[9px] font-mono font-bold uppercase bg-amber-400 text-[#010b13] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>Trusted</span>
                              </span>
                            ) : isVerified ? (
                              <span className="text-[9px] font-mono font-bold uppercase bg-[#010b13] text-[#ebf1f5] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                <span>Verified</span>
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-[#526371] mt-0.5">
                            {isTrusted ? 'Level 3 Trusted Partner' : isVerified ? 'Level 2 Verified Seller' : 'Registered Member'}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/seller/${listing.user_profiles?.username}`}
                        className="text-xs font-bold text-[#010b13] hover:underline shrink-0"
                      >
                        View Store &rarr;
                      </Link>
                    </div>
                  )
                })()}
              </div>

            </div>

            {/* Dealoura Escrow Security Guarantee Box */}
            <div className="bg-[#010b13] text-[#ebf1f5] rounded-2xl p-6 shadow-md border border-[#0a1722] space-y-3">
              <div className="flex items-center space-x-2 text-white">
                <ShieldCheck className="w-5 h-5 text-[#ebf1f5]" />
                <span className="font-bold text-xs uppercase tracking-wide">Dealoura Escrow Protocol</span>
              </div>
              <p className="text-xs text-[#ebf1f5]/80 leading-relaxed">
                Your payment is never sent directly to the seller. Funds are locked in our secure escrow vault until the Dealoura Escrow Agent verifies credentials and you complete your 7-day evaluation window.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
