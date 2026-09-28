import { createClient } from '@/utils/supabase/server'
import { updateOfferStatus } from '@/app/actions/offers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OffersDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch offers. RLS automatically ensures the user only sees offers 
  // where they are the buyer or the seller of the connected listing.
  const { data: offers, error } = await supabase
    .from('offers')
    .select(`
      *,
      listings (title, seller_id, price),
      buyer:buyer_id (username)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching offers:", error)
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Offers</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {offers && offers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {offers.map((offer) => {
              const isBuyer = offer.buyer_id === user.id
              const isPending = offer.status === 'pending' || offer.status === 'countered'

              return (
                <li key={offer.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {offer.listings?.title}
                      </h3>
                      <p className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="font-semibold text-gray-900 mr-2">Role:</span> 
                        {isBuyer ? 'Buyer (You made this offer)' : 'Seller (You received this offer)'}
                      </p>
                      <p className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="font-semibold text-gray-900 mr-2">Offer Amount:</span> 
                        <span className="text-indigo-600 font-bold">${offer.amount}</span> 
                        <span className="ml-2 text-xs">(Asking: ${offer.listings?.price})</span>
                      </p>
                      <p className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="font-semibold text-gray-900 mr-2">Status:</span> 
                        <span className={`uppercase text-xs font-bold ${
                          offer.status === 'accepted' ? 'text-green-600' :
                          offer.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>{offer.status}</span>
                      </p>
                      {offer.message && (
                        <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded italic">"{offer.message}"</p>
                      )}
                    </div>

                    <div className="mt-4 md:mt-0 flex space-x-3">
                      {/* Seller Actions */}
                      {!isBuyer && isPending && (
                        <>
                          <form action={async () => {
                            'use server'
                            await updateOfferStatus(offer.id, 'accepted')
                          }}>
                            <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                              Accept
                            </button>
                          </form>
                          <form action={async () => {
                            'use server'
                            await updateOfferStatus(offer.id, 'rejected')
                          }}>
                            <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
                              Reject
                            </button>
                          </form>
                        </>
                      )}

                      {/* Buyer Actions */}
                      {isBuyer && offer.status === 'pending' && (
                        <form action={async () => {
                          'use server'
                          await updateOfferStatus(offer.id, 'withdrawn')
                        }}>
                          <button type="submit" className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                            Withdraw Offer
                          </button>
                        </form>
                      )}
                      
                      {/* If accepted, link to Phase 3 Payment */}
                      {offer.status === 'accepted' && (
                        <Link href={`/dashboard/transactions/new?offer_id=${offer.id}`} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                          {isBuyer ? 'Proceed to Payment' : 'View Transaction'}
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-12 text-center text-gray-500">
            You have no active offers.
          </div>
        )}
      </div>
    </div>
  )
}
