import { createClient } from '@/utils/supabase/server'
import { approveListing, rejectListing } from '@/app/actions/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex space-x-4 mb-8">
        <Link href="/admin/listings" className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1">Pending Listings</Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/verifications" className="text-gray-500 hover:text-indigo-600 font-medium">Verifications</Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/disputes" className="text-gray-500 hover:text-indigo-600 font-medium">Disputes</Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard - Pending Listings</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {pendingListings && pendingListings.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {pendingListings.map((listing) => (
              <li key={listing.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{listing.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{listing.description}</p>
                    <div className="mt-2 text-sm text-gray-500 flex space-x-4">
                      <span>Price: <span className="font-medium text-indigo-600">${listing.price}</span></span>
                      <span>Seller: {listing.user_profiles?.username}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <form action={async () => {
                      'use server'
                      await approveListing(listing.id)
                    }}>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
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
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
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
          <div className="p-12 text-center text-gray-500">
            No pending listings require review at this time.
          </div>
        )}
      </div>
    </div>
  )
}
