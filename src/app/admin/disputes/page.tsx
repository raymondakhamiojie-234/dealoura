import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Scale,
  DollarSign,
  ArrowRight,
  ExternalLink,
  FileText,
  User,
  Eye,
} from 'lucide-react'
import { AdminArbitrationDialog } from './AdminArbitrationDialog'

export default async function AdminDisputesPage(props: {
  searchParams: Promise<{ filter?: string }>
}) {
  const searchParams = await props.searchParams
  const currentFilter = searchParams.filter || 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch all disputes with transactions, listing, and parties
  const { data: allDisputes } = await supabase
    .from('disputes')
    .select(`
      *,
      transactions (
        id,
        agreed_price,
        escrow_fee,
        status,
        payout_status,
        created_at,
        listings (id, title, platform, price),
        buyer:buyer_id (id, username, email),
        seller:seller_id (id, username, email)
      ),
      opener:opened_by (id, username, email)
    `)
    .order('created_at', { ascending: false })

  const disputes = allDisputes || []

  // Metrics
  const activeDisputes = disputes.filter(
    (d) => d.status === 'open' || d.status === 'under_review'
  )
  const contestedCapital = activeDisputes.reduce(
    (sum, d) => sum + (d.transactions?.agreed_price || 0),
    0
  )
  const resolvedBuyerCount = disputes.filter(
    (d) => d.status === 'resolved_buyer'
  ).length
  const resolvedSellerCount = disputes.filter(
    (d) => d.status === 'resolved_seller'
  ).length

  // Filter disputes
  const filteredDisputes = disputes.filter((d) => {
    if (currentFilter === 'open') return d.status === 'open'
    if (currentFilter === 'under_review') return d.status === 'under_review'
    if (currentFilter === 'resolved')
      return (
        d.status === 'resolved_buyer' ||
        d.status === 'resolved_seller' ||
        d.status === 'closed'
      )
    return true
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
            Arbitration &amp; Mediation Desk
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
            Escrow Court
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">
          Dispute Resolution &amp; Claims Desk
        </h1>
        <p className="text-xs sm:text-sm text-[#526371] mt-1">
          Arbitrate contested transactions, inspect buyer claims &amp; evidence proofs, and issue legally binding refund or release rulings.
        </p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-[#526371] block">
            Active Disputes
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#010b13]">
              {activeDisputes.length}
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[11px] text-[#526371] block">
            Awaiting investigation or ruling
          </span>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-[#526371] block">
            Contested Capital
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#010b13]">
              ${contestedCapital.toLocaleString()}
            </span>
            <DollarSign className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-[11px] text-[#526371] block">
            Funds locked in escrow vault
          </span>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-[#526371] block">
            Buyer Refunds Issued
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-red-600">
              {resolvedBuyerCount}
            </span>
            <Scale className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-[11px] text-[#526371] block">
            Transactions cancelled &amp; refunded
          </span>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-[#526371] block">
            Seller Payouts Released
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-600">
              {resolvedSellerCount}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[11px] text-[#526371] block">
            Disputes resolved in seller favor
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#d2dde4] pb-3 overflow-x-auto">
        <Link
          href="/admin/disputes?filter=all"
          className={`py-2 px-4 rounded-xl text-xs font-bold transition shrink-0 ${
            currentFilter === 'all'
              ? 'bg-[#010b13] text-[#ebf1f5]'
              : 'bg-[#ffffff] text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
          }`}
        >
          All Cases ({disputes.length})
        </Link>
        <Link
          href="/admin/disputes?filter=open"
          className={`py-2 px-4 rounded-xl text-xs font-bold transition shrink-0 ${
            currentFilter === 'open'
              ? 'bg-[#010b13] text-[#ebf1f5]'
              : 'bg-[#ffffff] text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
          }`}
        >
          Open / Pending ({disputes.filter((d) => d.status === 'open').length})
        </Link>
        <Link
          href="/admin/disputes?filter=under_review"
          className={`py-2 px-4 rounded-xl text-xs font-bold transition shrink-0 ${
            currentFilter === 'under_review'
              ? 'bg-[#010b13] text-[#ebf1f5]'
              : 'bg-[#ffffff] text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
          }`}
        >
          Under Investigation ({disputes.filter((d) => d.status === 'under_review').length})
        </Link>
        <Link
          href="/admin/disputes?filter=resolved"
          className={`py-2 px-4 rounded-xl text-xs font-bold transition shrink-0 ${
            currentFilter === 'resolved'
              ? 'bg-[#010b13] text-[#ebf1f5]'
              : 'bg-[#ffffff] text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
          }`}
        >
          Resolved Archive ({resolvedBuyerCount + resolvedSellerCount})
        </Link>
      </div>

      {/* Cases List */}
      <div className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] overflow-hidden">
        {filteredDisputes && filteredDisputes.length > 0 ? (
          <ul className="divide-y divide-[#d2dde4]">
            {filteredDisputes.map((d) => {
              const tx = d.transactions
              const listingTitle = tx?.listings?.title || 'Account Asset'
              const platform = tx?.listings?.platform || 'Asset'
              const agreedPrice = tx?.agreed_price || 0
              const isResolved =
                d.status === 'resolved_buyer' ||
                d.status === 'resolved_seller' ||
                d.status === 'closed'

              return (
                <li key={d.id} className="p-6 space-y-5">
                  {/* Case Top Bar */}
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                          {platform}
                        </span>

                        {d.status === 'open' && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Awaiting Investigation
                          </span>
                        )}

                        {d.status === 'under_review' && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Under Formal Investigation
                          </span>
                        )}

                        {d.status === 'resolved_buyer' && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Buyer Refunded
                          </span>
                        )}

                        {d.status === 'resolved_seller' && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Seller Payout Released
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-[#526371]">
                          Case #{d.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-[#010b13]">
                        {listingTitle}{' '}
                        <span className="text-[#526371] font-semibold">
                          (${agreedPrice} USD)
                        </span>
                      </h3>
                    </div>

                    {/* Right Action Links */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/transactions/${d.transaction_id}`}
                        target="_blank"
                        className="text-xs font-bold text-[#010b13] underline hover:opacity-80 inline-flex items-center gap-1"
                      >
                        <span>Inspect Deal Room</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Parties & Dates Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#ebf1f5] p-3.5 rounded-xl border border-[#d2dde4] text-xs">
                    <div>
                      <span className="text-[#526371] block text-[10px] uppercase font-mono font-bold">
                        Claimant (Buyer)
                      </span>
                      <strong className="text-[#010b13]">
                        @{tx?.buyer?.username || d.opener?.username || 'Buyer'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#526371] block text-[10px] uppercase font-mono font-bold">
                        Respondent (Seller)
                      </span>
                      <strong className="text-[#010b13]">
                        @{tx?.seller?.username || 'Seller'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#526371] block text-[10px] uppercase font-mono font-bold">
                        Case Registered
                      </span>
                      <span suppressHydrationWarning className="text-[#010b13] font-semibold">
                        {new Date(d.created_at).toISOString().split('T')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Buyer Claim Box */}
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs space-y-1.5">
                    <span className="font-bold text-red-950 uppercase tracking-wider text-[10px] block">
                      Dispute Claim Statement:
                    </span>
                    <p className="text-red-900 leading-relaxed whitespace-pre-wrap">
                      {d.reason}
                    </p>

                    {d.evidence_url && (
                      <div className="pt-2">
                        <a
                          href={d.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-red-800 underline hover:text-red-950"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Submitted Evidence Proof &rarr;</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* If Resolved: Resolution Ruling Display */}
                  {d.resolution_notes && isResolved && (
                    <div className="bg-[#ffffff] border border-[#d2dde4] p-4 rounded-xl text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#010b13] uppercase tracking-wider text-[10px]">
                        <Scale className="w-3.5 h-3.5 text-amber-500" />
                        <span>Official Arbitration Ruling &amp; Findings:</span>
                      </div>
                      <p className="text-[#010b13] leading-relaxed italic">
                        &ldquo;{d.resolution_notes}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Arbitration Action Buttons */}
                  <div className="pt-1 flex items-center justify-between flex-wrap gap-3">
                    <span className="text-[11px] text-[#526371]">
                      {isResolved
                        ? 'Arbitration complete. Verdict has been executed.'
                        : 'Review all evidence before issuing a legally binding ruling.'}
                    </span>

                    <AdminArbitrationDialog dispute={d as any} />
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-16 text-center text-xs text-[#526371] space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#010b13] mx-auto" />
            <p className="font-bold text-base text-[#010b13]">No Dispute Cases Found</p>
            <p className="max-w-md mx-auto">
              There are no dispute cases matching the selected filter ({currentFilter}). All transactions are running smoothly in escrow.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
