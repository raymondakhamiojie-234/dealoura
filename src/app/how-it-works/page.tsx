import Link from 'next/link'
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Clock,
  Shield,
  Layers,
  ChevronRight,
  Eye,
  KeyRound
} from 'lucide-react'

export const metadata = {
  title: 'How It Works — The 5-Step Escrow Blueprint | Dealoura',
  description: 'Learn how Dealoura safeguards buyers and sellers of digital assets, social media channels, and online communities through our transparent 5-step escrow protocol.',
}

export default function HowItWorksPage() {
  return (
    <div className="bg-[#F7F9FC] min-h-screen text-[#101828] font-sans">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#101828] text-white pt-14 pb-20 border-b border-[#18263B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18263B] border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Institutional Escrow Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            How Dealoura Escrow Protects Every Transaction
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            In digital asset trades, sending credentials or payment directly to a stranger is fraught with risk. Dealoura acts as an audited, neutral middleman ensuring funds and credentials are secure every step of the way.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="px-7 py-3.5 rounded-xl bg-[#16A36A] hover:bg-[#138a59] text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition"
            >
              Browse Marketplace
            </Link>
            <Link
              href="/sell"
              className="px-7 py-3.5 rounded-xl bg-[#18263B] hover:bg-[#223552] text-slate-200 font-bold text-sm border border-slate-700 transition"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* 5-Step Step-by-Step Blueprint */}
      <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#16A36A]">
            The Step-by-Step Journey
          </span>
          <h2 className="text-3xl font-black text-[#101828]">
            From Initial Agreement to Final Ownership
          </h2>
        </div>

        <div className="space-y-8">
          
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-black text-xl flex items-center justify-center shrink-0 border border-blue-200">
              01
            </div>
            <div className="space-y-2 flex-grow">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Discovery &amp; Agreement
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#101828]">Browse, Inspect &amp; Make an Offer</h3>
              <p className="text-sm text-[#667085] leading-relaxed">
                The buyer discovers an asset on Dealoura, reviews audited audience analytics, and submits an escrow offer. The seller can accept, counter, or decline. When accepted, a formal escrow transaction room is created.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-xl flex items-center justify-center shrink-0 border border-indigo-200">
              02
            </div>
            <div className="space-y-2 flex-grow">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Payment Locking
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#101828]">Buyer Funds Segregated Escrow Vault</h3>
              <p className="text-sm text-[#667085] leading-relaxed">
                The buyer deposits the agreed transaction balance into Dealoura&apos;s escrow trust account. The seller is notified immediately with verified proof of deposit. The seller knows their payout is guaranteed before releasing any credentials.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16A36A] font-black text-xl flex items-center justify-center shrink-0 border border-emerald-200">
              03
            </div>
            <div className="space-y-2 flex-grow">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Credential Audit
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#101828]">Dealoura Officer Verification</h3>
              <p className="text-sm text-[#667085] leading-relaxed">
                The seller submits channel credentials to our encrypted vault. A trained Dealoura Escrow Officer audits the account to confirm subscriber counts, copyright strike status, primary ownership rights, and active monetization.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-black text-xl flex items-center justify-center shrink-0 border border-amber-200">
              04
            </div>
            <div className="space-y-2 flex-grow">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Supervised Handover
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#101828]">Secure Credential Transfer &amp; 7-Day Window</h3>
              <p className="text-sm text-[#667085] leading-relaxed">
                Our agent supervises the transfer of primary ownership to the buyer, removes the seller&apos;s phone/recovery emails, and assists the buyer with binding fresh 2FA keys. The buyer enters an official 7-day evaluation window to verify traffic and compliance.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-black text-xl flex items-center justify-center shrink-0 border border-teal-200">
              05
            </div>
            <div className="space-y-2 flex-grow">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-teal-100 text-teal-800">
                  Instant Settlement
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#101828]">Final Approval &amp; Irrevocable Payout</h3>
              <p className="text-sm text-[#667085] leading-relaxed">
                Once the buyer approves or the 7-day evaluation window completes with zero active disputes, escrow funds disburse automatically to the seller via domestic bank wire or ACH with 0% chargeback risk.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* Two Pillars: Buyer vs Seller Guarantees */}
      <section className="py-16 sm:py-20 bg-white border-y border-[#E4E7EC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828]">
              Protection for Both Sides of the Deal
            </h2>
            <p className="text-xs sm:text-sm text-[#667085]">
              Neither buyer nor seller has to rely on trust—the process protects you mathematically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Buyer Guarantees */}
            <div className="bg-[#F7F9FC] p-8 rounded-3xl border border-[#E4E7EC] space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                <ShieldCheck className="w-4 h-4" />
                <span>Buyer Guarantees</span>
              </div>
              <h3 className="text-xl font-black text-[#101828]">You Never Pay for a Phantom Channel</h3>
              <ul className="space-y-3 text-xs text-[#667085]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                  <span>Funds remain safely locked until you have received primary owner credentials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                  <span>7 days to inspect analytics, live viewer retention, and strikes before funds release.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                  <span>100% full refund if the seller fails to deliver authentic access.</span>
                </li>
              </ul>
            </div>

            {/* Seller Guarantees */}
            <div className="bg-[#F7F9FC] p-8 rounded-3xl border border-[#E4E7EC] space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#16A36A] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
                <span>Seller Guarantees</span>
              </div>
              <h3 className="text-xl font-black text-[#101828]">You Never Hand Over Without Verified Funds</h3>
              <ul className="space-y-3 text-xs text-[#667085]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                  <span>Buyer payment is 100% deposited and cleared before you give up access.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                  <span>Zero PayPal chargebacks, bank clawbacks, or fraudulent payment disputes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                  <span>Automatic escrow payout if the buyer fails to respond within 7 days.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 sm:py-20 bg-[#F7F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-black text-[#101828]">
            Ready to Experience Risk-Free Digital Asset Trading?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#16A36A] hover:bg-[#138a59] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/20 transition"
            >
              Browse Available Listings
            </Link>
            <Link
              href="/sell"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#101828] hover:bg-[#18263B] text-white font-bold text-sm rounded-xl transition"
            >
              List an Account for Free
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
