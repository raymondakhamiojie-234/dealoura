import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  ShoppingBag,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Eye,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'

export default async function SellerListingsDashboardPage(props: {
  searchParams: Promise<{ status?: string }>
}) {
  const searchParams = await props.searchParams
  const filterStatus = searchParams?.status || 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
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
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
            <Link href="/dashboard/profile" className="hover:text-blue-600 transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
            </Link>
            {profile?.username && (
              <>
                <span>•</span>
                <Link
                  href={`/seller/${profile.username}`}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Public Profile <ExternalLink className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Listings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your accounts for sale, monitor approvals, and review escrow-completed sales.
          </p>
        </div>

        <Link
          href="/dashboard/seller/listings/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          List New Account
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Listings</span>
            <ShoppingBag className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-black text-gray-900">{counts.all}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Active / Listed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{counts.approved}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Confirmed Sold</span>
            <ShieldCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{counts.sold}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{counts.pending}</div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto scrollbar-none">
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
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
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
              ? 'bg-black'
              : listing.platform === 'Instagram'
              ? 'bg-pink-600'
              : listing.platform === 'Discord'
              ? 'bg-[#5865F2]'
              : 'bg-blue-600'

            return (
              <div
                key={listing.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-xs ${
                  isSold
                    ? 'opacity-65 hover:opacity-85 border-gray-200 bg-gray-50/50'
                    : 'hover:border-blue-200 border-gray-100'
                }`}
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Thumbnail with overlay if sold */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={listing.title}
                        className={`w-full h-full object-cover ${isSold ? 'grayscale-[20%]' : ''}`}
                      />
                    ) : (
                      <span className="text-xs font-black text-blue-600">
                        {listing.platform || 'Account'}
                      </span>
                    )}

                    {isSold && (
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
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
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Live on Marketplace
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Pending Approval
                        </span>
                      )}
                      {isDraft && (
                        <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          Draft
                        </span>
                      )}

                      {listing.monetized && !isSold && (
                        <span className="text-[9px] font-bold uppercase bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200">
                          Monetized
                        </span>
                      )}
                    </div>

                    <h3 className={`text-sm sm:text-base font-bold line-clamp-1 ${
                      isSold ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                      {listing.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {listing.account_handle && (
                        <span className="font-semibold text-gray-700">@{listing.account_handle}</span>
                      )}
                      {listing.followers_count != null && (
                        <span>{Number(listing.followers_count).toLocaleString()} followers</span>
                      )}
                      <span>•</span>
                      <span>{listing.niche || 'General'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & CTA */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">
                      {isSold ? 'Sale Price' : 'Asking Price'}
                    </p>
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <p className={`text-lg font-black ${isSold ? 'text-gray-400 line-through' : 'text-blue-600'}`}>
                        ${listing.price}
                      </p>
                      {isSold && (
                        <span className="text-[9px] font-black text-rose-600 uppercase bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                          SOLD
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/marketplace/listings/${listing.id}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                </div>

              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-4">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-gray-900">No listings found in this tab</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Ready to monetize your accounts? List a channel with 0% escrow chargeback risk.
              </p>
            </div>
            <Link
              href="/dashboard/seller/listings/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              List an Account Now
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}
