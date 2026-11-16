import Link from 'next/link'
import { ShieldCheck, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service & Escrow Agreement',
  description: 'Dealoura Terms of Service: Escrow rules, 7-day evaluation period, seller payout terms, and dispute procedures.'
}

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#F7F9FC] min-h-screen py-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#101828] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl p-8 border border-[#E4E7EC] shadow-xs space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#16A36A] text-xs font-bold border border-emerald-200">
            <FileText className="w-3.5 h-3.5" />
            <span>Marketplace &amp; Escrow Rules</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#101828] tracking-tight">
            Terms of Service &amp; Escrow Agreement
          </h1>
          <p className="text-xs text-[#667085] font-mono">
            Effective Date: November 2026
          </p>
          <p className="text-sm text-[#344054] leading-relaxed pt-2">
            These terms govern your use of the Dealoura platform, escrow services, account verification protocols, and dispute settlement mechanisms.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#E4E7EC] shadow-xs space-y-8 text-sm text-[#344054] leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">1. Digital Asset Marketplace Role</h2>
            <p>
              Dealoura acts as an independent, impartial escrow middleman connecting buyers and sellers of digital properties (including YouTube channels, TikTok accounts, Instagram pages, X handles, and Discord servers). Dealoura holds transaction funds in escrow custody and inspects credential handover to prevent unauthorized takeovers or fraud.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">2. Escrow Process &amp; Milestone Rules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[#101828] block mb-1">Step 1: Escrow Deposit</span>
                <p className="text-xs text-[#667085]">Buyer places 100% of the agreed funds into Dealoura Escrow via wallet balance, crypto, or bank wire before seller sends credentials.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[#101828] block mb-1">Step 2: Credential Verification</span>
                <p className="text-xs text-[#667085]">Seller submits primary credentials into the secure vault. Dealoura Escrow agents verify asset authenticity and clean status.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[#101828] block mb-1">Step 3: Supervised Handover</span>
                <p className="text-xs text-[#667085]">Ownership transfer (email change, 2FA update, manager rights) is supervised. Buyer is designated primary owner.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[#101828] block mb-1">Step 4: 7-Day Buyer Evaluation</span>
                <p className="text-xs text-[#667085]">Buyer inspects account analytics, monetization health, and security during the inspection window before release.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">3. Seller Fee Schedule</h2>
            <p>
              Listing digital assets on Dealoura is <strong>100% free</strong>. Upon successful completion of an escrow transaction, a standard <strong>5% escrow protection fee</strong> is deducted from the gross purchase amount to cover middleman supervision, vault custody, and dispute underwriting. The remaining 95% net payout is automatically released to the seller&apos;s wallet balance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">4. Seller Warranties &amp; Prohibited Conduct</h2>
            <p>Sellers explicitly represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#475467]">
              <li>They are the sole lawful owner or authorized broker of the channel or asset.</li>
              <li>The asset is free of undisclosed strikes, pending suspensions, or active ownership claims.</li>
              <li>They will not attempt to recover, pull back, or reset credentials after escrow release. Account recovery attempts post-sale are deemed criminal fraud and result in immediate ban, reporting, and forfeiture of funds.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">5. Dispute Resolution &amp; Refunds</h2>
            <p>
              If an asset does not match the seller&apos;s listing (e.g. undisclosed copyright strikes, demonetization, or inaccurate audience count), the buyer may raise a dispute during the 7-day evaluation window. Our dispute team investigates evidence provided by both parties. If a breach is verified, the escrow deposit is refunded to the buyer and the asset returned to the seller.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">6. Affiliate Program Terms</h2>
            <p>
              Affiliate partners receive 20% of Dealoura&apos;s 5% escrow fee on eligible transactions referred through their link. Self-referrals, spam, and deceptive marketing are strictly prohibited and subject to account forfeiture.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
