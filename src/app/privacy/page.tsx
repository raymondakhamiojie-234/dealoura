import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Dealoura Privacy Policy: How we handle account data, credentials in escrow, and transaction details securely.'
}

export default function PrivacyPolicyPage() {
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
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection &amp; Confidentiality</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#101828] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#667085] font-mono">
            Last Updated: November 2026
          </p>
          <p className="text-sm text-[#344054] leading-relaxed pt-2">
            Dealoura is committed to safeguarding the privacy and confidentiality of buyers, sellers, and community partners trading digital assets and social channels through our platform.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#E4E7EC] shadow-xs space-y-8 text-sm text-[#344054] leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">1. Information We Collect</h2>
            <p>
              When you use Dealoura, we collect information required to facilitate secure digital asset transfers, verify account legitimacy, and maintain escrow integrity:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#475467]">
              <li><strong>Account Information:</strong> Name, username, email address, and authentication credentials.</li>
              <li><strong>Asset Listings Data:</strong> Public channel statistics, handles, screenshot proof, niche category, and follower metrics provided by sellers.</li>
              <li><strong>Escrow Handover Details:</strong> Temporary account credentials, recovery verification records, and transaction transfer receipts submitted to the secure escrow desk.</li>
              <li><strong>Payment &amp; Banking Details:</strong> Bank transfer details, transaction reference numbers, and cryptocurrency wallet addresses for payout distribution.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">2. Security of Escrow Account Credentials</h2>
            <p>
              Digital asset credentials (passwords, manager invites, verification codes) submitted during the escrow process are treated as strictly confidential:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#475467]">
              <li>Credentials are only accessible by authorized escrow personnel during the supervised handover period.</li>
              <li>Once primary ownership has transferred and the buyer completes their inspection period, sensitive temporary passwords and access tokens are expunged from active vault records.</li>
              <li>We will never disclose or sell asset credentials to any unverified third party.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">3. How We Use Information</h2>
            <p>
              Your data is used strictly for marketplace operation and transaction security:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#475467]">
              <li>Facilitating buyer-seller communication, escrow holding, and asset inspection.</li>
              <li>Preventing unauthorized chargebacks, account theft, and fraudulent listings.</li>
              <li>Calculating and processing seller payouts and affiliate commissions.</li>
              <li>Sending transactional notifications regarding order status, inspection windows, and dispute resolutions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">4. Cookies and Tracking</h2>
            <p>
              Dealoura uses essential functional cookies to keep you signed in securely and 90-day referral cookies to accurately attribute partner affiliate commissions. We do not sell tracking profiles to advertising brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#101828]">5. Your Rights and Inquiries</h2>
            <p>
              You have the right to request access to your personal data, rectify inaccuracies, or request account closure. For data requests or privacy questions, contact our security desk at <a href="mailto:support@dealoura.com" className="text-blue-600 font-semibold hover:underline">support@dealoura.com</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
