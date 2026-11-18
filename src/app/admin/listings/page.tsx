import { createClient } from '@/utils/supabase/server'
import { approveListing, rejectListing } from '@/app/actions/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Tag, Eye } from 'lucide-react'

export default async function AdminListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch pending listings
  const { data: pendingListings } = await supabase
    .from('listings')
    .select(`
      *,
      user_profiles:seller_id (username)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
            Quality & Content Review
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">Review Pending Listings</h1>
        <p className="text-xs sm:text-sm text-[#526371] mt-1">
          Inspect digital assets submitted by sellers before they become visible in the public catalog.
        </p>
      </div>

      <div className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] overflow-hidden">
        {pendingListings && pendingListings.length > 0 ? (
          <ul className="divide-y divide-[#d2dde4]">
            {pendingListings.map((listing) => (
              <li key={listing.id} className="p-6 hover:bg-[#ebf1f5]/40 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                        {listing.platform}
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
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-xs text-[#526371] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#010b13] mx-auto" />
            <p className="font-bold text-[#010b13]">No Pending Listings</p>
            <p>All submitted accounts have been reviewed and published.</p>
          </div>
        )}
      </div>
    </div>
  )
}
