import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function SellerProfilePage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // Fetch the seller profile by username
  const { data: seller } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!seller) {
    notFound()
  }

  // Fetch their active (approved) listings
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', seller.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Seller Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="p-8 flex items-center">
          <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-4xl">
            {seller.username[0]?.toUpperCase()}
          </div>
          <div className="ml-6">
            <h1 className="text-3xl font-bold text-gray-900">{seller.username}</h1>
            <p className="mt-1 text-gray-500">
              Joined {new Date(seller.created_at).toLocaleDateString()}
            </p>
            {/* In the future, we will display Verification Badges and Ratings here */}
            <div className="mt-2 flex space-x-2">
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Seller
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seller's Listings */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Active Listings</h2>
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {listings.map((listing) => (
              <div key={listing.id} className="group relative border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white">
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link href={`/marketplace/listings/${listing.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {listing.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{listing.description}</p>
                  </div>
                  <p className="text-lg font-medium text-indigo-600">${listing.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">No active listings</h3>
            <p className="mt-1 text-sm text-gray-500">This seller currently has no items for sale.</p>
          </div>
        )}
      </div>

    </div>
  )
}
