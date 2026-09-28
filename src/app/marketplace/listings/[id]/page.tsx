import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ListingDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the listing and the seller's profile
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      user_profiles:seller_id (id, username, full_name, avatar_url)
    `)
    .eq('id', params.id)
    .single()

  if (error) {
    console.error("Listing fetch error:", error)
  }

  if (!listing) {
    notFound()
  }

  const isOwner = user?.id === listing.seller_id

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
              <p className="mt-2 text-2xl font-semibold text-indigo-600">${listing.price}</p>
            </div>
            {isOwner && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Your Listing
              </span>
            )}
          </div>

          <div className="mt-8 prose prose-indigo max-w-none">
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap">{listing.description}</p>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900">Seller Information</h3>
            <div className="mt-4 flex items-center">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                {listing.user_profiles?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="ml-4">
                <Link href={`/seller/${listing.user_profiles?.username}`} className="text-lg font-medium text-indigo-600 hover:text-indigo-500">
                  {listing.user_profiles?.username}
                </Link>
                <p className="text-sm text-gray-500">Member</p>
              </div>
            </div>
          </div>

          {!isOwner && user && (
            <div className="mt-10 flex space-x-4">
              <Link
                href={`/dashboard/messages/new?listing_id=${listing.id}&seller_id=${listing.seller_id}`}
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Message Seller
              </Link>
              <Link
                href={`/dashboard/offers/new?listing_id=${listing.id}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Make an Offer
              </Link>
            </div>
          )}
          
          {!user && (
            <div className="mt-10 bg-gray-50 rounded-md p-6 text-center border">
              <p className="text-gray-600">Please <Link href="/login" className="text-indigo-600 hover:underline font-medium">log in</Link> to message the seller or make an offer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
