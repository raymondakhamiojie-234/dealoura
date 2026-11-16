import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  UserCheck,
  HelpCircle,
  Clock
} from 'lucide-react'
import { SellerPayoutCalculator } from '@/components/seller-payout-calculator'

export const metadata = {
  title: 'Turn Your Digital Assets Into Value | Sell Channels Safely on Dealoura',
  description: 'Sell YouTube channels, TikTok accounts, Instagram brands, Facebook pages, X accounts, and Discord servers with 0% chargeback risk and 100% escrow protection.',
}

export default async function SellLandingPage() {
  const supabase = await createClient()
  let user = null
  let profile = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
    if (user) {
      const { data: p } = await supabase.from('user_profiles').select('username').eq('id', user.id).single()
      profile = p
    }
  } catch {
    user = null
  }

  return (
    <div className="min-h-screen bg-[#ebf1f5] text-[#010b13] font-sans">
      
      {/* Logged in notification banner */}
      {user && (
        <div className="bg-[#010b13] text-[#ebf1f5] py-3 px-4 text-center text-xs border-b border-[#0a1722]">
          <span>Signed in as <strong>@{profile?.username || 'seller'}</strong>. Ready to submit a new asset? </span>
          <Link
            href="/dashboard/seller/listings/new"
            className="text-white font-bold underline ml-1 hover:text-[#ebf1f5]"
          >
            Go to Listing Creator &rarr;
          </Link>
        </div>
      )}

      {/* 1. Hero Section: Exact Required Heading 'Turn Your Digital Assets Into Value.' */}
      <section className="relative overflow-hidden pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#d2dde4] bg-white">
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4] shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#010b13]" />
            <span>Dealoura Verified Seller Protocol • 0% Chargeback Risk</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#010b13] tracking-tight leading-tight">
            Turn Your Digital Assets{' '}
            <span className="bg-gradient-to-r from-[#010b13] via-[#0a1722] to-[#526371] bg-clip-text text-transparent">
              Into Value.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#526371] max-w-2xl mx-auto leading-relaxed">
            Sell Facebook pages, YouTube channels, TikTok accounts, Instagram brands, X handles, and Discord servers with guaranteed escrow protection. Free listing, zero risk of stolen credentials, and irrevocable payouts.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? '/dashboard/seller/listings/new' : '/register?redirect=/dashboard/seller/listings/new'}
              className="w-full sm:w-auto px-8 py-4 bg-[#010b13] hover:bg-[#0a1722] text-[#ebf1f5] font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#ebf1f5]" />
              <span>List Your First Digital Asset &rarr;</span>
            </Link>
            {!user && (
              <Link
                href="/login?redirect=/dashboard/seller/listings/new"
                className="w-full sm:w-auto px-6 py-4 bg-[#ebf1f5] hover:bg-[#d2dde4] text-[#010b13] font-bold text-sm rounded-xl border border-[#d2dde4] transition text-center"
              >
                Existing Seller Sign In
              </Link>
            )}
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#526371]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#010b13]" /> 100% Free to list
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#010b13]" /> Buyer funds escrow before handover
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#010b13]" /> Irrevocable bank wire / ACH payout
            </span>
          </div>

        </div>
      </section>

      {/* 2. Interactive Seller Payout Calculator */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#d2dde4] bg-[#ebf1f5]">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#526371]">
              Transparent Fee Structure
            </span>
            <h2 className="text-3xl font-black text-[#010b13]">
              No Hidden Charges. Flat 5% Escrow Fee.
            </h2>
            <p className="text-xs sm:text-sm text-[#526371]">
              Calculate exactly what you will take home before creating a listing.
            </p>
          </div>

          <SellerPayoutCalculator />
        </div>
      </section>

      {/* 3. Three-Step Selling Process */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-b border-[#d2dde4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#010b13] bg-[#ebf1f5] px-3 py-1 rounded-full border border-[#d2dde4]">
              3-Step Seller Protocol
            </span>
            <h2 className="text-3xl font-black text-[#010b13]">
              How Selling Works on Dealoura
            </h2>
            <p className="text-xs sm:text-sm text-[#526371]">
              A frictionless, guarded process designed specifically for creators and digital brokers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-[#ebf1f5] p-8 rounded-3xl border border-[#d2dde4] relative space-y-4">
              <div className="w-10 h-10 bg-[#010b13] text-[#ebf1f5] font-black text-lg rounded-2xl flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-[#010b13]">List Your Digital Asset</h3>
              <p className="text-xs text-[#526371] leading-relaxed">
                Choose your platform, enter your audience size, niche, monthly revenue (if monetized), and set your desired asking price. It is completely free to list.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#ebf1f5] p-8 rounded-3xl border border-[#d2dde4] relative space-y-4">
              <div className="w-10 h-10 bg-[#010b13] text-[#ebf1f5] font-black text-lg rounded-2xl flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-[#010b13]">Accept Escrow Offer</h3>
              <p className="text-xs text-[#526371] leading-relaxed">
                Receive offers from vetted buyers. Once accepted, the buyer must deposit 100% of the funds into Dealoura Vault before you are ever asked to touch credentials.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#ebf1f5] p-8 rounded-3xl border border-[#d2dde4] relative space-y-4">
              <div className="w-10 h-10 bg-[#010b13] text-[#ebf1f5] font-black text-lg rounded-2xl flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-[#010b13]">Supervised Handover &amp; Payout</h3>
              <p className="text-xs text-[#526371] leading-relaxed">
                Our escrow officers manage primary email transfer and 2FA credential purging. Upon the conclusion of the 7-day buyer evaluation window, net funds are wired directly to your bank account.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Seller Verification & 7-Day Evaluation Deep Dive */}
      <section className="py-16 sm:py-20 bg-[#ebf1f5] border-b border-[#d2dde4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-[#010b13]">
              Seller Verification &amp; Evaluation Rules
            </h2>
            <p className="text-xs sm:text-sm text-[#526371]">
              Everything you need to know about identity verification, handover guidelines, and payout timelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white p-7 rounded-3xl border border-[#d2dde4] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#010b13]">KYC &amp; Seller Verification</h3>
              <p className="text-xs text-[#526371] leading-relaxed">
                Sellers who verify their government-issued ID unlock the <strong>Verified Merchant</strong> trust badge on all their listings and public profiles. Verified merchants experience 3x higher offer conversion and expedited escrow disbursements.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#d2dde4] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#010b13]">The 7-Day Buyer Evaluation Period</h3>
              <p className="text-xs text-[#526371] leading-relaxed">
                Once primary ownership is transferred, the buyer has up to 7 calendar days to confirm that analytics and audience reach match the listing claims. Once confirmed (or after 7 days if no dispute is raised), funds are irrevocably released to your bank.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Frequently Asked Questions for Sellers */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#d2dde4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#010b13]">
              Seller Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#526371]">
              Direct answers about fees, credential protection, and payout guarantees.
            </p>
          </div>

          <div className="space-y-4">
            
            <div className="p-5 rounded-2xl bg-[#ebf1f5] border border-[#d2dde4] space-y-1.5">
              <h3 className="text-sm font-bold text-[#010b13] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#010b13]" />
                When do I provide account login credentials?
              </h3>
              <p className="text-xs text-[#526371] leading-relaxed pl-6">
                You never send credentials directly to the buyer. You only upload them to the Dealoura encrypted escrow portal after our escrow officer verifies that the buyer&apos;s payment has 100% cleared into our escrow account.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#ebf1f5] border border-[#d2dde4] space-y-1.5">
              <h3 className="text-sm font-bold text-[#010b13] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#010b13]" />
                How and when do I get paid?
              </h3>
              <p className="text-xs text-[#526371] leading-relaxed pl-6">
                Payouts are disbursed via direct domestic Wire, ACH, or Bank Transfer immediately upon buyer approval or upon conclusion of the 7-day evaluation window. Once sent, bank wires are irrevocable and cannot be charged back.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#ebf1f5] border border-[#d2dde4] space-y-1.5">
              <h3 className="text-sm font-bold text-[#010b13] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#010b13]" />
                What happens if a buyer doesn&apos;t confirm transfer?
              </h3>
              <p className="text-xs text-[#526371] leading-relaxed pl-6">
                If the buyer does not actively click &ldquo;Confirm Handover&rdquo; but raises no valid dispute within the 7-day evaluation period, the escrow contract auto-settles in your favor and your full payout is released automatically.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="py-16 sm:py-20 bg-[#ebf1f5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#010b13] text-[#ebf1f5] rounded-3xl p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden border border-[#0a1722]">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black">
                Ready to Sell Your Channel Safely?
              </h2>
              <p className="text-xs sm:text-sm text-[#ebf1f5]/80 leading-relaxed">
                Join thousands of creators and brokers who safely monetize and exit digital assets on Dealoura. Create your listing in under 2 minutes.
              </p>
              <div className="pt-2">
                <Link
                  href={user ? '/dashboard/seller/listings/new' : '/register?redirect=/dashboard/seller/listings/new'}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#ebf1f5] hover:bg-white text-[#010b13] font-black text-sm rounded-xl shadow-lg transition"
                >
                  <Sparkles className="w-4 h-4 text-[#010b13]" />
                  <span>List Your First Digital Asset Free &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
