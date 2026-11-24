import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Lock,
  Building2,
  Coins,
  DollarSign,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { SellerPayoutsHistoryTable } from './SellerPayoutsHistoryTable'

export const metadata = {
  title: 'Financial Desk & Escrow Settlements | Dealoura',
  description: 'Manage your direct deal settlements, crypto USDT payouts, and bank wire records.',
}

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/wallet')
  }

  // Fetch all transactions where the user is the seller
  const { data: sellerTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      agreed_price,
      escrow_fee,
      status,
      seller_payout_method,
      seller_payout_details,
      payout_status,
      payout_tx_hash,
      payout_sent_at,
      created_at,
      listings (title, platform),
      buyer:buyer_id (username)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const payouts = sellerTransactions || []

  // Compute metrics
  const disbursedEarnings = payouts
    .filter((tx) => tx.payout_status === 'completed')
    .reduce((sum, tx) => {
      const fee = tx.escrow_fee || Math.round(tx.agreed_price * 0.05 * 100) / 100
      return sum + Math.max(0, tx.agreed_price - fee)
    }, 0)

  const pendingDisbursements = payouts
    .filter((tx) => tx.payout_status === 'pending' || (tx.status === 'completed' && tx.payout_status !== 'completed'))
    .reduce((sum, tx) => {
      const fee = tx.escrow_fee || Math.round(tx.agreed_price * 0.05 * 100) / 100
      return sum + Math.max(0, tx.agreed_price - fee)
    }, 0)

  const activeEscrowHolding = payouts
    .filter((tx) => ['pending_payment', 'payment_confirmed', 'agent_verifying', 'buyer_7_day_evaluation'].includes(tx.status))
    .reduce((sum, tx) => {
      const fee = tx.escrow_fee || Math.round(tx.agreed_price * 0.05 * 100) / 100
      return sum + Math.max(0, tx.agreed_price - fee)
    }, 0)

  return (
    <div className="bg-[#ebf1f5] min-h-screen py-10 font-sans text-[#010b13]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/dashboard/transactions"
                className="text-xs font-bold text-[#526371] hover:text-[#010b13] transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Escrow Deals</span>
              </Link>
              <span className="text-[#d2dde4]">•</span>
              <span className="text-xs font-mono font-bold text-[#010b13] uppercase">Settlement Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">
              Seller Payouts &amp; Settlements
            </h1>
            <p className="text-xs sm:text-sm text-[#526371] mt-1">
              Direct deal-specific settlements via Crypto USDT (TRC-20, ERC-20, BEP-20) and Direct Bank Wire.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#010b13] bg-[#ffffff] px-3.5 py-1.5 rounded-full border border-[#d2dde4] shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Segregated Escrow Banking</span>
          </div>
        </div>

        {/* Financial Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#526371] text-[10px] font-mono font-bold uppercase tracking-wider">
              <span>Lifetime Disbursed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
              ${disbursedEarnings.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#526371]">Net proceeds successfully wired/transferred</p>
          </div>

          <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#526371] text-[10px] font-mono font-bold uppercase tracking-wider">
              <span>Pending Disbursement</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#010b13] font-mono">
              ${pendingDisbursements.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#526371]">Completed deals currently in payout queue</p>
          </div>

          <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#526371] text-[10px] font-mono font-bold uppercase tracking-wider">
              <span>Active in Custody</span>
              <Lock className="w-4 h-4 text-[#010b13]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#010b13] font-mono">
              ${activeEscrowHolding.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#526371]">Under active inspection hold</p>
          </div>
        </div>

        {/* Regulatory Architecture Notice */}
        <div className="bg-[#010b13] text-[#ebf1f5] rounded-2xl p-6 sm:p-7 border border-[#18263B] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-[#ebf1f5]">
              Regulatory Escrow Architecture
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#ebf1f5]">
            Segregated Trust Vaults &amp; Direct Settlements
          </h3>
          <p className="text-xs text-[#ebf1f5]/80 leading-relaxed max-w-3xl">
            In strict compliance with international escrow standards and digital asset custody regulations, Dealoura does not pool user funds in stored-value wallets. Every transaction is held in a segregated, deal-specific escrow vault. Upon completion of the buyer inspection hold, your net proceeds are disbursed directly to your specified <strong>Crypto USDT wallet address</strong> or <strong>Direct Bank Wire</strong> with a public blockchain TxHash or wire reference.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Crypto USDT on TRC-20, ERC-20, or BEP-20</span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Direct Bank Wire via IBAN, SWIFT, and BIC</span>
            </div>
          </div>
        </div>

        {/* Payouts Table */}
        <SellerPayoutsHistoryTable payouts={payouts} />

      </div>
    </div>
  )
}
