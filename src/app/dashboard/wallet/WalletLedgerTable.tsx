'use client'

import { useState } from 'react'
import { WalletTransaction, WithdrawalRequest } from '@/app/actions/wallet'
import { ArrowDownLeft, ArrowUpRight, Lock, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react'

interface WalletLedgerTableProps {
  transactions: WalletTransaction[]
  withdrawals: WithdrawalRequest[]
}

export function WalletLedgerTable({ transactions, withdrawals }: WalletLedgerTableProps) {
  const [filter, setFilter] = useState<'all' | 'deposits' | 'escrow' | 'withdrawals'>('all')

  const filteredTx = transactions.filter((tx) => {
    if (filter === 'deposits') return tx.type === 'deposit'
    if (filter === 'escrow') return tx.type === 'escrow_lock' || tx.type === 'escrow_release' || tx.type === 'escrow_refund'
    if (filter === 'withdrawals') return tx.type === 'withdrawal'
    return true
  })

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900">Wallet Activity &amp; Ledger</h3>
          <p className="text-xs text-slate-400">Audited history of your deposits, escrow holds, and disbursements</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('deposits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'deposits' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Deposits
          </button>
          <button
            type="button"
            onClick={() => setFilter('escrow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'escrow' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Escrow Holds
          </button>
          <button
            type="button"
            onClick={() => setFilter('withdrawals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'withdrawals' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              <th className="py-3 px-6">Transaction</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Method / Ref</th>
              <th className="py-3 px-6 text-right">Amount</th>
              <th className="py-3 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTx.length > 0 ? (
              filteredTx.map((tx) => {
                const isPositive = tx.type === 'deposit' || tx.type === 'escrow_release' || tx.type === 'escrow_refund'
                const Icon = tx.type === 'deposit' 
                  ? ArrowDownLeft 
                  : tx.type === 'withdrawal' 
                  ? ArrowUpRight 
                  : Lock

                const iconBg = tx.type === 'deposit'
                  ? 'bg-blue-50 text-blue-600'
                  : tx.type === 'escrow_release'
                  ? 'bg-emerald-50 text-emerald-600'
                  : tx.type === 'withdrawal'
                  ? 'bg-purple-50 text-purple-600'
                  : 'bg-amber-50 text-amber-600'

                const typeLabel = tx.type === 'deposit'
                  ? 'Deposit to Wallet'
                  : tx.type === 'escrow_release'
                  ? 'Escrow Payout Released'
                  : tx.type === 'escrow_lock'
                  ? 'Locked in Escrow'
                  : tx.type === 'withdrawal'
                  ? 'Withdrawal Payout'
                  : 'Escrow Refund'

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Type & Description */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{typeLabel}</span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {tx.description || tx.reference_id || 'Internal balance transfer'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap font-mono">
                      {new Date(tx.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Method & Ref */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-slate-700 font-medium block">
                        {tx.payment_method?.replace('_', ' ').toUpperCase() || 'WALLET'}
                      </span>
                      {tx.reference_id && (
                        <span className="text-[10px] font-mono text-slate-400">
                          #{tx.reference_id.slice(0, 10)}
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span className={`font-mono font-bold text-sm ${
                        isPositive ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {isPositive ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                        tx.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tx.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {tx.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {tx.status === 'pending' && <Clock className="w-3 h-3 text-amber-600 animate-pulse" />}
                        <span>{tx.status}</span>
                      </span>
                    </td>

                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <span>No wallet transactions recorded yet.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
