import Link from 'next/link'
import { ShieldCheck, Mail, ArrowRight, Clock, CheckCircle2, Lock } from 'lucide-react'

export default function EscrowAgentPage() {
  return (
    <div className="flex-1 bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] flex flex-col p-6 sm:p-8 overflow-y-auto h-full">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4 border-b border-[#d2dde4] pb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-[#010b13]">Dealoura Escrow Officer Desk</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                Online
              </span>
            </div>
            <p className="text-xs text-[#526371] mt-0.5">Segregated Digital Asset Custody & Transfer Department</p>
          </div>
        </div>

        {/* 4-Step Escrow Protocol Box */}
        <div className="bg-[#ebf1f5] border border-[#d2dde4] rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#010b13]" />
            <h3 className="font-extrabold text-sm text-[#010b13]">The Dealoura Escrow Protocol</h3>
          </div>
          
          <ul className="space-y-3.5 text-xs text-[#526371]">
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2.5 text-[#010b13] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#010b13]">1. Buyer Funds Escrow:</strong> Money is deposited into Dealoura&apos;s segregated trust vault (via bank wire or crypto). The seller is notified once funds are secured.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2.5 text-[#010b13] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#010b13]">2. Seller Submits Credentials:</strong> The seller transfers access credentials or grants manager access to our official inspection address (<code className="bg-[#ffffff] px-1.5 py-0.5 rounded text-[#010b13] font-mono text-[11px] border border-[#d2dde4]">escrow@dealoura.com</code>).
              </span>
            </li>
            <li className="flex items-start">
              <Clock className="w-4 h-4 mr-2.5 text-[#010b13] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#010b13]">3. 7-Day Buyer Evaluation Period:</strong> The buyer is assigned manager access to inspect analytics, audience health, monetization status, and community strikes thoroughly.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2.5 text-[#010b13] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#010b13]">4. Primary Ownership & Net Payout:</strong> Once the 7-day cooldown concludes and the buyer confirms primary ownership, the seller&apos;s payout is immediately released.
              </span>
            </li>
          </ul>
        </div>

        {/* Support & Contact Card */}
        <div className="border border-[#d2dde4] rounded-2xl p-6 space-y-4 bg-[#ffffff]">
          <h3 className="font-black text-sm text-[#010b13]">Need Assistance With an Active Transaction?</h3>
          <p className="text-xs text-[#526371] leading-relaxed">
            For urgent escrow inquiries, credential validation, or dispute mediation, our escrow compliance desk is available 24/7.
          </p>
          <div className="flex items-center space-x-2.5 text-xs text-[#010b13] bg-[#ebf1f5] p-3.5 rounded-xl border border-[#d2dde4]">
            <Mail className="w-4 h-4 text-[#010b13] shrink-0" />
            <span className="font-bold">Official Escrow Desk:</span>
            <a href="mailto:escrow@dealoura.com" className="font-mono underline text-[#010b13]">
              escrow@dealoura.com
            </a>
          </div>
          <div className="pt-1">
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center text-xs font-bold text-[#010b13] hover:underline"
            >
              View Active Escrow Transactions <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
