'use client'

import { useState } from 'react'
import { Building2, Eye, EyeOff, Copy, Check, ShieldCheck, Settings, ExternalLink } from 'lucide-react'
import { ESCROW_BANK_CONFIG } from '@/config/escrow-bank'
import { EscrowTransferBanner } from '@/components/escrow-transfer-banner'

export function AdminEscrowBankCard() {
  const [showPreview, setShowPreview] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = async (field: string, text: string) => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
      }
    } catch {
      // Fallback
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Official Escrow Bank Vault Account</h3>
            <p className="text-xs text-gray-500">Bank transfer details shown to buyers at escrow checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" /> Hide Banner Preview
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-600" /> Preview Live Banner
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Bank Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-gray-400 font-medium">Bank Name</span>
          <p className="font-bold text-gray-900 mt-0.5 truncate">{ESCROW_BANK_CONFIG.bankName}</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-gray-400 font-medium">Beneficiary / Account Name</span>
          <p className="font-bold text-gray-900 mt-0.5 truncate">{ESCROW_BANK_CONFIG.accountName}</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-gray-400 font-medium">Account Number</span>
            <p className="font-mono font-bold text-blue-600 mt-0.5">{ESCROW_BANK_CONFIG.accountNumber}</p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy('acc', ESCROW_BANK_CONFIG.accountNumber.replace(/\s+/g, ''))}
            className="p-1 hover:bg-white rounded text-gray-400 hover:text-gray-700 transition"
            title="Copy account number"
          >
            {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-gray-400 font-medium">Routing / SWIFT Code</span>
          <p className="font-mono font-bold text-gray-900 mt-0.5">{ESCROW_BANK_CONFIG.routingOrSwiftCode}</p>
        </div>
      </div>

      {/* How to configure note */}
      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-800 flex items-start gap-2">
        <Settings className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span>
            <strong>How to edit bank details:</strong> You can customize these details in{' '}
            <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-blue-900">
              src/config/escrow-bank.ts
            </code>{' '}
            or set environment variables in{' '}
            <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-blue-900">
              .env.local
            </code>{' '}
            (e.g.{' '}
            <code className="font-mono">NEXT_PUBLIC_ESCROW_ACCOUNT_NUMBER</code>).
          </span>
        </div>
      </div>

      {/* Live Interactive Preview */}
      {showPreview && (
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Interactive Buyer Banner Preview
            </span>
            <span className="text-[11px] text-gray-400">Sample Deal: $500.00 + $25.00 Escrow Fee</span>
          </div>

          <EscrowTransferBanner
            transactionId="sample-preview-deal-88"
            agreedPrice={500}
            escrowFee={25}
            isBuyer={true}
          />
        </div>
      )}
    </div>
  )
}
