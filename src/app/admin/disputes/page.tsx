import { createClient } from '@/utils/supabase/server'
import { resolveDispute } from '@/app/actions/disputes'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react'

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
        listings (title, platform)
      ),
      opener:opened_by (username)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
            Arbitration & Claims
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">Resolve Dispute Tickets</h1>
        <p className="text-xs sm:text-sm text-[#526371] mt-1">
          Arbitrate contested transactions, inspect chat evidence, and release funds or refund buyers.
        </p>
      </div>

      <div className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] overflow-hidden">
        {disputes && disputes.length > 0 ? (
          <ul className="divide-y divide-[#d2dde4]">
            {disputes.map((d) => (
              <li key={d.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                      {d.transactions?.listings?.platform || 'Asset'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#010b13] mt-1">
                      {d.transactions?.listings?.title} (${d.transactions?.agreed_price})
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#526371] mt-1">
                      <span>Opened by: <strong className="text-[#010b13]">@{d.opener?.username}</strong></span>
                      <span>•</span>
                      <span suppressHydrationWarning>Date: {new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/transactions/${d.transaction_id}`}
                    className="text-xs font-bold text-[#010b13] underline hover:opacity-80"
                  >
                    View Escrow Deal &rarr;
                  </Link>
                </div>
                
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs text-red-900 space-y-1">
                  <span className="font-bold text-red-950 uppercase tracking-wider text-[10px]">Reason for Dispute:</span>
                  <p className="leading-relaxed">{d.reason}</p>
                </div>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#ebf1f5] p-4 rounded-xl border border-[#d2dde4] space-y-2">
                    <h4 className="font-bold text-xs text-[#010b13]">Resolve in Favor of Buyer</h4>
                    <p className="text-[11px] text-[#526371]">Cancels deal, marks dispute resolved, and returns funds to buyer.</p>
                    <form action={async () => {
                      'use server'
                      await resolveDispute(d.id, d.transaction_id, 'resolved_buyer', 'Admin decided in favor of buyer. Transaction cancelled.')
                    }}>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Refund Buyer (Cancel Tx)
                      </button>
                    </form>
                  </div>

                  <div className="bg-[#ebf1f5] p-4 rounded-xl border border-[#d2dde4] space-y-2">
                    <h4 className="font-bold text-xs text-[#010b13]">Resolve in Favor of Seller</h4>
                    <p className="text-[11px] text-[#526371]">Marks deal completed and authorizes seller payout release.</p>
                    <form action={async () => {
                      'use server'
                      await resolveDispute(d.id, d.transaction_id, 'resolved_seller', 'Admin decided in favor of seller. Transaction completed.')
                    }}>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Release Funds to Seller
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-xs text-[#526371] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#010b13] mx-auto" />
            <p className="font-bold text-[#010b13]">No Open Disputes</p>
            <p>All transactions are operating smoothly within the escrow protocol.</p>
          </div>
        )}
      </div>
    </div>
  )
}
