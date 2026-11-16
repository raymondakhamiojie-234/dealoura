import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | Dealoura',
  description: 'Dealoura Privacy Policy: How we handle account data, credentials in escrow, and transaction details securely.'
}

export default function PrivacyPolicyPage() {
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
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection &amp; Confidentiality</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#010b13] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#526371] font-mono">
            Last Updated: November 2026
          </p>
          <p className="text-sm text-[#010b13]/80 leading-relaxed pt-2">
            Dealoura is committed to safeguarding the privacy and confidentiality of buyers, sellers, and community partners trading digital assets and social channels through our platform.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#d2dde4] shadow-xs space-y-8 text-sm text-[#010b13]/80 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">1. Information We Collect</h2>
            <p>
              When you use Dealoura, we collect only information necessary to ensure safe escrow transactions, verify account ownership, and process settlements:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#526371]">
              <li><strong>Account Profile Information:</strong> Email address, public username, and contact communication records.</li>
              <li><strong>Asset Credentials (Held in Escrow Only):</strong> Temporary login credentials, two-factor authentication tokens, and ownership transfer emails provided strictly for escrow verification and transfer.</li>
              <li><strong>Transaction &amp; Payout Records:</strong> Bank wire details, ACH information, or cryptocurrency wallet addresses needed to disburse completed escrow balances.</li>
              <li><strong>Identity Verification Data (KYC):</strong> Government-issued ID when sellers apply for the Verified Merchant status.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">2. How We Guard Escrow Credentials</h2>
            <p>
              Account passwords, recovery email keys, and 2FA credentials deposited by sellers are stored in an encrypted vault accessible exclusively by authorized Dealoura Escrow Officers during the active handover window. Credentials are never exposed publicly, never shared with third parties, and are permanently wiped from our systems once the 7-day buyer evaluation period concludes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">3. Third-Party Disclosures &amp; Banking Partners</h2>
            <p>
              We do not sell, rent, or trade your personal data. Data is shared exclusively with our licensed domestic payment processors and banking institutions for the explicit purpose of clearing buyer escrow deposits and disbursing irrevocable seller wire payouts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">4. Cookies &amp; Referral Tracking</h2>
            <p>
              We use functional session cookies to maintain your login status and 90-day attribution cookies to credit partner commissions via the Dealoura Affiliate Program. You can configure your browser to reject cookies, though certain marketplace authentication features may be impaired.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#010b13]">5. Your Rights &amp; Data Deletion</h2>
            <p>
              You have the right to request an export of your personal data or request deletion of your account and transaction history (subject to regulatory anti-money laundering transaction retention requirements).
            </p>
            <p className="pt-2 text-xs text-[#526371]">
              For privacy inquiries or deletion requests, contact our Data Privacy Officer at <a href="mailto:privacy@dealoura.com" className="text-[#010b13] underline font-medium">privacy@dealoura.com</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
