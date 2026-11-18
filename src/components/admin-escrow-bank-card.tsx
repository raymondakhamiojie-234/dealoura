'use client'

import { useState } from 'react'
import { Building2, Eye, EyeOff, Copy, Check, Settings } from 'lucide-react'
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
    <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#d2dde4] shadow-xs space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#010b13] text-[#ebf1f5] rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#010b13]">Official Escrow Bank Vault Account</h3>
            <p className="text-xs text-[#526371]">Bank transfer details shown to buyers at escrow checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#ebf1f5] hover:bg-[#d2dde4] text-[#010b13] text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" /> Hide Banner Preview
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#010b13]" /> Preview Live Banner
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Bank Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-[#ebf1f5] rounded-xl border border-[#d2dde4]">
          <span className="text-[#526371] font-mono text-[10px] uppercase font-bold">Bank Name</span>
          <p className="font-bold text-[#010b13] mt-0.5 truncate">{ESCROW_BANK_CONFIG.bankName}</p>
        </div>

        <div className="p-3.5 bg-[#ebf1f5] rounded-xl border border-[#d2dde4]">
          <span className="text-[#526371] font-mono text-[10px] uppercase font-bold">Beneficiary / Account Name</span>
          <p className="font-bold text-[#010b13] mt-0.5 truncate">{ESCROW_BANK_CONFIG.accountName}</p>
        </div>

        <div className="p-3.5 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] flex items-center justify-between">
          <div>
            <span className="text-[#526371] font-mono text-[10px] uppercase font-bold">Account Number</span>
            <p className="font-mono font-bold text-[#010b13] mt-0.5">{ESCROW_BANK_CONFIG.accountNumber}</p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy('acc', ESCROW_BANK_CONFIG.accountNumber.replace(/\s+/g, ''))}
            className="p-1 hover:bg-[#ffffff] rounded-md text-[#526371] hover:text-[#010b13] transition cursor-pointer"
            title="Copy account number"
          >
            {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-[#010b13]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="p-3.5 bg-[#ebf1f5] rounded-xl border border-[#d2dde4]">
          <span className="text-[#526371] font-mono text-[10px] uppercase font-bold">Routing / SWIFT Code</span>
          <p className="font-mono font-bold text-[#010b13] mt-0.5">{ESCROW_BANK_CONFIG.routingOrSwiftCode}</p>
        </div>
      </div>

      {/* How to configure note */}
      <div className="p-3.5 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-[11px] text-[#526371] flex items-start gap-2.5">
        <Settings className="w-4 h-4 text-[#010b13] shrink-0 mt-0.5" />
        <div>
          <span>
            <strong className="text-[#010b13]">Configuration file:</strong> You can customize these bank credentials in{' '}
            <code className="bg-[#ffffff] px-1.5 py-0.5 rounded font-mono font-bold text-[#010b13] border border-[#d2dde4]">
              src/config/escrow-bank.ts
            </code>{' '}
            or set environment variables in{' '}
            <code className="bg-[#ffffff] px-1.5 py-0.5 rounded font-mono font-bold text-[#010b13] border border-[#d2dde4]">
              .env.local
            </code>.
          </span>
        </div>
      </div>

      {/* Interactive Preview Modal/Collapsible */}
      {showPreview && (
        <div className="pt-4 border-t border-[#d2dde4] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-[#526371]">
              Live Buyer View Simulation ($1,200 Channel)
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
              Preview Mode
            </span>
          </div>

          <div className="p-4 bg-[#ebf1f5] rounded-2xl border border-[#d2dde4]">
            <EscrowTransferBanner
              transactionId="DEMO-PREVIEW-001"
              agreedPrice={1200}
              escrowFee={60}
              isBuyer={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}
