import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Tag
} from 'lucide-react'

export const metadata = {
  title: 'My Orders & Sales | Dealoura Escrow',
  description: 'Track your active escrow transactions, payments in custody, credential handovers, and completed sales.',
}

export default async function TransactionsDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/dashboard/transactions')

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      listings (title, platform),
      buyer:buyer_id (username),
      seller:seller_id (username)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Fetch pending / accepted offers for current user (as seller or buyer)
  const { data: offers } = await supabase
    .from('offers')
    .select(`
      id,
      amount,
      status,
      message,
      created_at,
      listing_id,
      buyer_id,
      listings (id, title, platform, seller_id, price),
      buyer:buyer_id (username)
    `)
    .in('status', ['pending', 'countered', 'accepted'])
    .order('created_at', { ascending: false })

  const purchases = transactions?.filter(t => t.buyer_id === user.id) || []
  const sales = transactions?.filter(t => t.seller_id === user.id) || []

  const pendingSellerOffers = (offers || []).filter((o: any) => {
    const l = Array.isArray(o.listings) ? o.listings[0] : o.listings
    return l?.seller_id === user.id
  })

  const pendingBuyerOffers = (offers || []).filter((o: any) => o.buyer_id === user.id)

  return (
    <div className="bg-[#ebf1f5] min-h-screen py-10 font-sans text-[#010b13]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#d2dde4] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#010b13] bg-white px-2.5 py-0.5 rounded-full border border-[#d2dde4]">
                Escrow Order Desk
              </span>
              <span className="text-xs text-[#526371]">• 100% Protected Deals</span>
            </div>
            <h1 className="text-3xl font-black text-[#010b13] tracking-tight">Your Orders &amp; Sales</h1>
            <p className="text-xs sm:text-sm text-[#526371] mt-1">
              Track live deposit status, credential audits, 7-day inspection windows, and disbursements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/marketplace"
              className="px-4 py-2 bg-white hover:bg-[#d2dde4] border border-[#d2dde4] text-[#010b13] text-xs font-bold rounded-xl transition shadow-xs"
            >
              Browse Marketplace
            </Link>
            <Link
              href="/dashboard/seller/listings/new"
              className="px-4 py-2 bg-[#010b13] hover:bg-[#0a1722] text-[#ebf1f5] text-xs font-black rounded-xl transition shadow-sm"
            >
              List an Account
            </Link>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#d2dde4] shadow-xs">
            <div className="flex items-center justify-between text-[#526371] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Transactions</span>
              <ShoppingBag className="w-4 h-4 text-[#010b13]" />
            </div>
            <div className="text-2xl font-black text-[#010b13]">{transactions?.length || 0}</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#d2dde4] shadow-xs">
            <div className="flex items-center justify-between text-[#526371] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Purchases (Buyer)</span>
              <CheckCircle2 className="w-4 h-4 text-[#010b13]" />
            </div>
            <div className="text-2xl font-black text-[#010b13]">{purchases.length}</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#d2dde4] shadow-xs">
            <div className="flex items-center justify-between text-[#526371] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Sales (Seller)</span>
              <DollarSign className="w-4 h-4 text-[#010b13]" />
            </div>
            <div className="text-2xl font-black text-[#010b13]">{sales.length}</div>
          </div>

          <Link 
            href="/dashboard/offers"
            className="bg-white p-5 rounded-3xl border border-[#d2dde4] hover:border-[#010b13] shadow-xs transition group block"
          >
            <div className="flex items-center justify-between text-[#526371] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Offers &amp; Proposals</span>
              <Tag className="w-4 h-4 text-[#010b13] group-hover:scale-110 transition" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-[#010b13]">
                {pendingSellerOffers.length + pendingBuyerOffers.length}
              </div>
              <span className="text-[11px] font-bold text-[#526371] group-hover:text-[#010b13] underline">
                Manage &rarr;
              </span>
            </div>
          </Link>
        </div>

        {/* Incoming Offers Alert (For Sellers) */}
        {pendingSellerOffers.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-600 text-white">
                  Action Required &bull; {pendingSellerOffers.length} Incoming Offer{pendingSellerOffers.length > 1 ? 's' : ''}
                </span>
                <h2 className="text-sm sm:text-base font-black text-amber-950">
                  Offers Received on Your Listings
                </h2>
              </div>
              <Link
                href="/dashboard/offers"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-black underline shrink-0"
              >
                <span>View Full Offers Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-amber-800">
              A buyer has submitted a purchase proposal for your channel. Accept the offer to initialize the escrow transaction and allow the buyer to deposit payment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {pendingSellerOffers.map((offer: any) => {
                const listing = Array.isArray(offer.listings) ? offer.listings[0] : offer.listings
                return (
                  <div key={offer.id} className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-2xs flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13]">
                          {listing?.platform || 'Asset'}
                        </span>
                        <span className="text-xs font-bold text-[#010b13] truncate">
                          {listing?.title}
                        </span>
                      </div>
                      <div className="text-xs text-[#526371]">
                        Buyer: <strong className="text-[#010b13]">@{offer.buyer?.username || 'buyer'}</strong> &bull; Offer: <strong className="font-mono text-[#010b13] font-black">${offer.amount}</strong>
                      </div>
                    </div>
                    <Link
                      href="/dashboard/offers"
                      className="px-3.5 py-1.5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition shadow-xs shrink-0"
                    >
                      Review Offer
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Outgoing Offers Alert (For Buyers) */}
        {pendingBuyerOffers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                  Buyer Proposals &bull; {pendingBuyerOffers.length} Active
                </span>
                <h2 className="text-sm sm:text-base font-black text-blue-950">
                  Your Purchase Proposals in Negotiation
                </h2>
              </div>
              <Link
                href="/dashboard/offers"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-black underline shrink-0"
              >
                <span>Manage Offers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {pendingBuyerOffers.map((offer: any) => {
                const listing = Array.isArray(offer.listings) ? offer.listings[0] : offer.listings
                const isAccepted = offer.status === 'accepted'
                return (
                  <div key={offer.id} className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-2xs flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13]">
                          {listing?.platform || 'Asset'}
                        </span>
                        <span className="text-xs font-bold text-[#010b13] truncate">
                          {listing?.title}
                        </span>
                      </div>
                      <div className="text-xs text-[#526371]">
                        Status: <span className="font-semibold text-[#010b13] uppercase font-mono text-[10px]">{offer.status}</span> &bull; Your Offer: <strong className="font-mono text-[#010b13] font-black">${offer.amount}</strong>
                      </div>
                    </div>
                    <Link
                      href={isAccepted ? `/dashboard/transactions/new?offer_id=${offer.id}` : '/dashboard/offers'}
                      className="px-3.5 py-1.5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition shadow-xs shrink-0"
                    >
                      {isAccepted ? 'Proceed to Escrow' : 'View Status'}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="space-y-4">
          {transactions && transactions.length > 0 ? (
            transactions.map((tx: any) => {
              const isBuyer = tx.buyer_id === user.id
              const isCompleted = tx.status === 'completed'
              const isDisputed = tx.status === 'disputed'
              const isCancelled = tx.status === 'cancelled'
              const isEvaluation = tx.status === 'buyer_7_day_evaluation'
              const isVerifying = tx.status === 'agent_verifying' || tx.status === 'payment_verifying'
              const isPendingPayment = tx.status === 'pending_payment'
              const listing = Array.isArray(tx.listings) ? tx.listings[0] : tx.listings
              const isYouTube = listing?.platform?.toLowerCase().includes('youtube')

              const statusBadgeStyle = isCompleted
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : isDisputed
                ? 'bg-red-100 text-red-900 border-red-300 font-black'
                : isCancelled
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : isEvaluation
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : isVerifying
                ? 'bg-blue-100 text-blue-900 border-blue-200'
                : 'bg-[#ebf1f5] text-[#010b13] border-[#d2dde4]'

              const formattedStatus = isDisputed
                ? 'Dispute in Arbitration'
                : isCancelled
                ? 'Cancelled / Refunded'
                : isEvaluation
                ? (isYouTube ? '7-Day YouTube Hold' : '15-Min Fast Inspection')
                : tx.status === 'agent_verifying'
                ? 'Agent Auditing'
                : tx.status === 'payment_verifying'
                ? 'Payment Reconciling'
                : tx.status === 'pending_payment'
                ? 'Awaiting Deposit'
                : isCompleted
                ? (!isBuyer && tx.payout_status === 'completed' ? 'Completed (Payout Sent)' : 'Deal Completed')
                : tx.status.replace(/_/g, ' ')

              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-3xl border border-[#d2dde4] p-5 sm:p-6 hover:border-[#010b13] transition-all duration-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusBadgeStyle}`}>
                        {formattedStatus}
                      </span>
                      <span className="text-[10px] font-mono text-[#526371]">
                        Escrow ID: #{tx.id.slice(0, 8)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isBuyer ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {isBuyer ? 'Your Purchase' : 'Your Sale'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#010b13]">
                      {listing?.title || 'Digital Asset Escrow Contract'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#526371]">
                      <span>
                        {isBuyer ? 'Seller: ' : 'Buyer: '}
                        <strong className="text-[#010b13]">
                          @{isBuyer ? tx.seller?.username || 'seller' : tx.buyer?.username || 'buyer'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>Platform: {listing?.platform || 'Social Channel'}</span>
                      <span>•</span>
                      <span>Date: {new Date(tx.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#d2dde4]">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono uppercase text-[#526371] block">Agreed Price</span>
                      <span className="text-xl font-black text-[#010b13] font-mono">
                        ${Number(tx.agreed_price).toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/transactions/${tx.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#010b13] hover:bg-[#0a1722] text-[#ebf1f5] font-black text-xs rounded-xl shadow-xs transition"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#d2dde4] p-8 space-y-4">
              <ShoppingBag className="w-12 h-12 text-[#526371]/50 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#010b13]">No active transactions yet</h3>
                <p className="text-xs text-[#526371] max-w-md mx-auto">
                  {pendingSellerOffers.length > 0 || pendingBuyerOffers.length > 0
                    ? 'You have active purchase proposals in negotiation shown above. Once an offer is accepted and deposit is initiated, the escrow order room will appear here.'
                    : 'When you purchase a channel, make an offer, or accept a bid on your listings, your live escrow orders will appear here.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/dashboard/offers"
                  className="px-5 py-2.5 text-xs font-bold bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4] rounded-xl hover:bg-[#d2dde4] transition shadow-xs"
                >
                  View Offers &amp; Proposals
                </Link>
                <Link
                  href="/marketplace"
                  className="px-5 py-2.5 text-xs font-black bg-[#010b13] text-[#ebf1f5] rounded-xl hover:bg-[#0a1722] transition shadow-xs"
                >
                  Browse Marketplace
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
