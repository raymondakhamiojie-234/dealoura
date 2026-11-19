import { createClient } from '@/utils/supabase/server'
import { approveListing, rejectListing } from '@/app/actions/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Tag, Eye } from 'lucide-react'

export default async function AdminListingsPage(props: {
  searchParams: Promise<{ status?: string }>
}) {
  const searchParams = await props.searchParams
  const filterStatus = searchParams.status || 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Base query for listings
  let query = supabase
    .from('listings')
    .select(`
      *,
      user_profiles:seller_id (username)
    `)
    .order('created_at', { ascending: false })

  if (filterStatus !== 'all') {
    query = query.eq('status', filterStatus)
  }

  const { data: listings } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
              Catalog Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">Marketplace Listings Review</h1>
          <p className="text-xs sm:text-sm text-[#526371] mt-1">
            Manage all seller account properties, review submitted channels, and moderate live assets.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#ffffff] rounded-xl border border-[#d2dde4] text-xs font-bold">
          <Link
            href="/admin/listings?status=all"
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'all'
                ? 'bg-[#010b13] text-[#ebf1f5]'
                : 'text-[#526371] hover:text-[#010b13]'
            }`}
          >
            All
          </Link>
          <Link
            href="/admin/listings?status=pending"
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'pending'
                ? 'bg-[#010b13] text-[#ebf1f5]'
                : 'text-[#526371] hover:text-[#010b13]'
            }`}
          >
            Pending
          </Link>
          <Link
            href="/admin/listings?status=approved"
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'approved'
                ? 'bg-[#010b13] text-[#ebf1f5]'
                : 'text-[#526371] hover:text-[#010b13]'
            }`}
          >
            Approved
          </Link>
          <Link
            href="/admin/listings?status=sold"
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'sold'
                ? 'bg-[#010b13] text-[#ebf1f5]'
                : 'text-[#526371] hover:text-[#010b13]'
            }`}
          >
            Sold
          </Link>
        </div>
      </div>

      <div className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] overflow-hidden">
        {listings && listings.length > 0 ? (
          <ul className="divide-y divide-[#d2dde4]">
            {listings.map((listing) => (
              <li key={listing.id} className="p-6 hover:bg-[#ebf1f5]/40 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                        {listing.platform}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          listing.status === 'approved'
                            ? 'bg-[#010b13] text-[#ebf1f5]'
                            : listing.status === 'sold'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {listing.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#526371]">
                        Seller: @{listing.user_profiles?.username || 'Unknown'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-[#010b13]">{listing.title}</h3>
                    <p className="text-xs text-[#526371] line-clamp-2 leading-relaxed">{listing.description}</p>
                    
                    <div className="text-xs text-[#526371] flex items-center space-x-4 pt-1">
                      <span>Asking Price: <strong className="font-mono text-base font-black text-[#010b13]">${listing.price}</strong></span>
                      {listing.category && <span>Category: <strong className="text-[#010b13]">{listing.category}</strong></span>}
                      {listing.followers_count > 0 && (
                        <span>Followers: <strong className="text-[#010b13]">{listing.followers_count.toLocaleString()}</strong></span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <Link
                      href={`/marketplace/listings/${listing.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#d2dde4] bg-[#ebf1f5] text-xs font-bold text-[#010b13] rounded-xl hover:bg-[#010b13] hover:text-[#ebf1f5] transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </Link>

                    {listing.status !== 'approved' && (
                      <form action={async () => {
                        'use server'
                        await approveListing(listing.id)
                      }}>
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 bg-[#010b13] hover:bg-[#18263B] text-xs font-bold text-[#ebf1f5] rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Approve
                        </button>
                      </form>
                    )}

                    {listing.status !== 'rejected' && (
                      <form action={async () => {
                        'use server'
                        await rejectListing(listing.id)
                      }}>
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-[#d2dde4] hover:bg-red-50 text-xs font-bold text-red-600 rounded-xl transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-xs text-[#526371] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#010b13] mx-auto" />
            <p className="font-bold text-[#010b13]">No listings found</p>
            <p>No listings match the selected filter tab.</p>
          </div>
        )}
      </div>
    </div>
  )
}
