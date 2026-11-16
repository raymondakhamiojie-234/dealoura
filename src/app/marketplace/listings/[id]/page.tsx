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
  HelpCircle,
  MessageSquare,
  Shield,
  Clock,
  ExternalLink,
  DollarSign
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

  const platformBadgeStyle = listing.platform === 'Facebook'
    ? 'bg-[#1877F2] text-white'
    : listing.platform === 'YouTube'
    ? 'bg-[#FF0000] text-white'
    : listing.platform === 'TikTok'
    ? 'bg-black text-white'
    : listing.platform === 'Instagram'
    ? 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white'
    : listing.platform === 'Discord'
    ? 'bg-[#5865F2] text-white'
    : listing.platform === 'Twitter / X'
    ? 'bg-slate-900 text-white'
    : 'bg-[#101828] text-white'

  return (
    <div className="bg-[#F7F9FC] min-h-screen py-10 font-sans text-[#101828]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Back Navigation & Guarantee Badge */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/marketplace"
            className="inline-flex items-center text-xs font-bold text-[#667085] hover:text-[#101828] transition gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#16A36A] font-bold bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full w-fit">
            <ShieldCheck className="w-4 h-4" />
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
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E4E7EC] shadow-xs">
              <ListingGallery images={images} />
            </div>

            {/* Detailed Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4E7EC]">
                <h3 className="text-lg font-bold text-[#101828]">Account Overview &amp; Analytics</h3>
                <span className="text-[11px] font-mono text-[#667085]">Audited Listing</span>
              </div>
              <p className="text-[#101828]/90 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {listing.description}
              </p>
            </div>

            {/* Escrow Handover Protocol */}
            <div className="bg-white rounded-2xl p-6 border border-[#E4E7EC] shadow-xs">
              <h4 className="text-sm font-bold text-[#101828] mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#16A36A]" />
                <span>Supervised Handover Checklist for this Asset</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#667085]">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E4E7EC]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                  <span className="text-[#101828] font-medium">Primary Email Transfer</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E4E7EC]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                  <span className="text-[#101828] font-medium">2FA Phone Removal</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E4E7EC]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                  <span className="text-[#101828] font-medium">Clean Copyright Standing</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E4E7EC]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                  <span className="text-[#101828] font-medium">7-Day Evaluation Window</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Metrics, CTAs, & Seller Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs space-y-6">
              
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <Sparkles className="w-3 h-3 mr-1 text-[#16A36A]" /> Monetized
                    </span>
                  ) : null}
                  {isOwner && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-[#101828]">
                      Your Listing
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-black text-[#101828] leading-tight">
                  {listing.title}
                </h1>

                {listing.account_handle && (
                  <p className="text-xs font-mono text-[#667085] mt-1.5">
                    Handle: <span className="text-[#101828] font-semibold">{listing.account_handle}</span>
                  </p>
                )}
              </div>

              {/* Asking Price Card */}
              <div className="bg-[#F7F9FC] p-4 rounded-xl flex items-baseline justify-between border border-[#E4E7EC]">
                <span className="text-xs font-mono font-bold text-[#667085] uppercase tracking-wider">Asking Price</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${isSold ? 'text-slate-400 line-through' : 'text-[#101828]'}`}>
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
                <div className="bg-[#F7F9FC] p-3.5 rounded-xl border border-[#E4E7EC]">
                  <div className="flex items-center text-[10px] font-mono font-bold text-[#667085] mb-1">
                    <Users className="w-3.5 h-3.5 mr-1 text-[#16A36A]" /> AUDIENCE
                  </div>
                  <div className="text-base font-black text-[#101828]">{followersDisplay}</div>
                  <div className="text-[11px] text-[#667085]">Followers / Subs</div>
                </div>

                <div className="bg-[#F7F9FC] p-3.5 rounded-xl border border-[#E4E7EC]">
                  <div className="flex items-center text-[10px] font-mono font-bold text-[#667085] mb-1">
                    <Tag className="w-3.5 h-3.5 mr-1 text-blue-600" /> NICHE
                  </div>
                  <div className="text-base font-black text-[#101828] truncate">{listing.niche || 'General'}</div>
                  <div className="text-[11px] text-[#667085]">Category</div>
                </div>
              </div>

              {/* Action Buttons */}
              {isSold ? (
                <div className="space-y-3 pt-2">
                  <div className="w-full flex items-center justify-center py-3.5 px-6 border border-[#E4E7EC] rounded-xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed">
                    Listing Sold &amp; Completed
                  </div>
                  {!isOwner && user && (
                    <Link
                      href={`/dashboard/messages/new?listing_id=${listing.id}&seller_id=${listing.seller_id}`}
                      className="w-full flex items-center justify-center py-3 px-6 border border-[#E4E7EC] rounded-xl text-sm font-semibold text-[#101828] bg-white hover:bg-slate-50 transition"
                    >
                      Message Seller
                    </Link>
                  )}
                </div>
              ) : !isOwner && user ? (
                <div className="space-y-3 pt-2">
                  <Link
                    href={`/dashboard/offers/new?listing_id=${listing.id}`}
                    className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl shadow-md text-sm font-bold text-white bg-[#16A36A] hover:bg-[#138a59] transition"
                  >
                    Make an Escrow Offer
                  </Link>
                  <Link
                    href={`/dashboard/messages/new?listing_id=${listing.id}&seller_id=${listing.seller_id}`}
                    className="w-full flex items-center justify-center py-3 px-6 border border-[#E4E7EC] rounded-xl text-sm font-semibold text-[#101828] bg-white hover:bg-slate-50 transition"
                  >
                    Message Seller
                  </Link>
                </div>
              ) : null}

              {!user && !isSold && (
                <div className="bg-[#F7F9FC] rounded-xl p-5 text-center border border-[#E4E7EC] space-y-3">
                  <p className="text-xs text-[#667085]">
                    Sign in or create an account to submit an escrow offer or speak with this seller.
                  </p>
                  <Link
                    href={`/login?redirect=/marketplace/listings/${listing.id}`}
                    className="inline-block w-full py-3 px-6 bg-[#16A36A] hover:bg-[#138a59] text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    Sign In to Make an Escrow Offer
                  </Link>
                </div>
              )}

              {/* Seller Information Card */}
              <div className="border-t border-[#E4E7EC] pt-5">
                <h4 className="text-[10px] font-mono font-bold text-[#667085] uppercase tracking-wider mb-3">
                  Seller Profile
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-[#18263B] text-white flex items-center justify-center font-bold text-base">
                      {listing.user_profiles?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <Link
                        href={`/seller/${listing.user_profiles?.username}`}
                        className="font-bold text-sm text-[#101828] hover:text-[#16A36A] transition"
                      >
                        @{listing.user_profiles?.username || 'seller'}
                      </Link>
                      <p className="text-[11px] text-[#667085]">Dealoura Verified Member</p>
                    </div>
                  </div>
                  <Link
                    href={`/seller/${listing.user_profiles?.username}`}
                    className="text-xs font-bold text-[#16A36A] hover:underline"
                  >
                    View Store &rarr;
                  </Link>
                </div>
              </div>

            </div>

            {/* Dealoura Escrow Security Guarantee Box */}
            <div className="bg-[#101828] text-white rounded-2xl p-6 shadow-md border border-[#18263B] space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wide">Dealoura Escrow Protocol</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your payment is never sent directly to the seller. Funds are locked in our secure escrow vault until the Dealoura Escrow Agent verifies credentials and you complete your 7-day evaluation window.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
