import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  RefreshCw,
  CheckSquare,
  FileText,
  AlertTriangle,
  Users,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { AdminEmailTestCard } from '@/components/admin-email-test-card'
import { AdminEscrowBankCard } from '@/components/admin-escrow-bank-card'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Fetch KPI Metrics in parallel
  const [
    { count: pendingListingsCount },
    { count: activeEscrowCount },
    { count: pendingVerificationsCount },
    { count: openDisputesCount },
    { count: totalUsersCount },
  ] = await Promise.all([
    supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),

    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['payment_confirmed', 'agent_verifying', 'buyer_7_day_evaluation']),

    supabase
      .from('verifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted'),

    supabase
      .from('disputes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),

    supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true }),
  ])

  // 2. Fetch Recent Escrow Transactions
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      agreed_price,
      status,
      created_at,
      listings (title, platform),
      buyer:buyer_id (username),
      seller:seller_id (username)
    `)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
            Administration & Governance
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">Staff Command Center</h1>
        <p className="text-xs sm:text-sm text-[#526371] mt-1">
          Monitor platform transactions, escrow middle-man transfers, listings review, and user safety.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Active Escrow */}
        <div className="bg-[#ffffff] p-5 rounded-2xl shadow-xs border border-[#d2dde4] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#010b13] mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#526371]">Active Escrow</span>
            <RefreshCw className="w-4 h-4 text-[#010b13]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#010b13]">{activeEscrowCount || 0}</div>
          <Link href="/admin/transactions" className="text-[11px] font-bold text-[#010b13] hover:underline mt-2 inline-flex items-center">
            Inspect pipeline &rarr;
          </Link>
        </div>

        {/* Pending Listings */}
        <div className="bg-[#ffffff] p-5 rounded-2xl shadow-xs border border-[#d2dde4] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#010b13] mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#526371]">Listings Review</span>
            <CheckSquare className="w-4 h-4 text-[#010b13]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#010b13]">{pendingListingsCount || 0}</div>
          <Link href="/admin/listings" className="text-[11px] font-bold text-[#010b13] hover:underline mt-2 inline-flex items-center">
            Review accounts &rarr;
          </Link>
        </div>

        {/* Pending KYC */}
        <div className="bg-[#ffffff] p-5 rounded-2xl shadow-xs border border-[#d2dde4] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#010b13] mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#526371]">KYC Verifications</span>
            <FileText className="w-4 h-4 text-[#010b13]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#010b13]">{pendingVerificationsCount || 0}</div>
          <Link href="/admin/verifications" className="text-[11px] font-bold text-[#010b13] hover:underline mt-2 inline-flex items-center">
            Inspect IDs &rarr;
          </Link>
        </div>

        {/* Disputes */}
        <div className="bg-[#ffffff] p-5 rounded-2xl shadow-xs border border-[#d2dde4] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#010b13] mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#526371]">Open Disputes</span>
            <AlertTriangle className="w-4 h-4 text-[#010b13]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#010b13]">{openDisputesCount || 0}</div>
          <Link href="/admin/disputes" className="text-[11px] font-bold text-[#010b13] hover:underline mt-2 inline-flex items-center">
            Resolve tickets &rarr;
          </Link>
        </div>

        {/* Total Users */}
        <div className="bg-[#ffffff] p-5 rounded-2xl shadow-xs border border-[#d2dde4] flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[#010b13] mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#526371]">Total Users</span>
            <Users className="w-4 h-4 text-[#010b13]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#010b13]">{totalUsersCount || 0}</div>
          <span className="text-[11px] text-[#526371] mt-2">Registered Accounts</span>
        </div>
      </div>

      {/* Escrow Bank Account Settings & Interactive Preview */}
      <AdminEscrowBankCard />

      {/* Resend Email Diagnostic Card */}
      <AdminEmailTestCard />

      {/* Recent Escrow Pipeline Table */}
      <div className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] overflow-hidden">
        <div className="p-6 border-b border-[#d2dde4] flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#010b13]">Recent Escrow Transactions</h2>
            <p className="text-xs text-[#526371] mt-0.5">Middle-man transfer deals requiring escrow verification</p>
          </div>
          <Link
            href="/admin/transactions"
            className="text-xs font-bold text-[#010b13] underline inline-flex items-center"
          >
            View all deals <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#526371]">
              <thead className="bg-[#ebf1f5] text-[10px] font-mono font-bold uppercase text-[#526371] border-b border-[#d2dde4]">
                <tr>
                  <th className="py-3 px-6">Account</th>
                  <th className="py-3 px-6">Buyer</th>
                  <th className="py-3 px-6">Seller</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Escrow Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d2dde4]">
                {recentTransactions.map((tx: any) => {
                  return (
                    <tr key={tx.id} className="hover:bg-[#ebf1f5]/40 transition">
                      <td className="py-4 px-6 font-bold text-[#010b13]">
                        <div className="truncate max-w-[200px]">{tx.listings?.title || 'Listing'}</div>
                        <span className="text-[10px] text-[#526371] font-normal">{tx.listings?.platform}</span>
                      </td>
                      <td className="py-4 px-6 font-medium text-[#010b13]">@{tx.buyer?.username || 'Buyer'}</td>
                      <td className="py-4 px-6 font-medium text-[#010b13]">@{tx.seller?.username || 'Seller'}</td>
                      <td className="py-4 px-6 font-black font-mono text-[#010b13]">${tx.agreed_price}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                          {tx.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/dashboard/transactions/${tx.id}`}
                          className="text-xs font-bold text-[#ebf1f5] bg-[#010b13] hover:bg-[#18263B] py-1.5 px-3 rounded-lg transition"
                        >
                          Manage Deal
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#526371] text-xs">
            No transactions initiated yet.
          </div>
        )}
      </div>
    </div>
  )
}
