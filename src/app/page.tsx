import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Truck, HeadphonesIcon, ShieldCheck, ChevronRight, ChevronLeft, MessageCircle, Smartphone, Zap, CheckCircle, Video, Camera, Hash, MessageSquare } from 'lucide-react'
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

  // Base query for approved listings
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

  const { data: listings } = await query.limit(25)

  return (
    <div className="bg-white transition-colors duration-200 overflow-hidden">
      
      {/* 1. Hero Section Slider */}
      <ScrollAnimation direction="none" delay={0}>
        <HeroSlider />
      </ScrollAnimation>

      {/* 2. Features Bar */}
      <div className="border-y border-blue-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <ScrollAnimation direction="up" delay={0.1}>
              <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full shrink-0">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm uppercase">Instant Transfer</h3>
                  <p className="text-gray-500 text-xs mt-1">Get immediate access after payment</p>
                </div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation direction="up" delay={0.2}>
              <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full shrink-0">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm uppercase">Escrow Protection</h3>
                  <p className="text-gray-500 text-xs mt-1">Funds held securely until delivery</p>
                </div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation direction="up" delay={0.3}>
              <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full shrink-0">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm uppercase">Verified Sellers</h3>
                  <p className="text-gray-500 text-xs mt-1">Every seller is strictly vetted</p>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>

      {/* 3. Promotional Bento Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-auto lg:h-[500px]">
          
          {/* Left Large Banner */}
          <ScrollAnimation direction="left" delay={0.1} className="lg:col-span-1">
            <Link href="/?platform=TikTok#browse" className="bg-blue-50 h-full p-8 flex flex-col justify-end items-center text-center relative overflow-hidden group cursor-pointer min-h-[400px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md block">
              <div className="absolute top-10 w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                <Smartphone className="w-20 h-20 text-blue-500" />
              </div>
              <div className="relative z-10 mt-48">
                <h3 className="text-gray-900 text-xl font-bold mb-1">High Engagement</h3>
                <p className="text-gray-600 mb-4 text-sm">TikTok Accounts</p>
                <span className="text-blue-600 text-xs font-bold border-b-2 border-blue-600 pb-0.5">VIEW CHANNELS</span>
              </div>
            </Link>
          </ScrollAnimation>

          {/* Middle Column */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <ScrollAnimation direction="up" delay={0.2} className="flex-1 flex">
              <Link href="/?platform=YouTube#browse" className="bg-blue-50 w-full p-6 flex flex-col justify-center relative overflow-hidden group cursor-pointer min-h-[190px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md block">
                 <div className="absolute -right-4 top-4 w-32 h-32 bg-white rounded-2xl shadow-sm flex items-center justify-center rotate-12 transition-transform group-hover:rotate-0">
                   <Video className="w-16 h-16 text-red-500" />
                 </div>
                 <div className="relative z-10 w-2/3">
                   <h3 className="text-gray-900 text-lg font-bold mb-1">Monetized<br/>YouTube</h3>
                   <span className="text-blue-600 text-xs font-bold border-b-2 border-blue-600 pb-0.5 mt-2 inline-block">SHOP NOW</span>
                 </div>
              </Link>
            </ScrollAnimation>
            <ScrollAnimation direction="up" delay={0.3} className="flex-1 flex">
              <Link href="/?platform=Twitter+%2F+X#browse" className="bg-blue-50 w-full p-6 flex flex-col items-center justify-end text-center relative overflow-hidden group cursor-pointer min-h-[190px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md block">
                 <div className="absolute top-6 w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center transition-transform group-hover:-translate-y-2">
                   <span className="text-black font-black text-3xl">𝕏</span>
                 </div>
                 <div className="relative z-10">
                   <h3 className="text-gray-900 font-bold">Verified X Handles</h3>
                   <span className="text-blue-600 text-[11px] font-bold mt-1 inline-block">VIEW HANDLES</span>
                 </div>
              </Link>
            </ScrollAnimation>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <ScrollAnimation direction="right" delay={0.4} className="flex-1 flex">
              <Link href="/?platform=Instagram#browse" className="bg-blue-50 w-full p-6 flex items-center justify-between relative overflow-hidden group cursor-pointer min-h-[190px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md block">
                 <div className="relative z-10">
                   <h3 className="text-gray-900 text-xl font-bold mb-1">Niche Instagram Pages</h3>
                   <span className="text-pink-600 text-xs font-bold border-b-2 border-pink-500 pb-0.5 inline-block">EXPLORE THEMES</span>
                 </div>
                 <div className="w-20 h-20 bg-white shadow-sm rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                   <Camera className="w-10 h-10 text-pink-500" />
                 </div>
              </Link>
            </ScrollAnimation>
            
            {/* Split row for Facebook & Discord */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <ScrollAnimation direction="right" delay={0.5} className="flex">
                <Link href="/?platform=Facebook#browse" className="bg-blue-50 w-full p-5 flex items-center justify-between relative overflow-hidden group cursor-pointer min-h-[140px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md block">
                   <div className="relative z-10 w-2/3">
                     <h3 className="text-gray-900 text-base font-bold mb-1">Facebook<br/>Pages & Groups</h3>
                     <span className="text-[#1877F2] text-xs font-bold border-b-2 border-[#1877F2] pb-0.5 inline-block">BROWSE FB</span>
                   </div>
                   <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                     <svg className="w-8 h-8 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                       <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                     </svg>
                   </div>
                </Link>
              </ScrollAnimation>
              <ScrollAnimation direction="right" delay={0.6} className="flex">
                <Link href="/?platform=Discord#browse" className="bg-blue-50 w-full p-5 flex items-center justify-between relative overflow-hidden group cursor-pointer min-h-[140px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md block">
                   <div className="relative z-10 w-2/3">
                     <h3 className="text-gray-900 text-base font-bold mb-1">Active<br/>Discord Servers</h3>
                     <span className="text-[#5865F2] text-xs font-bold border-b-2 border-[#5865F2] pb-0.5 inline-block">VIEW SERVERS</span>
                   </div>
                   <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                     <MessageCircle className="w-8 h-8 text-[#5865F2]" />
                   </div>
                </Link>
              </ScrollAnimation>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Explore Accounts Section with Live Filters */}
      <ScrollAnimation direction="up" delay={0.1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Explore Accounts</h2>
              <p className="text-xs text-gray-500 mt-1">Verified social media channels protected by Dealoura Escrow</p>
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-2 md:mt-0">
              {listings?.length || 0} {listings?.length === 1 ? 'account' : 'accounts'} found
            </div>
          </div>

          {/* Interactive Search & Filter Bar */}
          <MarketplaceFilterBar />

          {/* Database Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {listings && listings.length > 0 ? (
              listings.map((listing: any, index: number) => {
                const isSold = listing.status === 'sold';
                const mainImage = listing.listing_media?.[0]?.media_url;
                const followersText = listing.followers_count
                  ? `${Number(listing.followers_count).toLocaleString()} followers`
                  : null;

                const platformBg = listing.platform === 'Facebook'
                  ? 'bg-[#1877F2]'
                  : listing.platform === 'YouTube'
                  ? 'bg-red-600'
                  : listing.platform === 'TikTok'
                  ? 'bg-black'
                  : listing.platform === 'Instagram'
                  ? 'bg-pink-600'
                  : listing.platform === 'Discord'
                  ? 'bg-[#5865F2]'
                  : 'bg-blue-600';

                return (
                  <ScrollAnimation key={listing.id} direction="up" delay={0.05 * (index % 5)}>
                    <Link href={`/marketplace/listings/${listing.id}`} className="group block h-full">
                      <div className={`bg-white p-3.5 transition-all duration-200 rounded-2xl border flex flex-col h-full ${
                        isSold
                          ? 'opacity-60 hover:opacity-85 border-gray-200 shadow-none'
                          : 'hover:shadow-xl border-gray-100 hover:border-blue-200'
                      }`}>
                        
                        {/* Image Preview or Platform Card */}
                        <div className="w-full aspect-square bg-slate-100 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={listing.title}
                              className={`w-full h-full object-cover transition-transform duration-300 ${
                                isSold ? 'grayscale-[20%]' : 'group-hover:scale-105'
                              }`}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-2">
                              <span className="text-blue-600 font-extrabold text-base">{listing.platform || 'Account'}</span>
                              <span className="text-[11px] text-gray-400 mt-0.5">Verified Asset</span>
                            </div>
                          )}

                          {/* Sold Central Stamp Overlay */}
                          {isSold && (
                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                              <span className="bg-rose-600 text-white font-black text-xs uppercase px-3.5 py-1 rounded-full shadow-lg tracking-wider border border-white/20">
                                SOLD
                              </span>
                            </div>
                          )}

                          {/* Platform Pill */}
                          <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-20 ${platformBg}`}>
                            {listing.platform || 'Account'}
                          </span>

                          {/* Sold or Monetized Indicator */}
                          {isSold ? (
                            <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider z-20">
                              SOLD
                            </span>
                          ) : listing.monetized ? (
                            <span className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider z-20">
                              Monetized
                            </span>
                          ) : null}
                        </div>
                        
                        {/* Metrics Meta */}
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1 font-medium">
                          <span>{followersText || listing.niche || 'Account'}</span>
                          {listing.user_profiles?.username && (
                            <span className="text-gray-400 truncate max-w-[80px]">@{listing.user_profiles.username}</span>
                          )}
                        </div>
                        
                        {/* Title */}
                        <h3 className={`text-xs font-bold line-clamp-2 h-8 mb-2 transition ${
                          isSold ? 'text-gray-500' : 'text-gray-900 group-hover:text-blue-600'
                        }`}>
                          {listing.title}
                        </h3>
                        
                        {/* Price */}
                        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-base font-extrabold ${isSold ? 'text-gray-400 line-through' : 'text-blue-600'}`}>
                              ${listing.price}
                            </p>
                            {isSold && (
                              <span className="text-[9px] font-black text-rose-600 uppercase bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                                SOLD
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold uppercase ${isSold ? 'text-rose-600' : 'text-gray-400'}`}>
                            {isSold ? 'SOLD' : 'Escrow Safe'}
                          </span>
                        </div>

                      </div>
                    </Link>
                  </ScrollAnimation>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 text-sm">
                No active listings found. Be the first to list an account!
              </div>
            )}
          </div>
        </div>
      </ScrollAnimation>
    </div>
  )
}
