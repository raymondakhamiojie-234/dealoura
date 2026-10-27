import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  HelpCircle,
  Video,
  Camera,
  MessageCircle,
  Smartphone,
  ChevronRight,
  Shield,
  Clock,
  Layers,
  Award
} from 'lucide-react'
import { ScrollAnimation } from '@/components/scroll-animation'
import { HeroSlider } from '@/components/hero-slider'
import { MarketplaceFilterBar } from '@/components/marketplace-filter-bar'

export default async function Home(props: {
  searchParams: Promise<{
    q?: string
    platform?: string
    min_followers?: string
    monetized?: string
    sort?: string
  }>
}) {
  const searchParams = await props.searchParams
  const { q, platform, min_followers, monetized, sort } = searchParams
  const supabase = await createClient()

  // Base query for approved and sold listings
  let query = supabase
    .from('listings')
    .select(`
      *,
      user_profiles:seller_id (username),
      listing_media (media_url, display_order)
    `)
    .in('status', ['approved', 'sold'])

  // Apply filters
  if (platform && platform !== 'All') {
    query = query.eq('platform', platform)
  }

  if (monetized === 'true') {
    query = query.eq('monetized', true)
  }

  if (min_followers) {
    const minFollowersNum = parseInt(min_followers, 10)
    if (!isNaN(minFollowersNum)) {
      query = query.gte('followers_count', minFollowersNum)
    }
  }

  if (q && q.trim()) {
    const searchTerm = q.trim()
    query = query.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,niche.ilike.%${searchTerm}%,account_handle.ilike.%${searchTerm}%`
    )
  }

  // Apply sorting
  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else if (sort === 'followers') {
    query = query.order('followers_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: listings } = await query.limit(30)

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 overflow-hidden font-sans">
      
      {/* 1. Hero Section (Interactive Escrow Terminal) */}
      <HeroSlider />

      {/* 2. Four Pillars of Dealoura Escrow (Bento Grid) */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
              Institutional Escrow Protection
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Built so neither side has to take the risk.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
              Traditional trades fail because one party must send credentials or payment first. Dealoura acts as an impartial, audited middleman so every transaction is guaranteed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-300 transition-all duration-300 shadow-xs hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Vault Escrow on Every Order</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buyer payment is held in our insured escrow account from the moment they pay. Funds are never released until the buyer verifies channel ownership.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-300 transition-all duration-300 shadow-xs hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Rigorous Channel Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We inspect monetization status, copyright strikes, genuine organic subscriber engagement, and primary email ownership before approving listings.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-xs hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Supervised 2FA Handover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our escrow agents supervise removing recovery emails, clearing 2FA tokens, and binding the buyer&apos;s phone numbers, ensuring zero account pullbacks.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-amber-300 transition-all duration-300 shadow-xs hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/10 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Instant Global Payouts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once the buyer confirms handover, funds are disbursed directly to the seller via domestic bank wire, ACH, or cryptocurrency with zero chargeback risk.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. The 4-Step Escrow Blueprint */}
      <section className="py-16 sm:py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_50%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-500/30">
              End-to-End Escrow Blueprint
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              How Dealoura Protects Both Parties
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              From payment locking to final ownership handover, every step is safeguarded.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative">
              <span className="text-xs font-mono font-black text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-500/30">
                STEP 01
              </span>
              <h3 className="text-base font-bold text-white mt-4 mb-2">Buyer Deposits Into Vault</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The buyer initiates the order. Funds are placed into Dealoura&apos;s escrow vault. The seller is notified that funds are 100% verified.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative">
              <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-500/30">
                STEP 02
              </span>
              <h3 className="text-base font-bold text-white mt-4 mb-2">Dealoura Agent Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seller provides credentials into the secure vault. Dealoura agents verify ownership, monetization standing, and strike-free history.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative">
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
                STEP 03
              </span>
              <h3 className="text-base font-bold text-white mt-4 mb-2">Secure Credential Handover</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Credentials are transferred to the buyer. The buyer inspects analytics, binds their 2FA, and has a 7-day evaluation window.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative">
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-500/30">
                STEP 04
              </span>
              <h3 className="text-base font-bold text-white mt-4 mb-2">Instant Payout Release</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buyer confirms satisfaction or evaluation time concludes. Escrow funds disburse automatically to the seller&apos;s account.
              </p>
            </div>

          </div>

          <div className="mt-12 text-center">
            <Link
              href="/sell#how-it-works"
              className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 hover:text-emerald-300 transition"
            >
              <span>Read the Full Escrow Security Protocol</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Category Bento Showcase */}
      <section className="py-14 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Featured Categories
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Explore Verified Channels by Platform
              </h2>
            </div>
            <Link
              href="/#browse"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2 md:mt-0"
            >
              <span>View All Listings</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* YouTube */}
            <Link 
              href="/?platform=YouTube#browse" 
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-red-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">YouTube</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Monetized &amp; Shorts</p>
            </Link>

            {/* TikTok */}
            <Link 
              href="/?platform=TikTok#browse" 
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-900 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">TikTok</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Creator Rewards</p>
            </Link>

            {/* Instagram */}
            <Link 
              href="/?platform=Instagram#browse" 
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-pink-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Instagram</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Theme &amp; Niche Brands</p>
            </Link>

            {/* Twitter / X */}
            <Link 
              href="/?platform=Twitter+%2F+X#browse" 
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-900 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform font-black text-xl">
                𝕏
              </div>
              <h3 className="text-sm font-bold text-slate-900">Twitter / X</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Verified &amp; Aged Handles</p>
            </Link>

            {/* Facebook */}
            <Link 
              href="/?platform=Facebook#browse" 
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-blue-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform font-black text-lg">
                FB
              </div>
              <h3 className="text-sm font-bold text-slate-900">Facebook</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">High-Reach Pages</p>
            </Link>

            {/* Discord */}
            <Link 
              href="/?platform=Discord#browse" 
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Discord</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Gaming &amp; Web3 Servers</p>
            </Link>

          </div>
        </div>
      </section>

      {/* 5. Live Marketplace Explorer Feed */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Live Escrow Feed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Verified Available Channels
              </h2>
            </div>
            <div className="text-xs font-mono font-bold text-slate-500 mt-2 md:mt-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              {listings?.length || 0} listings ready for instant escrow
            </div>
          </div>

          {/* Interactive Search & Filter Bar */}
          <MarketplaceFilterBar />

          {/* Listing Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {listings && listings.length > 0 ? (
              listings.map((listing: any, index: number) => {
                const isSold = listing.status === 'sold';
                const mainImage = listing.listing_media?.[0]?.media_url;
                const followersText = listing.followers_count
                  ? `${Number(listing.followers_count).toLocaleString()} followers`
                  : null;

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
                  : 'bg-blue-600 text-white';

                return (
                  <ScrollAnimation key={listing.id} direction="up" delay={0.03 * (index % 5)}>
                    <Link href={`/marketplace/listings/${listing.id}`} className="group block h-full">
                      <div className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col h-full overflow-hidden relative ${
                        isSold
                          ? 'opacity-65 hover:opacity-85 border-slate-200 shadow-none'
                          : 'hover:shadow-xl border-slate-200/90 hover:border-blue-400 hover:-translate-y-1'
                      }`}>
                        
                        {/* Image Preview Container */}
                        <div className="w-full aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={listing.title}
                              className={`w-full h-full object-cover transition-transform duration-500 ${
                                isSold ? 'grayscale-[20%]' : 'group-hover:scale-105'
                              }`}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-4">
                              <span className="text-slate-900 font-black text-base">{listing.platform || 'Account'}</span>
                              <span className="text-[10px] font-mono text-slate-400 mt-1">Verified Escrow Asset</span>
                            </div>
                          )}

                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${platformBadgeStyle}`}>
                              {listing.platform || 'Account'}
                            </span>

                            {isSold ? (
                              <span className="bg-rose-600 text-white text-[9px] font-mono font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                SOLD
                              </span>
                            ) : listing.monetized ? (
                              <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Monetized</span>
                              </span>
                            ) : null}
                          </div>

                          {/* Sold Central Watermark Overlay */}
                          {isSold && (
                            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                              <span className="bg-rose-600 text-white font-black text-xs uppercase px-4 py-1.5 rounded-full shadow-xl tracking-widest border border-white/20">
                                COMPLETED / SOLD
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex flex-col flex-grow">
                          
                          {/* Audience & Seller Handle */}
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                            <span className="font-semibold text-slate-700">{followersText || listing.niche || 'Audience'}</span>
                            {listing.user_profiles?.username && (
                              <span className="text-slate-400 truncate max-w-[90px] font-mono">
                                @{listing.user_profiles.username}
                              </span>
                            )}
                          </div>

                          {/* Listing Title */}
                          <h3 className={`text-xs font-bold line-clamp-2 h-9 mb-3 transition leading-snug ${
                            isSold ? 'text-slate-500' : 'text-slate-900 group-hover:text-blue-600'
                          }`}>
                            {listing.title}
                          </h3>

                          {/* Footer with Price & Escrow Tag */}
                          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-baseline gap-1.5">
                              <span className={`text-base font-black ${isSold ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                ${listing.price}
                              </span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              isSold
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isSold ? 'SOLD' : 'Escrow Protected'}
                            </span>
                          </div>

                        </div>

                      </div>
                    </Link>
                  </ScrollAnimation>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No active accounts match your search</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your filters or search terms, or be the first to list a channel for sale.
                </p>
                <Link
                  href="/sell"
                  className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-blue-700 transition"
                >
                  List Your Channel
                </Link>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 6. High-Trust Guarantee Banner */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
              <ShieldCheck className="w-96 h-96 text-white" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                100% Zero-Loss Escrow Policy
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-4 mb-4">
                Ready to acquire a channel or sell your digital property?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                Every deal on Dealoura is supervised by our dedicated escrow specialists. No stolen passwords, no fake follower bots, and zero chargeback risks.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all"
                >
                  <span>List Your Account Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/#browse"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all backdrop-blur-md"
                >
                  <span>Explore Marketplace</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
