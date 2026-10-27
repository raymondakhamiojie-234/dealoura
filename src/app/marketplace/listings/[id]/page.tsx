import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ListingGallery from './ListingGallery'
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  DollarSign, 
  Tag, 
  ArrowLeft, 
  Lock, 
  Sparkles,
  Clock,
  Shield,
  HelpCircle,
  MessageSquare
} from 'lucide-react'

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

  const platformBadgeStyle = listing.platform === 'Facebook'
    ? 'bg-blue-600 text-white'
    : listing.platform === 'YouTube'
    ? 'bg-red-600 text-white'
    : listing.platform === 'TikTok'
    ? 'bg-black text-white'
    : listing.platform === 'Instagram'
    ? 'bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 text-white'
    : listing.platform === 'Discord'
    ? 'bg-[#5865F2] text-white'
    : 'bg-blue-600 text-white'

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top back navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/#browse"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 transition gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Verified Marketplace</span>
          </Link>
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
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
                <p className="text-xs text-rose-700">The escrow transaction and ownership handover for this asset have concluded.</p>
              </div>
            </div>
            <Link href="/#browse" className="text-xs font-bold text-rose-800 hover:underline shrink-0 hidden sm:inline">
              Browse Active Channels &rarr;
            </Link>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${isSold ? 'opacity-85' : ''}`}>
          
          {/* Left Column: Image Proof Gallery & Description (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
              <ListingGallery images={images} />
            </div>

            {/* Detailed Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Account Overview &amp; Analytics</h3>
                <span className="text-[11px] font-mono text-slate-400">Audited Details</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {listing.description}
              </p>
            </div>

            {/* Escrow Handover Protocol */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Supervised Handover Checklist for this Asset</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Primary Email Transfer</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>2FA Phone Removal</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Clean Copyright Status</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>7-Day Inspection Window</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Verified Metrics, Actions, & Escrow (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              
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
                      <Sparkles className="w-3 h-3 mr-1 text-emerald-600" /> Monetized
                    </span>
                  ) : null}
                  {isOwner && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                      Your Listing
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  {listing.title}
                </h1>

                {listing.account_handle && (
                  <p className="text-xs font-mono text-slate-500 mt-1.5">
                    Handle: <span className="text-slate-800 font-semibold">{listing.account_handle}</span>
                  </p>
                )}
              </div>

              {/* Price Card */}
              <div className="bg-slate-50 p-4 rounded-xl flex items-baseline justify-between border border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Asking Price</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${isSold ? 'text-slate-400 line-through' : 'text-blue-600'}`}>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center text-[10px] font-mono font-bold text-slate-400 mb-1">
                    <Users className="w-3.5 h-3.5 mr-1 text-blue-600" /> AUDIENCE
                  </div>
                  <div className="text-base font-black text-slate-900">{followersDisplay}</div>
                  <div className="text-[11px] text-slate-400">Followers / Subs</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center text-[10px] font-mono font-bold text-slate-400 mb-1">
                    <Tag className="w-3.5 h-3.5 mr-1 text-indigo-600" /> NICHE
                  </div>
                  <div className="text-base font-black text-slate-900 truncate">{listing.niche || 'General'}</div>
                  <div className="text-[11px] text-slate-400">Category</div>
                </div>
              </div>

              {/* Action Buttons */}
              {isSold ? (
                <div className="space-y-3 pt-2">
                  <div className="w-full flex items-center justify-center py-3.5 px-6 border border-slate-200 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed">
                    Listing Sold &amp; Completed
                  </div>
                  {!isOwner && user && (
                    <Link
                      href={`/dashboard/messages/new?listing_id=${listing.id}&seller_id=${listing.seller_id}`}
                      className="w-full flex items-center justify-center py-3 px-6 border border-slate-200 rounded-xl shadow-xs text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
                    >
                      Message Seller
                    </Link>
                  )}
                </div>
              ) : !isOwner && user ? (
                <div className="space-y-3 pt-2">
                  <Link
                    href={`/dashboard/offers/new?listing_id=${listing.id}`}
                    className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition"
                  >
                    Make an Escrow Offer
                  </Link>
                  <Link
                    href={`/dashboard/messages/new?listing_id=${listing.id}&seller_id=${listing.seller_id}`}
                    className="w-full flex items-center justify-center py-3 px-6 border border-slate-200 rounded-xl shadow-xs text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
                  >
                    Message Seller
                  </Link>
                </div>
              ) : null}

              {!user && !isSold && (
                <div className="bg-blue-50/70 rounded-xl p-5 text-center border border-blue-200">
                  <p className="text-xs text-slate-700 mb-3">Sign in or register to submit an escrow offer or speak with the seller.</p>
                  <Link
                    href="/login"
                    className="inline-block py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Sign In to Purchase
                  </Link>
                </div>
              )}

              {/* Seller Information Card */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">Verified Merchant</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base">
                      {listing.user_profiles?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <Link
                        href={`/seller/${listing.user_profiles?.username}`}
                        className="font-bold text-sm text-slate-900 hover:text-blue-600 transition"
                      >
                        {listing.user_profiles?.username}
                      </Link>
                      <p className="text-[11px] text-slate-400">Verified Dealoura Seller</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Dealoura Escrow Security Guarantee Box */}
            <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wide">Dealoura Escrow Protection</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your payment is never sent directly to the seller. Funds are locked in our secure escrow vault until the Dealoura Escrow Agent verifies the credentials and you complete your 7-day evaluation window.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
