import { createClient } from '@/utils/supabase/server'
import { adminAdvanceEscrow } from '@/app/actions/admin'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, ShieldCheck } from 'lucide-react'

export default async function AdminTransactionsPage() {
  const supabase = await createClient()

  // Fetch all transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id,
      agreed_price,
      status,
      created_at,
      listings (title, platform, price),
      buyer:buyer_id (username),
      seller:seller_id (username)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Escrow Deals Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor the DealBaron-style middle-man escrow workflow. Confirm account receipt, start buyer 7-day evaluation, and release seller payouts.
        </p>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {transactions && transactions.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {transactions.map((tx: any) => {
              const status = tx.status

              return (
                <li key={tx.id} className="p-6 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Deal Meta */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {tx.listings?.platform || 'Account'}
                        </span>
                        <h3 className="text-base font-bold text-gray-900">
                          {tx.listings?.title || 'Account Transfer'}
                        </h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 text-xs text-gray-500">
                        <span>Price: <strong className="text-gray-900">${tx.agreed_price}</strong></span>
                        <span>Buyer: <strong>@{tx.buyer?.username}</strong></span>
                        <span>Seller: <strong>@{tx.seller?.username}</strong></span>
                        <span>Created: {new Date(tx.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="pt-1">
                        <span className="inline-flex items-center text-xs font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border">
                          Status: {status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Escrow Action Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {status === 'payment_confirmed' && (
                        <form action={adminAdvanceEscrow.bind(null, tx.id, 'agent_verifying') as any}>
                          <button
                            type="submit"
                            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white py-2 px-3.5 rounded-lg transition"
                          >
                            Mark: Seller Sent to Escrow
                          </button>
                        </form>
                      )}

                      {status === 'agent_verifying' && (
                        <form action={adminAdvanceEscrow.bind(null, tx.id, 'buyer_7_day_evaluation') as any}>
                          <button
                            type="submit"
                            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3.5 rounded-lg transition"
                          >
                            Verify & Start Buyer 7-Day Hold
                          </button>
                        </form>
                      )}

                      {status === 'buyer_7_day_evaluation' && (
                        <form action={adminAdvanceEscrow.bind(null, tx.id, 'completed') as any}>
                          <button
                            type="submit"
                            className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white py-2 px-3.5 rounded-lg transition"
                          >
                            Release Funds to Seller
                          </button>
                        </form>
                      )}

                      {status === 'completed' && (
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg inline-flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Deal Completed
                        </span>
                      )}

                      <Link
                        href={`/dashboard/transactions/${tx.id}`}
                        className="text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-lg transition"
                      >
                        Inspect Full Tracker &rarr;
                      </Link>
                    </div>

                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-12 text-center text-gray-400 text-sm">
            No escrow transactions found.
          </div>
        )}
      </div>
    </div>
  )
}
