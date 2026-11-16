import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  Video,
  Camera,
  MessageCircle,
  Smartphone,
  ChevronRight
} from 'lucide-react'
import { HomeHero } from '@/components/home-hero'
import { MarketplaceFilterBar } from '@/components/marketplace-filter-bar'
import { ListingCard } from '@/components/listing-card'

export const metadata = {
  title: 'Dealoura — Buy and Sell Digital Assets With Confidence | Secure Escrow',
  description: 'The secure peer-to-peer marketplace for buying and selling YouTube channels, TikTok accounts, Instagram brands, Facebook pages, X accounts, and Discord communities with 100% escrow protection.',
}

export default async function Home(props: {
  searchParams: Promise<{
    q?: string
    platform?: string
    min_followers?: string
    min_price?: string
    max_price?: string
    monetized?: string
    sort?: string
  }>
}) {
  const searchParams = await props.searchParams
  const { q, platform, min_followers, min_price, max_price, monetized, sort } = searchParams
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

  if (min_price) {
    const minP = parseFloat(min_price)
    if (!isNaN(minP)) {
      query = query.gte('price', minP)
    }
  }

  if (max_price) {
    const maxP = parseFloat(max_price)
    if (!isNaN(maxP)) {
      query = query.lte('price', maxP)
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

  let listings: any[] = []
  try {
    const { data } = await query.limit(20)
    listings = data || []
  } catch (err) {
    console.warn('Listing query fetch warning (DB may be paused or offline):', err)
    listings = []
  }

  return (
    <div className="bg-[#ebf1f5] min-h-screen text-[#010b13] font-sans">
      
      {/* 1. Hero Section: Heading 'Buy and Sell Digital Assets With Confidence' & Escrow Terminal */}
      <HomeHero />

      {/* 2. Platform Categories: YouTube, TikTok, Instagram, Facebook, X, Discord */}
      <section className="py-12 bg-white border-b border-[#d2dde4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#526371]">
                Digital Asset Categories
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight mt-1">
                Explore Verified Accounts by Platform
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="text-xs font-bold text-[#010b13] hover:underline flex items-center gap-1 mt-2 md:mt-0"
            >
              <span>Explore All in Marketplace</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* YouTube */}
            <Link 
              href="/marketplace?platform=YouTube" 
              className="bg-[#ebf1f5] hover:bg-white rounded-2xl p-4 border border-[#d2dde4] hover:border-[#010b13] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#010b13]">YouTube</h3>
              <p className="text-[11px] text-[#526371] mt-0.5">Monetized &amp; Shorts</p>
            </Link>

            {/* TikTok */}
            <Link 
              href="/marketplace?platform=TikTok" 
              className="bg-[#ebf1f5] hover:bg-white rounded-2xl p-4 border border-[#d2dde4] hover:border-[#010b13] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#010b13]">TikTok</h3>
              <p className="text-[11px] text-[#526371] mt-0.5">Creator Rewards</p>
            </Link>

            {/* Instagram */}
            <Link 
              href="/marketplace?platform=Instagram" 
              className="bg-[#ebf1f5] hover:bg-white rounded-2xl p-4 border border-[#d2dde4] hover:border-[#010b13] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#010b13]">Instagram</h3>
              <p className="text-[11px] text-[#526371] mt-0.5">Theme &amp; Brand Pages</p>
            </Link>

            {/* Twitter / X */}
            <Link 
              href="/marketplace?platform=Twitter+%2F+X" 
              className="bg-[#ebf1f5] hover:bg-white rounded-2xl p-4 border border-[#d2dde4] hover:border-[#010b13] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform font-black text-xl">
                𝕏
              </div>
              <h3 className="text-sm font-bold text-[#010b13]">Twitter / X</h3>
              <p className="text-[11px] text-[#526371] mt-0.5">Verified &amp; Aged Handles</p>
            </Link>

            {/* Facebook */}
            <Link 
              href="/marketplace?platform=Facebook" 
              className="bg-[#ebf1f5] hover:bg-white rounded-2xl p-4 border border-[#d2dde4] hover:border-[#010b13] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform font-black text-lg">
                FB
              </div>
              <h3 className="text-sm font-bold text-[#010b13]">Facebook</h3>
              <p className="text-[11px] text-[#526371] mt-0.5">High-Reach Pages</p>
            </Link>

            {/* Discord */}
            <Link 
              href="/marketplace?platform=Discord" 
              className="bg-[#ebf1f5] hover:bg-white rounded-2xl p-4 border border-[#d2dde4] hover:border-[#010b13] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#010b13]">Discord</h3>
              <p className="text-[11px] text-[#526371] mt-0.5">Active Communities</p>
            </Link>

          </div>
        </div>
      </section>

      {/* 3. Featured & Recently Listed Assets (Real Database Data) */}
      <section className="py-16 sm:py-20 bg-[#ebf1f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#010b13] animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#526371]">Live Marketplace Feed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight mt-1">
                Available Digital Properties
              </h2>
            </div>
            <div className="text-xs font-mono font-bold text-[#010b13] mt-2 md:mt-0 bg-white px-3.5 py-1.5 rounded-xl border border-[#d2dde4] shadow-xs">
              {listings?.length || 0} assets ready for escrow
            </div>
          </div>

          {/* Interactive Search & Filter Bar */}
          <MarketplaceFilterBar basePath="/" targetId="browse" />

          {/* Listing Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {listings && listings.length > 0 ? (
              listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-[#d2dde4] p-8">
                <ShieldCheck className="w-12 h-12 text-[#526371]/60 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-[#010b13]">No active listings match your current filters</h3>
                <p className="text-xs text-[#526371] mt-1 max-w-sm mx-auto">
                  Try clearing your search terms or filter selections, or list your account for sale.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 bg-[#ebf1f5] hover:bg-[#d2dde4] text-[#010b13] text-xs font-bold px-4 py-2 rounded-xl transition border border-[#d2dde4]"
                  >
                    Reset Filters
                  </Link>
                  <Link
                    href="/sell"
                    className="inline-flex items-center gap-1.5 bg-[#010b13] hover:bg-[#0a1722] text-[#ebf1f5] text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
                  >
                    Start Selling Free
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 4. How It Works Section: 5 Step Escrow Protocol */}
      <section className="py-16 sm:py-24 bg-[#010b13] text-[#ebf1f5] relative overflow-hidden border-y border-[#0a1722]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ebf1f5] bg-[#ebf1f5]/10 px-3 py-1 rounded-full border border-[#ebf1f5]/20">
              5-Step Escrow Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              How Dealoura Escrow Protects You
            </h2>
            <p className="text-[#ebf1f5]/80 text-sm sm:text-base mt-2 leading-relaxed">
              From the initial agreement to final ownership transfer, every milestone is supervised by our dedicated escrow officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Step 1: Browse */}
            <div className="bg-[#071520] rounded-2xl p-5 border border-[#0f2436] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-black text-[#010b13] bg-[#ebf1f5] px-2.5 py-0.5 rounded">
                  STEP 01
                </span>
                <h3 className="text-sm font-bold text-white mt-3 mb-1.5">Browse &amp; Agree</h3>
                <p className="text-xs text-[#ebf1f5]/70 leading-relaxed">
                  Discover verified accounts, review audience analytics, and agree on price or make a direct escrow offer.
                </p>
              </div>
            </div>

            {/* Step 2: Fund Escrow */}
            <div className="bg-[#071520] rounded-2xl p-5 border border-[#0f2436] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-black text-[#010b13] bg-[#ebf1f5] px-2.5 py-0.5 rounded">
                  STEP 02
                </span>
                <h3 className="text-sm font-bold text-white mt-3 mb-1.5">Fund Escrow</h3>
                <p className="text-xs text-[#ebf1f5]/70 leading-relaxed">
                  The buyer deposits 100% of the funds into Dealoura&apos;s secured escrow vault. Seller is notified that payment is guaranteed.
                </p>
              </div>
            </div>

            {/* Step 3: Verify */}
            <div className="bg-[#071520] rounded-2xl p-5 border border-[#0f2436] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-black text-[#010b13] bg-[#ebf1f5] px-2.5 py-0.5 rounded">
                  STEP 03
                </span>
                <h3 className="text-sm font-bold text-white mt-3 mb-1.5">Verify &amp; Audit</h3>
                <p className="text-xs text-[#ebf1f5]/70 leading-relaxed">
                  Seller deposits credentials into our encrypted vault. Dealoura audits channel standing, monetization, and copyright history.
                </p>
              </div>
            </div>

            {/* Step 4: Transfer */}
            <div className="bg-[#071520] rounded-2xl p-5 border border-[#0f2436] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-black text-[#010b13] bg-[#ebf1f5] px-2.5 py-0.5 rounded">
                  STEP 04
                </span>
                <h3 className="text-sm font-bold text-white mt-3 mb-1.5">Supervised Transfer</h3>
                <p className="text-xs text-[#ebf1f5]/70 leading-relaxed">
                  Primary ownership is transferred to the buyer. The buyer binds their 2FA and begins their 7-day inspection window.
                </p>
              </div>
            </div>

            {/* Step 5: Complete */}
            <div className="bg-[#071520] rounded-2xl p-5 border border-[#0f2436] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-black text-[#010b13] bg-[#ebf1f5] px-2.5 py-0.5 rounded">
                  STEP 05
                </span>
                <h3 className="text-sm font-bold text-white mt-3 mb-1.5">Complete &amp; Payout</h3>
                <p className="text-xs text-[#ebf1f5]/70 leading-relaxed">
                  Buyer confirms handover or evaluation period concludes. Seller receives instant payout via bank wire or ACH with zero chargebacks.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-12 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#ebf1f5] hover:underline transition"
            >
              <span>Explore Detailed Escrow Security Protocol</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Escrow Protection Deep Dive: Why Dealoura is Safer */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#d2dde4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#010b13] bg-[#ebf1f5] px-3 py-1 rounded-full border border-[#d2dde4]">
              Zero-Loss Escrow Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#010b13] tracking-tight mt-3">
              Built So Neither Party Takes the Risk
            </h2>
            <p className="text-[#526371] text-sm sm:text-base mt-2 leading-relaxed">
              Traditional trades fail because one party must send credentials or payment first. Dealoura acts as an impartial, verified middleman so every transaction is guaranteed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#ebf1f5] rounded-2xl p-6 border border-[#d2dde4] hover:border-[#010b13] transition-all duration-300 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#010b13] mb-2">Vault Escrow on Every Order</h3>
              <p className="text-xs text-[#526371] leading-relaxed">
                Buyer payment is held in segregated client custody from the moment they pay. Funds are never released until the buyer verifies full channel ownership.
              </p>
            </div>

            <div className="bg-[#ebf1f5] rounded-2xl p-6 border border-[#d2dde4] hover:border-[#010b13] transition-all duration-300 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#010b13] mb-2">Rigorous Channel Audit</h3>
              <p className="text-xs text-[#526371] leading-relaxed">
                We inspect monetization status, copyright strikes, genuine organic engagement, and primary email ownership before approving listings.
              </p>
            </div>

            <div className="bg-[#ebf1f5] rounded-2xl p-6 border border-[#d2dde4] hover:border-[#010b13] transition-all duration-300 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#010b13] mb-2">Supervised 2FA Handover</h3>
              <p className="text-xs text-[#526371] leading-relaxed">
                Our escrow officers supervise removing recovery emails, clearing legacy 2FA keys, and binding the buyer&apos;s phone numbers, ensuring zero account pullbacks.
              </p>
            </div>

            <div className="bg-[#ebf1f5] rounded-2xl p-6 border border-[#d2dde4] hover:border-[#010b13] transition-all duration-300 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#010b13] mb-2">Irrevocable Bank Payouts</h3>
              <p className="text-xs text-[#526371] leading-relaxed">
                Once the buyer confirms handover, funds are disbursed directly to the seller via domestic bank wire or ACH with zero chargeback risk.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Real Trust Protocol & FAQ Section */}
      <section className="py-16 sm:py-20 bg-[#ebf1f5] border-b border-[#d2dde4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#526371]">
              Questions &amp; Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#010b13]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#526371]">
              Transparent answers regarding escrow protection, verification, and payment releases.
            </p>
          </div>

          <div className="space-y-4">
            
            <div className="bg-white p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-[#010b13] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#010b13] shrink-0" />
                How does Dealoura protect buyers from fraud?
              </h3>
              <p className="text-xs text-[#526371] leading-relaxed pl-6">
                When you make an offer, your funds are held in our segregated client trust account. The seller is not paid until you have gained primary owner access, removed former recovery credentials, bound your own 2FA security, and inspected the channel during your 7-day evaluation window.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-[#010b13] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#010b13] shrink-0" />
                How does Dealoura protect sellers from chargebacks?
              </h3>
              <p className="text-xs text-[#526371] leading-relaxed pl-6">
                You never hand over account credentials directly to the buyer until Dealoura confirms that 100% of the funds have cleared into our escrow vault. Payouts are made via irrevocable bank wires or ACH, eliminating fraudulent PayPal chargebacks and buyer payment reversals.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-[#010b13] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#010b13] shrink-0" />
                What are Dealoura&apos;s escrow fees?
              </h3>
              <p className="text-xs text-[#526371] leading-relaxed pl-6">
                Listing an account is 100% free. When a transaction successfully completes, a standard 5% escrow protection fee is transparently deducted from the seller payout to cover middleman inspection, credential verification, and dispute resolution guarantees.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-[#010b13] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#010b13] shrink-0" />
                What happens during the 7-day evaluation period?
              </h3>
              <p className="text-xs text-[#526371] leading-relaxed pl-6">
                After the credentials have been transferred under Dealoura supervision, the buyer has up to 7 days to verify analytics, subscriber activity, and monetization compliance. If any discrepancy or undisclosed strike is found, Dealoura holds funds in escrow until resolved or refunded.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Strong Dual Buyer & Seller Call to Action */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#010b13] p-8 sm:p-14 text-[#ebf1f5] relative overflow-hidden shadow-2xl border border-[#0a1722]">
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-10 translate-y-10">
              <ShieldCheck className="w-96 h-96 text-white" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#010b13] bg-[#ebf1f5] px-3 py-1 rounded-full">
                100% Guaranteed Escrow Transactions
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-4 text-white">
                Ready to acquire a channel or sell your digital property?
              </h2>
              <p className="text-sm sm:text-base text-[#ebf1f5]/80 leading-relaxed mb-8">
                Every deal on Dealoura is supervised by dedicated escrow specialists. Zero stolen credentials, zero fake followers, and complete payment protection.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#ebf1f5] hover:bg-white text-[#010b13] font-black text-sm shadow-xl transition-all"
                >
                  <span>Browse Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0a1722] hover:bg-[#122434] text-[#ebf1f5] font-bold text-sm border border-[#d2dde4]/30 transition-all"
                >
                  <Lock className="w-4 h-4 text-[#ebf1f5]" />
                  <span>List Your Account Free</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
