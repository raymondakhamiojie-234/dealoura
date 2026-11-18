import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  ShoppingBag,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Eye
} from 'lucide-react'

export const metadata = {
  title: 'My Listings | Dealoura Seller Hub',
  description: 'Manage your listings, monitor escrow approvals, and review active channels for sale.',
}

export default async function SellerListingsDashboardPage(props: {
  searchParams: Promise<{ status?: string }>
}) {
  const searchParams = await props.searchParams
  const filterStatus = searchParams?.status || 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/seller/listings')
  }

  // Fetch user profile for username link
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  // Fetch all seller listings with media
  let query = supabase
    .from('listings')
    .select(`
      *,
      listing_media (media_url, display_order)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus)
  }

  const { data: listings } = await query

  // Fetch overall counts for stat tabs
  const { data: allListings } = await supabase
    .from('listings')
    .select('status')
    .eq('seller_id', user.id)

  const counts = {
    all: allListings?.length || 0,
    approved: allListings?.filter(l => l.status === 'approved').length || 0,
    sold: allListings?.filter(l => l.status === 'sold').length || 0,
    pending: allListings?.filter(l => l.status === 'pending').length || 0,
    draft: allListings?.filter(l => l.status === 'draft').length || 0,
  }

  return (
    <div className="bg-[#ebf1f5] min-h-screen py-10 font-sans text-[#010b13]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#526371] mb-2">
              <Link href="/dashboard/profile" className="hover:text-[#010b13] transition flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
              </Link>
              {profile?.username && (
                <>
                  <span>•</span>
                  <Link
                    href={`/seller/${profile.username}`}
                    className="text-[#010b13] font-bold hover:underline flex items-center gap-1"
                  >
                    View Public Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                </>
              )}
            </div>
            <h1 className="text-3xl font-black text-[#010b13] tracking-tight">My Listings</h1>
            <p className="text-sm text-[#526371] mt-1">
              Manage your accounts for sale, monitor approvals, and review escrow-completed sales.
            </p>
          </div>

          <Link
            href="/dashboard/seller/listings/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#010b13] hover:bg-[#0a1722] text-[#ebf1f5] font-black text-xs rounded-xl shadow-sm transition shrink-0"
          >
            <Plus className="w-4 h-4 text-[#ebf1f5]" />
            <span>List New Account</span>
          </Link>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#d2dde4] shadow-xs">
            <div className="flex items-center justify-between text-[#526371] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Listings</span>
              <ShoppingBag className="w-4 h-4 text-[#010b13]" />
            </div>
            <div className="text-2xl font-black text-[#010b13]">{counts.all}</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#d2dde4] shadow-xs">
            <div className="flex items-center justify-between text-[#526371] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Active / Listed</span>
              <CheckCircle2 className="w-4 h-4 text-[#010b13]" />
            </div>
            <div className="text-2xl font-black text-[#010b13]">{counts.approved}</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#d2dde4] shadow-xs">
            <div className="flex items-center justify-between text-[#526371] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Confirmed Sold</span>
              <ShieldCheck className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600">{counts.sold}</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#d2dde4] shadow-xs">
            <div className="flex items-center justify-between text-[#526371] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">{counts.pending}</div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#d2dde4] pb-3 overflow-x-auto scrollbar-none">
          {[
            { label: 'All Listings', status: 'all', count: counts.all },
            { label: 'Active', status: 'approved', count: counts.approved },
            { label: 'Sold', status: 'sold', count: counts.sold },
            { label: 'Pending Review', status: 'pending', count: counts.pending },
            { label: 'Drafts', status: 'draft', count: counts.draft },
          ].map((tab) => {
            const isActive = filterStatus === tab.status
            return (
              <Link
                key={tab.status}
                href={`/dashboard/seller/listings?status=${tab.status}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#010b13] text-[#ebf1f5] shadow-xs'
                    : 'bg-white text-[#526371] hover:bg-[#d2dde4] border border-[#d2dde4]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#ebf1f5]/20 text-[#ebf1f5]' : 'bg-[#ebf1f5] text-[#010b13]'
                }`}>
                  {tab.count}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Listings List */}
        <div className="space-y-4">
          {listings && listings.length > 0 ? (
            listings.map((listing: any) => {
              const isSold = listing.status === 'sold'
              const isApproved = listing.status === 'approved'
              const isPending = listing.status === 'pending'
              const isDraft = listing.status === 'draft'

              const mainImage = listing.listing_media?.[0]?.media_url

              const platformBg = listing.platform === 'Facebook'
                ? 'bg-[#1877F2]'
                : listing.platform === 'YouTube'
                ? 'bg-red-600'
                : listing.platform === 'TikTok'
                ? 'bg-[#010b13]'
                : listing.platform === 'Instagram'
                ? 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600'
                : listing.platform === 'Discord'
                ? 'bg-[#5865F2]'
                : 'bg-[#010b13]'

              return (
                <div
                  key={listing.id}
                  className={`bg-white rounded-3xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-xs ${
                    isSold
                      ? 'opacity-65 hover:opacity-85 border-[#d2dde4]'
                      : 'hover:border-[#010b13] border-[#d2dde4]'
                  }`}
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Thumbnail with overlay if sold */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ebf1f5] rounded-2xl overflow-hidden shrink-0 relative flex items-center justify-center border border-[#d2dde4]">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={listing.title}
                          className={`w-full h-full object-cover ${isSold ? 'grayscale-[20%]' : ''}`}
                        />
                      ) : (
                        <span className="text-xs font-black text-[#010b13]">
                          {listing.platform || 'Account'}
                        </span>
                      )}

                      {isSold && (
                        <div className="absolute inset-0 bg-[#010b13]/60 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-rose-600 text-white font-black text-[9px] uppercase px-1.5 py-0.5 rounded">
                            SOLD
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Text meta */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${platformBg}`}>
                          {listing.platform || 'Account'}
                        </span>

                        {/* Status Badges */}
                        {isSold && (
                          <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            Confirmed Sold
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] font-bold uppercase bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4] px-2 py-0.5 rounded-full">
                            Live on Marketplace
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            Pending Approval
                          </span>
                        )}
                        {isDraft && (
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                            Draft
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-[#010b13] line-clamp-1">
                        {listing.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-[#526371]">
                        <span>{Number(listing.followers_count || 0).toLocaleString()} followers</span>
                        <span>•</span>
                        <span>{listing.niche || 'General'}</span>
                        {listing.account_handle && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{listing.account_handle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & View CTA */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#d2dde4]">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono text-[#526371] uppercase block">Price</span>
                      <span className="text-lg font-black text-[#010b13] font-mono">
                        ${Number(listing.price).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/marketplace/listings/${listing.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#d2dde4] bg-[#ebf1f5] hover:bg-[#d2dde4] text-[#010b13] text-xs font-bold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Listing</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#d2dde4] p-8 space-y-4">
              <ShoppingBag className="w-12 h-12 text-[#526371]/50 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#010b13]">No listings found</h3>
                <p className="text-xs text-[#526371] max-w-sm mx-auto">
                  {filterStatus === 'all'
                    ? "You haven't listed any digital assets for sale yet."
                    : `No listings with status "${filterStatus}".`}
                </p>
              </div>
              <Link
                href="/dashboard/seller/listings/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#010b13] hover:bg-[#0a1722] text-[#ebf1f5] font-black text-xs rounded-xl shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Listing</span>
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
