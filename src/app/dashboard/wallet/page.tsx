import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Zap, Lock, Building2, Coins, HelpCircle } from 'lucide-react'
import { getUserWallet, getWalletHistory } from '@/app/actions/wallet'
import { WalletBalanceCards } from './WalletBalanceCards'
import { WalletLedgerTable } from './WalletLedgerTable'

export const metadata = {
  title: 'My Wallet & Escrow Balance',
  description: 'Manage your Dealoura wallet, escrow deposits, and withdrawal payouts.'
}

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/wallet')
  }

  const [{ wallet }, { transactions, withdrawals }] = await Promise.all([
    getUserWallet(),
    getWalletHistory()
  ])

  const safeWallet = wallet || {
    id: 'default',
    user_id: user.id,
    available_balance: 0,
    escrow_locked_balance: 0,
    total_withdrawn: 0,
    currency: 'USD',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/dashboard/transactions"
                className="text-xs font-bold text-slate-500 hover:text-blue-600 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono font-bold text-blue-600 uppercase">Financial Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Internal Wallet &amp; Balance
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your money, your wallet. Instant 1-click escrow payments and flexible disbursements.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>256-Bit FDIC Insured Escrow Custody</span>
          </div>
        </div>

        {/* 1. Wallet Balance Overview Cards */}
        <WalletBalanceCards wallet={safeWallet} currentUserId={user.id} />

        {/* 2. Three Pillars Info Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Instant Escrow Clearance</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Pay into escrow directly from your wallet balance in 1 second without waiting for bank wires.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Automatic Seller Credits</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Channel payouts land in your wallet the moment buyer evaluation concludes.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Multi-Channel Withdrawals</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Withdraw to domestic bank wires (ACH/SWIFT) or crypto (USDT TRC-20, USDC) anytime.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Transaction Activity Ledger */}
        <WalletLedgerTable
          transactions={transactions}
          withdrawals={withdrawals}
        />

      </div>
    </div>
  )
}
