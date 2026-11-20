import { createClient } from '@/utils/supabase/server'
import { adminAdvanceEscrow } from '@/app/actions/admin'
import { adminConfirmEscrowDeposit } from '@/app/actions/transactions'
import Link from 'next/link'
import { CheckCircle2, Clock, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react'

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
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
            Escrow Desk Operations
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">Escrow Deals Management</h1>
        <p className="text-xs sm:text-sm text-[#526371] mt-1">
          Monitor the middle-man escrow workflow. Reconcile bank transfers and crypto deposits, confirm account credentials, manage the 7-day evaluation window, and release seller payouts.
        </p>
      </div>

      {/* Transactions List */}
      <div className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] overflow-hidden">
        {transactions && transactions.length > 0 ? (
          <ul className="divide-y divide-[#d2dde4]">
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
                <li key={tx.id} className="p-6 hover:bg-[#ebf1f5]/40 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Deal Meta */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                          {tx.listings?.platform || 'Asset'}
                        </span>
                        <h3 className="text-base font-black text-[#010b13]">
                          {tx.listings?.title || 'Account Transfer'}
                        </h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 text-xs text-[#526371]">
                        <span>Price: <strong className="font-mono text-[#010b13]">${tx.agreed_price}</strong></span>
                        <span>Buyer: <strong className="text-[#010b13]">@{tx.buyer?.username}</strong></span>
                        <span>Seller: <strong className="text-[#010b13]">@{tx.seller?.username}</strong></span>
                        <span suppressHydrationWarning>Created: {new Date(tx.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="inline-flex items-center text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
                          {status?.replace(/_/g, ' ')}
                        </span>

                        {proof && (status === 'pending_payment' || status === 'payment_verifying') && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3" /> Deposit Verification Needed
                          </span>
                        )}
                      </div>

                      {/* Submitted Transfer Proof Summary in Admin Row */}
                      {proof && (status === 'pending_payment' || status === 'payment_verifying') && (
                        <div className="mt-2 p-3.5 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-xs space-y-1">
                          <p className="font-bold text-[#010b13]">
                            Buyer Deposit Details Submitted:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#526371]">
                            <div>Payer: <strong className="text-[#010b13]">{proof.payerName}</strong> ({proof.payerBank})</div>
                            <div>Ref: <strong className="font-mono text-[#010b13]">{proof.referenceCode || proof.txHash}</strong></div>
                            <div>Amount: <strong className="font-mono text-[#010b13]">${proof.amountPaid}</strong></div>
                          </div>
                          {(tx.payment_proof_url || proof.receiptUrl) && (
                            <div className="pt-1">
                              <a
                                href={tx.payment_proof_url || proof.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[#010b13] font-bold underline text-[11px]"
                              >
                                View Attached Deposit Receipt <ExternalLink className="w-3 h-3" />
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
                            className="text-xs font-bold bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Approve Deposit
                          </button>
                        </form>
                      )}

                      {/* Stage 2: Mark credentials in escrow check */}
                      {status === 'payment_confirmed' && (
                        <form action={adminAdvanceEscrow.bind(null, tx.id, 'agent_verifying') as any}>
                          <button
                            type="submit"
                            className="text-xs font-bold bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] py-2 px-3.5 rounded-xl transition cursor-pointer"
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
                            className="text-xs font-bold bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] py-2 px-3.5 rounded-xl transition cursor-pointer"
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
                            className="text-xs font-bold bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] py-2 px-3.5 rounded-xl transition cursor-pointer"
                          >
                            Release Funds to Seller
                          </button>
                        </form>
                      )}

                      {status === 'completed' && (
                        <span className="text-xs font-mono font-bold text-[#010b13] bg-[#ebf1f5] px-3 py-1.5 rounded-xl border border-[#d2dde4] inline-flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Deal Completed
                        </span>
                      )}

                      <Link
                        href={`/dashboard/transactions/${tx.id}`}
                        className="text-xs font-bold text-[#010b13] bg-[#ebf1f5] hover:bg-[#d2dde4] py-2 px-3 rounded-xl transition border border-[#d2dde4]"
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
          <div className="p-12 text-center text-[#526371] text-xs">
            No escrow transactions found.
          </div>
        )}
      </div>
    </div>
  )
}
