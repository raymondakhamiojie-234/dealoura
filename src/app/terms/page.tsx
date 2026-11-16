import Link from 'next/link'
import { ShieldCheck, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service & Escrow Agreement | Dealoura',
  description: 'Dealoura Terms of Service: Rules governing our peer-to-peer marketplace, 5% escrow fee schedule, 7-day buyer evaluation period, and dispute arbitration.'
}

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#ebf1f5] min-h-screen py-12 font-sans text-[#010b13]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526371] hover:text-[#010b13] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 border border-[#d2dde4] shadow-xs space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebf1f5] text-[#010b13] text-xs font-bold border border-[#d2dde4]">
            <FileText className="w-3.5 h-3.5" />
            <span>Marketplace &amp; Escrow Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#010b13] tracking-tight">
            Terms of Service &amp; Escrow Agreement
          </h1>
          <p className="text-xs text-[#526371] font-mono">
            Effective Date: November 2026
          </p>
          <p className="text-sm text-[#010b13]/80 leading-relaxed pt-2">
            These Terms govern your use of Dealoura and all transactions conducted via the Dealoura Escrow Protocol. By creating an account or placing an order, you agree to these legally binding terms.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#d2dde4] shadow-xs space-y-8 text-sm text-[#010b13]/80 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">1. Marketplace Role &amp; Escrow Middleman Capacity</h2>
            <p>
              Dealoura operates as an independent, neutral middleman platform. We facilitate peer-to-peer transfers of supported digital properties (including YouTube channels, TikTok accounts, Instagram brands, Facebook pages, X accounts, and Discord servers). Dealoura acts as an escrow custodian: we hold buyer funds in a segregated trust account and hold seller credentials in encrypted storage until all transaction conditions are satisfied.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">2. The 4-Step Escrow Handover Protocol</h2>
            <p>
              Every transaction conducted on Dealoura adheres to our strict 4-step escrow workflow:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-[#526371]">
              <li><strong>Vault Deposit:</strong> The buyer deposits 100% of the agreed purchase price into the Dealoura Vault. The seller is notified that funds are secured.</li>
              <li><strong>Agent Audit:</strong> The seller submits account credentials to the Dealoura Escrow Desk. Our agents verify account standing, strike-free history, organic engagement, and monetization compliance.</li>
              <li><strong>Supervised Transfer:</strong> Primary ownership is transferred to the buyer. Former recovery phone numbers and emails are removed under agent supervision. The buyer binds their own two-factor authentication.</li>
              <li><strong>Evaluation &amp; Payout:</strong> The buyer is granted a 7-day evaluation window to verify channel performance. Upon confirmation or window completion, escrow funds are disbursed to the seller.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">3. Fee Schedule (Transparent 5% Escrow Fee)</h2>
            <p>
              Listing an account on Dealoura is <strong>100% free</strong>. Upon successful completion of an escrow transaction, a standard flat fee of <strong>5%</strong> is deducted from the gross purchase price to cover escrow agent supervision, credential auditing, and irrevocable bank transfer processing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">4. Seller Warranties &amp; Anti-Pullback Guarantee</h2>
            <p>
              Sellers represent and warrant that they are the legal, sole owner of the digital property and that the account is free of fraudulent bot followers, undisclosed copyright strikes, or active platform bans.
            </p>
            <p className="bg-red-50 p-4 rounded-xl border border-red-200 text-xs text-red-800 leading-relaxed font-medium">
              <strong>Strict Warning Against Account Pullbacks:</strong> Any attempt to reclaim, reset, or pull back an account after receiving payout constitutes fraud. Dealoura cooperates fully with domestic law enforcement and initiates immediate civil recovery actions against infringing sellers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">5. 7-Day Buyer Evaluation Window &amp; Dispute Policy</h2>
            <p>
              Buyers receive up to 7 calendar days to inspect the acquired channel analytics, strike records, and audience health. If an undisclosed defect or material misrepresentation is detected, the buyer must raise a formal dispute via the Dealoura Escrow Dashboard before the 7-day period expires.
            </p>
            <p>
              If a dispute is raised, funds remain securely frozen in escrow while a Senior Escrow Arbitrator investigates. In the event of confirmed seller misrepresentation, the buyer receives a 100% refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">6. Affiliate Program Terms</h2>
            <p>
              Affiliate partners earn a 20% commission share of Dealoura&apos;s escrow fee on completed trades generated by their tracked referral links. Referral tracking cookies persist for 90 days. Self-referrals or fraudulent click schemes result in immediate termination and forfeiture of unpaid balances.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">7. Contact &amp; Legal Notices</h2>
            <p>
              For legal inquiries, dispute arbitration, or escrow documentation, contact our compliance team at <a href="mailto:legal@dealoura.com" className="text-[#010b13] underline font-medium">legal@dealoura.com</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
