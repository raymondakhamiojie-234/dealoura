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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Staff Command Center</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor platform transactions, escrow middle-man transfers, listings review, and user safety.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Active Escrow */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Escrow</span>
            <RefreshCw className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-gray-900">{activeEscrowCount || 0}</div>
          <Link href="/admin/transactions" className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-flex items-center">
            Inspect pipeline &rarr;
          </Link>
        </div>

        {/* Pending Listings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Listings Review</span>
            <CheckSquare className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-gray-900">{pendingListingsCount || 0}</div>
          <Link href="/admin/listings" className="text-xs font-semibold text-indigo-600 hover:underline mt-2 inline-flex items-center">
            Review accounts &rarr;
          </Link>
        </div>

        {/* Pending KYC */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">KYC Verifications</span>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-gray-900">{pendingVerificationsCount || 0}</div>
          <Link href="/admin/verifications" className="text-xs font-semibold text-amber-600 hover:underline mt-2 inline-flex items-center">
            Inspect IDs &rarr;
          </Link>
        </div>

        {/* Disputes */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Open Disputes</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-black text-gray-900">{openDisputesCount || 0}</div>
          <Link href="/admin/disputes" className="text-xs font-semibold text-red-600 hover:underline mt-2 inline-flex items-center">
            Resolve tickets &rarr;
          </Link>
        </div>

        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Users</span>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-gray-900">{totalUsersCount || 0}</div>
          <span className="text-xs text-gray-400 mt-2">Registered Accounts</span>
        </div>
      </div>

      {/* Recent Escrow Pipeline Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Escrow Transactions</h2>
            <p className="text-xs text-gray-500 mt-0.5">Middle-man transfer deals requiring escrow verification</p>
          </div>
          <Link
            href="/admin/transactions"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center"
          >
            View all deals <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-6">Account</th>
                  <th className="py-3 px-6">Buyer</th>
                  <th className="py-3 px-6">Seller</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Escrow Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.map((tx: any) => {
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        <div className="truncate max-w-[200px]">{tx.listings?.title || 'Listing'}</div>
                        <span className="text-[10px] text-gray-400 font-normal">{tx.listings?.platform}</span>
                      </td>
                      <td className="py-4 px-6 font-medium">@{tx.buyer?.username || 'Buyer'}</td>
                      <td className="py-4 px-6 font-medium">@{tx.seller?.username || 'Seller'}</td>
                      <td className="py-4 px-6 font-black text-gray-900">${tx.agreed_price}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-blue-50 text-blue-700 border border-blue-100">
                          {tx.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/dashboard/transactions/${tx.id}`}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-1.5 px-3 rounded-lg transition"
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
          <div className="p-12 text-center text-gray-400 text-sm">
            No transactions initiated yet.
          </div>
        )}
      </div>
    </div>
  )
}
