import { createClient } from '@/utils/supabase/server'
import { adminAdvanceEscrow } from '@/app/actions/admin'
import { adminConfirmEscrowDeposit } from '@/app/actions/transactions'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, ShieldCheck, ExternalLink, FileText, AlertCircle } from 'lucide-react'

export default async function AdminTransactionsPage() {
  const supabase = await createClient()

  // Fetch all transactions including payment proof details
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id,
      agreed_price,
      status,
      payment_proof_data,
      payment_proof_url,
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
          Monitor the middle-man escrow workflow. Reconcile bank transfers, confirm account credentials, manage the 7-day evaluation window, and release seller payouts.
        </p>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {transactions && transactions.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {transactions.map((tx: any) => {
              const status = tx.status

              let proof: any = null
              if (tx.payment_proof_data) {
                try {
                  proof = JSON.parse(tx.payment_proof_data)
                } catch {
                  // Ignored
                }
              }

              return (
                <li key={tx.id} className="p-6 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Deal Meta */}
                    <div className="space-y-1.5 flex-1">
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

                      <div className="flex items-center gap-2 pt-1">
                        <span className="inline-flex items-center text-xs font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border">
                          Status: {status?.replace(/_/g, ' ')}
                        </span>

                        {proof && (status === 'pending_payment' || status === 'payment_verifying') && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3" /> Deposit Verification Needed
                          </span>
                        )}
                      </div>

                      {/* Submitted Transfer Proof Summary in Admin Row */}
                      {proof && (status === 'pending_payment' || status === 'payment_verifying') && (
                        <div className="mt-2 p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                          <p className="font-bold">
                            Buyer Bank Transfer Details Submitted:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-700">
                            <div>Payer: <strong>{proof.payerName}</strong> ({proof.payerBank})</div>
                            <div>Ref: <strong className="font-mono text-blue-600">{proof.referenceCode}</strong></div>
                            <div>Amount: <strong className="text-emerald-700">${proof.amountPaid}</strong></div>
                          </div>
                          {(tx.payment_proof_url || proof.receiptUrl) && (
                            <div className="pt-1">
                              <a
                                href={tx.payment_proof_url || proof.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline text-[11px]"
                              >
                                View Attached Wire Receipt <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Escrow Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      
                      {/* Stage 1: Approve Deposit */}
                      {(status === 'pending_payment' || status === 'payment_verifying') && (
                        <form action={adminConfirmEscrowDeposit.bind(null, tx.id) as any}>
                          <button
                            type="submit"
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Approve Deposit & Request Credentials
                          </button>
                        </form>
                      )}

                      {/* Stage 2: Mark credentials in escrow check */}
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

                      {/* Stage 3: Start 7-day hold */}
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

                      {/* Stage 4: Release Payout */}
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
