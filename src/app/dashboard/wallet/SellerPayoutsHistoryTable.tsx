'use client'

import { useState } from 'react'
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Coins,
  Building2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface SellerPayoutItem {
  id: string
  agreed_price: number
  escrow_fee?: number | null
  status: string
  seller_payout_method?: string | null
  seller_payout_details?: any
  payout_status?: string | null
  payout_tx_hash?: string | null
  payout_sent_at?: string | null
  created_at: string
  listings?: any
  buyer?: any
}

export function SellerPayoutsHistoryTable({ payouts }: { payouts: SellerPayoutItem[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="bg-[#ffffff] rounded-2xl border border-[#d2dde4] shadow-xs overflow-hidden">
      <div className="p-6 border-b border-[#d2dde4] flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-[#010b13]">Direct Escrow Payouts &amp; Settlements</h3>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
              {payouts.length} Deals
            </span>
          </div>
          <p className="text-xs text-[#526371] mt-0.5">
            Audit history of all net proceeds disbursed to your verified Crypto USDT address or Bank Wire.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#526371]">
          <ShieldCheck className="w-4 h-4 text-[#010b13]" />
          <span>Segregated Escrow Banking</span>
        </div>
      </div>

      {payouts && payouts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#ebf1f5]/70 border-b border-[#d2dde4] text-[#526371] font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Deal / Asset</th>
                <th className="py-3 px-4">Gross Sale</th>
                <th className="py-3 px-4">Fee (5%)</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Settlement Destination</th>
                <th className="py-3 px-4">Disbursement Status</th>
                <th className="py-3 px-4">Reference / TxHash</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d2dde4]">
              {payouts.map((tx) => {
                const listing = Array.isArray(tx.listings) ? tx.listings[0] : tx.listings
                const escrowFee = tx.escrow_fee || Math.round(tx.agreed_price * 0.05 * 100) / 100
                const netAmount = Math.max(0, tx.agreed_price - escrowFee)
                const isDisbursed = tx.payout_status === 'completed'
                const isPending = tx.payout_status === 'pending'
                const method = tx.seller_payout_method
                const details = tx.seller_payout_details || {}

                return (
                  <tr key={tx.id} className="hover:bg-[#ebf1f5]/30 transition">
                    {/* Deal / Asset */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                          {listing?.platform || 'Asset'}
                        </span>
                        <strong className="block text-xs font-bold text-[#010b13] mt-1 max-w-[180px] truncate">
                          {listing?.title || 'Account Contract'}
                        </strong>
                        <span className="text-[10px] text-[#526371] font-mono">
                          Deal #{tx.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>

                    {/* Gross Sale */}
                    <td className="py-4 px-4 font-mono font-bold text-[#010b13]">
                      ${tx.agreed_price}
                    </td>

                    {/* Fee */}
                    <td className="py-4 px-4 font-mono text-[#526371]">
                      -${escrowFee}
                    </td>

                    {/* Net Payout */}
                    <td className="py-4 px-4 font-mono font-black text-emerald-700 text-sm">
                      ${netAmount}
                    </td>

                    {/* Settlement Destination */}
                    <td className="py-4 px-4">
                      {method === 'crypto_usdt' ? (
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="text-[11px]">
                            <span className="font-bold text-[#010b13] block">
                              USDT ({details.network || 'TRC20'})
                            </span>
                            <span className="font-mono text-[10px] text-[#526371] truncate max-w-[130px] block">
                              {details.walletAddress ? `${details.walletAddress.slice(0, 6)}...${details.walletAddress.slice(-4)}` : 'Registered'}
                            </span>
                          </div>
                        </div>
                      ) : method === 'bank_wire' ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#010b13] shrink-0" />
                          <div className="text-[11px]">
                            <span className="font-bold text-[#010b13] block">
                              {details.bankName || 'Bank Wire'}
                            </span>
                            <span className="font-mono text-[10px] text-[#526371] truncate max-w-[130px] block">
                              {details.accountNumber || details.iban ? `****${(details.accountNumber || details.iban).slice(-4)}` : 'Direct Wire'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#526371] italic">Not submitted yet</span>
                      )}
                    </td>

                    {/* Disbursement Status */}
                    <td className="py-4 px-4">
                      {isDisbursed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Disbursed
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3 h-3" />
                          In Queue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#ebf1f5] text-[#526371] border border-[#d2dde4]">
                          Holding
                        </span>
                      )}
                    </td>

                    {/* TxHash / Reference */}
                    <td className="py-4 px-4">
                      {tx.payout_tx_hash ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-[#010b13] truncate max-w-[120px]">
                            {tx.payout_tx_hash}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.payout_tx_hash || '', tx.id)}
                            className="p-1 rounded hover:bg-[#ebf1f5] text-[#526371] hover:text-[#010b13] transition cursor-pointer"
                            title="Copy TxHash / Ref"
                          >
                            {copiedId === tx.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#526371]">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/dashboard/transactions/${tx.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#010b13] hover:underline"
                      >
                        <span>Deal Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-[#526371] space-y-2">
          <DollarSign className="w-8 h-8 text-[#010b13] mx-auto" />
          <p className="font-bold text-[#010b13]">No Seller Settlements Yet</p>
          <p>When you complete account sales on Dealoura, your direct settlement payouts will be audited and recorded here.</p>
        </div>
      )}
    </div>
  )
}
