import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { 
  ShieldCheck, 
  Sparkles, 
  Filter
} from 'lucide-react'
import { MarketplaceFilterBar } from '@/components/marketplace-filter-bar'
import { ListingCard } from '@/components/listing-card'

export const metadata = {
  title: 'Browse Digital Assets & Verified Channels | Dealoura Marketplace',
  description: 'Explore verified YouTube channels, TikTok accounts, Instagram pages, Facebook communities, Twitter / X accounts, and Discord servers available for secure escrow purchase.',
}

export default async function MarketplacePage(props: {
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
    const { data } = await query.limit(50)
    listings = data || []
  } catch (err) {
    console.warn('Marketplace listing fetch warning:', err)
    listings = []
  }

  const activeCount = listings.filter((l) => l.status === 'approved').length
  const soldCount = listings.filter((l) => l.status === 'sold').length

  return (
    <div className="bg-[#ebf1f5] min-h-screen py-10 font-sans text-[#010b13]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Marketplace Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#d2dde4]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#010b13] bg-white px-2.5 py-0.5 rounded-full border border-[#d2dde4]">
                Live Escrow Marketplace
              </span>
              <span className="text-xs text-[#526371]">• Guaranteed Transfers</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#010b13] tracking-tight">
              Verified Digital Assets &amp; Channels
            </h1>
            <p className="text-sm text-[#526371] mt-1.5 max-w-2xl leading-relaxed">
              Explore audited social media channels, monetized creator properties, and digital assets. Every order is held safely in Dealoura Escrow until complete ownership is confirmed.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#010b13] hover:bg-[#0a1722] text-[#ebf1f5] font-bold text-xs shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 text-[#ebf1f5]" />
              <span>List Your Channel Free</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <MarketplaceFilterBar basePath="/marketplace" targetId="catalog" />

        {/* Results Metadata Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#526371] gap-2">
          <div>
            Showing <strong className="text-[#010b13] font-bold">{listings.length}</strong> total listings
            {activeCount > 0 && <span> ({activeCount} active, {soldCount} completed)</span>}
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#010b13]" />
            <span>All trades protected by 7-day evaluation guarantee</span>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {listings && listings.length > 0 ? (
            listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-[#d2dde4] p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#ebf1f5] text-[#010b13] flex items-center justify-center mx-auto">
                <Filter className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#010b13]">No listings found</h3>
                <p className="text-xs text-[#526371] max-w-sm mx-auto">
                  We couldn&apos;t find any assets matching your exact search and filter criteria.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/marketplace"
                  className="px-4 py-2 text-xs font-bold bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4] rounded-xl hover:bg-[#d2dde4] transition"
                >
                  Reset All Filters
                </Link>
                <Link
                  href="/sell"
                  className="px-4 py-2 text-xs font-bold bg-[#010b13] text-[#ebf1f5] rounded-xl hover:bg-[#0a1722] transition shadow-xs"
                >
                  List an Account
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Escrow Trust Information Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#010b13]">
              <ShieldCheck className="w-4 h-4 text-[#010b13]" />
              <span>Dealoura Escrow Buyer Protection</span>
            </div>
            <h3 className="text-lg font-bold text-[#010b13]">Looking for a specific niche or high-revenue property?</h3>
            <p className="text-xs text-[#526371] leading-relaxed">
              Our escrow desk verifies organic reach, checks copyright strikes, and ensures complete 2FA handover for every transaction.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/how-it-works"
              className="px-5 py-2.5 rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-xs font-bold text-[#010b13] hover:bg-[#d2dde4] transition"
            >
              How It Works
            </Link>
            <Link
              href="/sell"
              className="px-5 py-2.5 rounded-xl bg-[#010b13] text-[#ebf1f5] text-xs font-bold hover:bg-[#0a1722] transition"
            >
              Start Selling
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
