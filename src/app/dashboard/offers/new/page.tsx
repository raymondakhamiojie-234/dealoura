import { createClient } from '@/utils/supabase/server'
import { makeOffer } from '@/app/actions/offers'
import { redirect, notFound } from 'next/navigation'

export default async function NewOfferPage(props: { searchParams: Promise<{ listing_id: string }> }) {
  const searchParams = await props.searchParams;
  const listingId = searchParams.listing_id
  if (!listingId) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('listings')
    .select('title, price, seller_id')
    .eq('id', listingId)
    .single()

  if (!listing) notFound()

  // Prevent making offer on own listing
  if (listing.seller_id === user.id) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          You cannot make an offer on your own listing.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Make an Offer</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 p-4 bg-gray-50 border rounded-md">
          <h2 className="text-lg font-medium text-gray-900">{listing.title}</h2>
          <p className="text-sm text-gray-500">Asking Price: <span className="font-semibold text-indigo-600">${listing.price}</span></p>
        </div>

        <form action={makeOffer} className="space-y-6">
          <input type="hidden" name="listing_id" value={listingId} />
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Your Offer Amount (USD)</label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                step="0.01"
                min="1"
                required
                className="block w-full rounded-md border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message (Optional)</label>
            <textarea
              name="message"
              id="message"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              placeholder="Hi, I'd like to offer..."
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Submit Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
