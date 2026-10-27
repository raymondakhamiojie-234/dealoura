'use client'

import { useState } from 'react'
import { Wallet, Lock, ArrowUpRight, ArrowDownLeft, ShieldCheck, Plus, Building2, Sparkles } from 'lucide-react'
import { DepositModal } from './DepositModal'
import { WithdrawModal } from './WithdrawModal'
import { UserWallet } from '@/app/actions/wallet'

interface WalletBalanceCardsProps {
  wallet: UserWallet
  currentUserId: string
}

export function WalletBalanceCards({ wallet, currentUserId }: WalletBalanceCardsProps) {
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Available Balance (Main) */}
        <div className="md:col-span-1 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 sm:p-7 text-white shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-500/30">
                Available Balance
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="mb-6">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                ${wallet.available_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400 font-mono ml-1.5">USD</span>
              <p className="text-xs text-slate-400 mt-1">Ready for 1-click escrow purchases or withdrawal</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Funds</span>
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              disabled={wallet.available_balance <= 0}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Card 2: Locked in Escrow */}
        <div className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                In Escrow Vault
              </span>
              <Lock className="w-4 h-4 text-amber-500" />
            </div>

            <div className="mb-4">
              <span className="text-3xl font-black font-mono tracking-tight text-slate-900">
                ${wallet.escrow_locked_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400 font-mono ml-1.5">USD</span>
              <p className="text-xs text-slate-500 mt-1">Secured in Dealoura Escrow during active verification</p>
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-[11px] text-amber-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Funds are released automatically upon buyer sign-off</span>
          </div>
        </div>

        {/* Card 3: Total Withdrawn */}
        <div className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Total Withdrawn
              </span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="mb-4">
              <span className="text-3xl font-black font-mono tracking-tight text-slate-900">
                ${wallet.total_withdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400 font-mono ml-1.5">USD</span>
              <p className="text-xs text-slate-500 mt-1">Disbursed to bank wires &amp; crypto addresses</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Irrevocable payouts with zero chargeback risk</span>
          </div>
        </div>

      </div>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        currentUserId={currentUserId}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        availableBalance={wallet.available_balance}
      />
    </>
  )
}
