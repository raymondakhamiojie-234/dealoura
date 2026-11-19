import Link from 'next/link'
import { Sparkles, ShieldCheck } from 'lucide-react'
import { ListingImage } from './listing-image'

export interface ListingItem {
  id: string
  title: string
  platform?: string
  price: number
  followers_count?: number
  monetized?: boolean
  niche?: string
  status?: string
  account_handle?: string
  user_profiles?: {
    username?: string
  } | null
  listing_media?: {
    media_url: string
    display_order?: number
  }[] | null
}

interface ListingCardProps {
  listing: ListingItem
}

export function ListingCard({ listing }: ListingCardProps) {
  const isSold = listing.status === 'sold'
  const mainImage = listing.listing_media?.[0]?.media_url
  const followersText = listing.followers_count
    ? `${Number(listing.followers_count).toLocaleString()} followers`
    : null

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
    <Link 
      href={`/marketplace/listings/${listing.id}`} 
      className="group block h-full focus:outline-none"
    >
      <div 
        className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col h-full overflow-hidden relative ${
          isSold
            ? 'opacity-65 hover:opacity-85 border-[#d2dde4] shadow-none'
            : 'hover:shadow-xl border-[#d2dde4] hover:border-[#010b13] hover:-translate-y-1'
        }`}
      >
        
        {/* Image Preview Container (Consistent 4:3 Aspect Ratio) */}
        <div className="w-full aspect-[4/3] bg-[#ebf1f5] relative overflow-hidden flex items-center justify-center border-b border-[#d2dde4]">
          <ListingImage
            src={mainImage}
            alt={listing.title}
            platform={listing.platform}
            isSold={isSold}
          />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${platformBadgeStyle}`}>
              {listing.platform || 'Account'}
            </span>

            {isSold ? (
              <span className="bg-rose-600 text-white text-[9px] font-mono font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                SOLD
              </span>
            ) : listing.status === 'pending' ? (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                In Review
              </span>
            ) : listing.monetized ? (
              <span className="bg-[#010b13] text-[#ebf1f5] text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-1 border border-[#ebf1f5]/30">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Monetized</span>
              </span>
            ) : null}
          </div>

          {/* Sold Central Watermark Overlay */}
          {isSold && (
            <div className="absolute inset-0 bg-[#010b13]/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-rose-600 text-white font-black text-xs uppercase px-4 py-1.5 rounded-full shadow-xl tracking-widest border border-white/20">
                COMPLETED / SOLD
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-grow">
          
          {/* Audience Metric & Seller Handle */}
          <div className="flex items-center justify-between text-[11px] text-[#526371] font-medium mb-1.5">
            <span className="font-semibold text-[#010b13]">{followersText || listing.niche || 'Audience'}</span>
            {listing.user_profiles?.username && (
              <span className="text-[#526371] truncate max-w-[100px] font-mono">
                @{listing.user_profiles.username}
              </span>
            )}
          </div>

          {/* Listing Title */}
          <h3 className={`text-xs font-bold line-clamp-2 h-9 mb-3 transition leading-snug ${
            isSold ? 'text-[#526371]' : 'text-[#010b13] group-hover:underline'
          }`}>
            {listing.title}
          </h3>

          {/* Price & Escrow Tag */}
          <div className="mt-auto pt-3 border-t border-[#d2dde4] flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-base font-black ${isSold ? 'text-slate-400 line-through' : 'text-[#010b13]'}`}>
                ${Number(listing.price).toLocaleString()}
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              isSold
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]'
            }`}>
              {isSold ? 'SOLD' : 'Escrow Protected'}
            </span>
          </div>

        </div>

      </div>
    </Link>
  )
}
