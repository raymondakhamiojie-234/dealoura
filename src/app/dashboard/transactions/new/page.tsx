import { createClient } from '@/utils/supabase/server'
import { createTransactionFromOffer } from '@/app/actions/transactions'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, ArrowLeft, Lock } from 'lucide-react'

export default async function NewTransactionPage(props: { searchParams: Promise<{ offer_id: string }> }) {
  const searchParams = await props.searchParams
  const offerId = searchParams.offer_id
  if (!offerId) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch offer to confirm it's accepted and belongs to this user
  const { data: offer, error: fetchError } = await supabase
    .from('offers')
    .select('*, listings(title, price, platform)')
    .eq('id', offerId)
    .single()

  if (fetchError || !offer || offer.status !== 'accepted') {
    return (
      <div className="min-h-screen bg-[#ebf1f5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-[#ffffff] border border-[#d2dde4] p-8 rounded-2xl text-center space-y-3 shadow-xs">
            <h2 className="text-lg font-black text-[#010b13]">Invalid or Unaccepted Offer</h2>
            <p className="text-xs text-[#526371]">
              This offer is either pending review or has not been accepted by the seller yet.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/offers"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#010b13] underline"
              >
                Back to Manage Offers
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const escrowFee = Math.round(offer.amount * 0.05 * 100) / 100
  const totalDue = Math.round((offer.amount + escrowFee) * 100) / 100

  return (
    <div className="min-h-screen bg-[#ebf1f5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link
          href="/dashboard/offers"
          className="inline-flex items-center text-xs font-bold text-[#526371] hover:text-[#010b13] transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Offers
        </Link>

        {/* Card */}
        <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs space-y-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
              Initiate Escrow Room
            </span>
            <h1 className="text-2xl font-black text-[#010b13] tracking-tight mt-2">Confirm Escrow Purchase</h1>
            <p className="text-xs text-[#526371] mt-1">
              The seller accepted your offer. Initialize the formal transaction room to deposit funds into the segregated escrow vault.
            </p>
          </div>

          <div className="bg-[#ebf1f5] p-5 rounded-xl border border-[#d2dde4] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#526371] block">Digital Asset</span>
                <p className="text-base font-black text-[#010b13]">{offer.listings?.title}</p>
                <span className="text-xs text-[#526371] font-semibold">{offer.listings?.platform}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-[#526371] block">Agreed Price</span>
                <span className="text-xl font-black font-mono text-[#010b13]">${offer.amount}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#d2dde4] space-y-2 text-xs">
              <div className="flex justify-between text-[#526371]">
                <span>Agreed Asset Price:</span>
                <span className="font-mono font-bold text-[#010b13]">${offer.amount} USD</span>
              </div>
              <div className="flex justify-between text-[#526371]">
                <span>Escrow Inspection & Protection Fee (5%):</span>
                <span className="font-mono text-[#010b13]">${escrowFee} USD</span>
              </div>
              <div className="flex justify-between text-[#010b13] font-black text-sm pt-2 border-t border-[#d2dde4]">
                <span>Total Escrow Deposit Due:</span>
                <span className="font-mono text-base">${totalDue} USD</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-[11px] text-[#526371] flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#010b13] shrink-0" />
            <span>Dealoura Escrow Protection: Funds will be held in our secure escrow vault. The seller will not receive payment until the 7-day buyer evaluation period finishes.</span>
          </div>

          <form action={async () => {
            'use server'
            const res = await createTransactionFromOffer(offerId)
            if (res?.error) {
              throw new Error(res.error)
            }
          }}>
            <button
              type="submit"
              className="w-full py-3.5 px-5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#ebf1f5]" />
              <span>Create Transaction & Proceed to Escrow Deposit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
