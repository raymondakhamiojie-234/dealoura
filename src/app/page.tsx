import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Truck, HeadphonesIcon, ShieldCheck, ChevronRight, ChevronLeft, MessageCircle, Smartphone, Zap, CheckCircle, Video, Camera, Hash, MessageSquare } from 'lucide-react'
import { ScrollAnimation } from '@/components/scroll-animation'
import { HeroSlider } from '@/components/hero-slider'

export default async function Home() {
  const supabase = await createClient()

  // Fetch approved listings for the products grid
  const { data: listings } = await supabase
    .from('listings')
    .select(`
      *,
      user_profiles:seller_id (username),
      listing_media (media_url, display_order)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

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
            <div className="bg-blue-50 h-full p-8 flex flex-col justify-end items-center text-center relative overflow-hidden group cursor-pointer min-h-[400px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md">
              <div className="absolute top-10 w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                <Smartphone className="w-20 h-20 text-blue-500" />
              </div>
              <div className="relative z-10 mt-48">
                <h3 className="text-gray-900 text-xl font-bold mb-1">High Engagement</h3>
                <p className="text-gray-600 mb-4 text-sm">TikTok Accounts</p>
                <span className="text-blue-600 text-xs font-bold border-b-2 border-blue-600 pb-0.5">VIEW CHANNELS</span>
              </div>
            </div>
          </ScrollAnimation>

          {/* Middle Column */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <ScrollAnimation direction="up" delay={0.2} className="flex-1 flex">
              <div className="bg-blue-50 w-full p-6 flex flex-col justify-center relative overflow-hidden group cursor-pointer min-h-[240px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md">
                 <div className="absolute -right-4 top-4 w-32 h-32 bg-white rounded-2xl shadow-sm flex items-center justify-center rotate-12 transition-transform group-hover:rotate-0">
                   <Video className="w-16 h-16 text-red-500" />
                 </div>
                 <div className="relative z-10 w-2/3">
                   <h3 className="text-gray-900 text-lg font-bold mb-1">Monetized<br/>YouTube</h3>
                   <span className="text-blue-600 text-xs font-bold border-b-2 border-blue-600 pb-0.5 mt-2 inline-block">SHOP NOW</span>
                 </div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation direction="up" delay={0.3} className="flex-1 flex">
              <div className="bg-blue-50 w-full p-6 flex flex-col items-center justify-end text-center relative overflow-hidden group cursor-pointer min-h-[240px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md">
                 <div className="absolute top-8 w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center transition-transform group-hover:-translate-y-2">
                   <span className="text-black font-black text-4xl">𝕏</span>
                 </div>
                 <div className="relative z-10">
                   <h3 className="text-gray-900 font-bold">Verified X Accounts</h3>
                 </div>
              </div>
            </ScrollAnimation>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <ScrollAnimation direction="right" delay={0.4} className="flex-1 flex">
              <div className="bg-blue-50 w-full p-6 flex items-center justify-end relative overflow-hidden group cursor-pointer min-h-[240px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md">
                 <div className="absolute left-10 w-24 h-24 bg-white shadow-sm rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                   <Camera className="w-12 h-12 text-pink-500" />
                 </div>
                 <h3 className="text-gray-900 text-xl font-bold relative z-10">Niche Instagram Pages</h3>
              </div>
            </ScrollAnimation>
            <ScrollAnimation direction="right" delay={0.5} className="flex-1 flex">
              <div className="bg-blue-50 w-full p-6 flex items-center relative overflow-hidden group cursor-pointer min-h-[240px] rounded-2xl shadow-sm border border-blue-100 transition-shadow hover:shadow-md">
                 <div className="relative z-10 w-1/2">
                   <h3 className="text-gray-900 text-xl font-bold mb-2">Active<br/>Discord Servers</h3>
                   <span className="text-blue-600 text-xs font-bold border-b-2 border-blue-600 pb-0.5 inline-block">VIEW MORE</span>
                 </div>
                 <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-48 h-48 bg-white shadow-sm rounded-full flex items-center justify-center transition-transform group-hover:-translate-x-4">
                   <MessageCircle className="w-20 h-20 text-[#5865F2]" />
                 </div>
              </div>
            </ScrollAnimation>
          </div>

        </div>
      </div>

      {/* 4. Top Products Section */}
      <ScrollAnimation direction="up" delay={0.1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 border-b border-blue-100 pb-2">
            <h2 className="text-2xl font-black text-gray-900 mb-4 md:mb-0">Top Accounts</h2>
            <div className="flex space-x-6">
              <button className="text-xs font-bold text-blue-600 border-b-2 border-blue-600 pb-2 -mb-[10px]">LATEST</button>
              <button className="text-xs font-bold text-gray-400 hover:text-blue-600 pb-2 -mb-[10px] transition">BEST SELLER</button>
              <button className="text-xs font-bold text-gray-400 hover:text-blue-600 pb-2 -mb-[10px] transition">FEATURED</button>
            </div>
          </div>

          {/* Database Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {listings && listings.length > 0 ? (
              listings.map((listing: any, index: number) => {
                const mainImage = listing.listing_media?.[0]?.media_url;
                const followersText = listing.followers_count
                  ? `${Number(listing.followers_count).toLocaleString()} followers`
                  : null;

                return (
                  <ScrollAnimation key={listing.id} direction="up" delay={0.1 * (index % 5)}>
                    <Link href={`/marketplace/listings/${listing.id}`} className="group block h-full">
                      <div className="bg-white p-3.5 transition-all duration-200 hover:shadow-xl rounded-2xl border border-gray-100 hover:border-blue-200 flex flex-col h-full">
                        
                        {/* Image Preview or Platform Card */}
                        <div className="w-full aspect-square bg-slate-100 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-2">
                              <span className="text-blue-600 font-extrabold text-base">{listing.platform || 'Account'}</span>
                              <span className="text-[11px] text-gray-400 mt-0.5">Verified Asset</span>
                            </div>
                          )}

                          {/* Platform Pill */}
                          <span className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {listing.platform || 'Account'}
                          </span>

                          {/* Monetized Indicator */}
                          {listing.monetized && (
                            <span className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                              Monetized
                            </span>
                          )}
                        </div>
                        
                        {/* Metrics Meta */}
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1 font-medium">
                          <span>{followersText || listing.niche || 'Account'}</span>
                          {listing.user_profiles?.username && (
                            <span className="text-gray-400 truncate max-w-[80px]">@{listing.user_profiles.username}</span>
                          )}
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xs text-gray-900 font-bold line-clamp-2 h-8 mb-2 group-hover:text-blue-600 transition">
                          {listing.title}
                        </h3>
                        
                        {/* Price */}
                        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                          <p className="text-base font-extrabold text-blue-600">
                            ${listing.price}
                          </p>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase">Escrow Safe</span>
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
