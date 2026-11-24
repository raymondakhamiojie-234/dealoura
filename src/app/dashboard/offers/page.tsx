import { createClient } from '@/utils/supabase/server'
import { updateOfferStatus } from '@/app/actions/offers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, Clock, CheckCircle2, XCircle, DollarSign, Tag, ArrowLeft, ShoppingBag } from 'lucide-react'

export default async function OffersDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch offers with joined listings and transactions
  const { data: offers, error } = await supabase
    .from('offers')
    .select(`
      *,
      listings (title, seller_id, price, platform),
      buyer:buyer_id (username),
      transactions (id, status)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching offers:", error)
  }

  return (
    <div className="min-h-screen bg-[#ebf1f5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d2dde4] pb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
                Escrow Negotiation Desk
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">Manage Offers</h1>
            <p className="text-xs sm:text-sm text-[#526371] mt-1">
              Review and negotiate offers on listed digital assets before initiating escrow custody.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-[#d2dde4] hover:bg-[#d2dde4] text-[#010b13] text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders &amp; Sales</span>
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Tag className="w-4 h-4" />
              <span>Browse Marketplace</span>
            </Link>
          </div>
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {offers && offers.length > 0 ? (
            offers.map((offer) => {
              const isBuyer = offer.buyer_id === user.id
              const isPending = offer.status === 'pending' || offer.status === 'countered'
              const listing = Array.isArray(offer.listings) ? offer.listings[0] : offer.listings

              return (
                <div
                  key={offer.id}
                  className="bg-[#ffffff] rounded-2xl p-6 sm:p-7 border border-[#d2dde4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                        {listing?.platform || 'Asset'}
                      </span>
                      <span className="text-xs font-bold text-[#526371]">
                        {isBuyer ? 'You made this offer' : 'Offer received on your listing'}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase ml-auto md:ml-0 ${
                          offer.status === 'accepted'
                            ? 'bg-[#010b13] text-[#ebf1f5]'
                            : offer.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]'
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-[#010b13]">
                      {listing?.title || 'Account'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div>
                        <span className="text-[#526371]">Offered Amount: </span>
                        <strong className="text-base font-black font-mono text-[#010b13]">${offer.amount}</strong>
                      </div>
                      <div className="text-[#526371]">
                        <span>Asking Price: </span>
                        <span className="font-mono font-bold text-[#010b13]">${listing?.price || '—'}</span>
                      </div>
                      {offer.buyer?.username && !isBuyer && (
                        <div className="text-[#526371]">
                          <span>Buyer: </span>
                          <strong className="text-[#010b13]">@{offer.buyer.username}</strong>
                        </div>
                      )}
                    </div>

                    {offer.message && (
                      <p className="text-xs text-[#526371] bg-[#ebf1f5] p-3 rounded-xl border border-[#d2dde4] italic">
                        &ldquo;{offer.message}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    {/* Seller Actions */}
                    {!isBuyer && isPending && (
                      <>
                        <form
                          action={async () => {
                            'use server'
                            await updateOfferStatus(offer.id, 'accepted')
                          }}
                        >
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Accept Offer
                          </button>
                        </form>
                        <form
                          action={async () => {
                            'use server'
                            await updateOfferStatus(offer.id, 'rejected')
                          }}
                        >
                          <button
                            type="submit"
                            className="px-4 py-2.5 border border-[#d2dde4] hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </form>
                      </>
                    )}

                    {/* Buyer Actions */}
                    {isBuyer && offer.status === 'pending' && (
                      <form
                        action={async () => {
                          'use server'
                          await updateOfferStatus(offer.id, 'withdrawn')
                        }}
                      >
                        <button
                          type="submit"
                          className="px-4 py-2.5 border border-[#d2dde4] hover:bg-[#ebf1f5] text-[#526371] hover:text-[#010b13] text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Withdraw Offer
                        </button>
                      </form>
                    )}

                    {/* If accepted, link to Phase 3 Payment / Transaction Room */}
                    {offer.status === 'accepted' && (() => {
                      const tx = Array.isArray(offer.transactions) ? offer.transactions[0] : offer.transactions
                      if (tx?.id) {
                        return (
                          <Link
                            href={`/dashboard/transactions/${tx.id}`}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                          >
                            <span>Track Escrow Order</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )
                      }
                      if (isBuyer) {
                        return (
                          <Link
                            href={`/dashboard/transactions/new?offer_id=${offer.id}`}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                          >
                            <span>Proceed to Escrow Deposit</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )
                      }
                      return (
                        <span className="text-[11px] font-mono text-[#526371] px-3.5 py-2 rounded-xl bg-[#ebf1f5] border border-[#d2dde4] font-bold">
                          Awaiting Buyer Deposit
                        </span>
                      )
                    })()}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-[#ffffff] rounded-2xl p-12 text-center border border-[#d2dde4] shadow-xs space-y-3">
              <Clock className="w-10 h-10 text-[#526371] mx-auto" />
              <h3 className="text-base font-bold text-[#010b13]">No Active Offers Found</h3>
              <p className="text-xs text-[#526371] max-w-sm mx-auto">
                You haven&apos;t placed or received any offers yet. Explore the marketplace to find digital channels and assets.
              </p>
              <div className="pt-2">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#010b13] text-[#ebf1f5] text-xs font-bold rounded-xl hover:bg-[#18263B] transition"
                >
                  Explore Verified Channels
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
