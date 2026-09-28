import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TransactionsDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      listings (title),
      buyer:buyer_id (username),
      seller:seller_id (username)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders & Sales</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {transactions && transactions.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {transactions.map((tx) => {
              const isBuyer = tx.buyer_id === user.id
              return (
                <li key={tx.id} className="p-6 hover:bg-gray-50">
                  <Link href={`/dashboard/transactions/${tx.id}`} className="block">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {tx.listings?.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {isBuyer ? 'Purchased from: ' : 'Sold to: '} 
                          <span className="font-medium text-gray-900">
                            {isBuyer ? tx.seller?.username : tx.buyer?.username}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Amount: <span className="font-semibold text-indigo-600">${tx.agreed_price}</span>
                        </p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                          {tx.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-12 text-center text-gray-500">
            You don't have any active transactions yet.
          </div>
        )}
      </div>
    </div>
  )
}
