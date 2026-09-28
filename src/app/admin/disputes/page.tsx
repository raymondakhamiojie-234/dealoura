import { createClient } from '@/utils/supabase/server'
import { resolveDispute } from '@/app/actions/disputes'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDisputesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all open disputes
  const { data: disputes } = await supabase
    .from('disputes')
    .select(`
      *,
      transactions (
        agreed_price,
        listings (title)
      ),
      opener:opened_by (username)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex space-x-4 mb-8">
        <Link href="/admin/listings" className="text-gray-500 hover:text-indigo-600 font-medium">Pending Listings</Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/verifications" className="text-gray-500 hover:text-indigo-600 font-medium">Verifications</Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/disputes" className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1">Disputes</Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Disputes</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {disputes && disputes.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {disputes.map((d) => (
              <li key={d.id} className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Dispute for: {d.transactions?.listings?.title} (${d.transactions?.agreed_price})
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">Opened by:</span> {d.opener?.username}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">Date:</span> {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-100 p-4 rounded-md text-sm text-red-900">
                    <span className="font-bold">Reason for Dispute:</span><br/>
                    {d.reason}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Resolve in favor of Buyer (Refund)</h4>
                      <form action={async () => {
                        'use server'
                        await resolveDispute(d.id, d.transaction_id, 'resolved_buyer', 'Admin decided in favor of buyer. Transaction cancelled.')
                      }}>
                        <button type="submit" className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                          Refund Buyer (Cancel Tx)
                        </button>
                      </form>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Resolve in favor of Seller (Release Funds)</h4>
                      <form action={async () => {
                        'use server'
                        await resolveDispute(d.id, d.transaction_id, 'resolved_seller', 'Admin decided in favor of seller. Transaction completed.')
                      }}>
                        <button type="submit" className="w-full px-4 py-2 border border-gray-300 text-gray-700 bg-white text-sm font-medium rounded-md hover:bg-gray-50">
                          Release Funds to Seller
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No open disputes at this time.
          </div>
        )}
      </div>
    </div>
  )
}
