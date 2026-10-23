import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck,
  Zap,
  HelpCircle,
  TrendingUp,
  Video,
  Camera,
  MessageCircle,
  Hash
} from 'lucide-react'

export default async function SellLandingPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string }>
}) {
  const params = searchParams ? await searchParams : {}
  const supabase = await createClient()
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
    user = null
  }

  // If already logged in, navigate directly to listing creation flow unless preview requested
  if (user && !params.preview) {
    redirect('/dashboard/seller/listings/new')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-gray-100 bg-white">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Dealoura Verified Escrow Seller Program
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Turn Your Social Media Accounts into <span className="text-blue-600">Guaranteed Cash</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sell Facebook pages & groups, YouTube channels, TikTok accounts, Instagram communities, Twitter/X profiles, and Discord servers with <strong className="text-gray-900">0% chargeback risk</strong>. Every transaction is secured by Dealoura Escrow.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard/seller/listings/new"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Create a Listing Now &rarr;
              </Link>
            ) : (
              <>
                <Link
                  href="/register?redirect=/dashboard/seller/listings/new"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Selling for Free &rarr;
                </Link>
                <Link
                  href="/login?redirect=/dashboard/seller/listings/new"
                  className="w-full sm:w-auto px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-sm rounded-xl border border-gray-200 transition text-center"
                >
                  Existing Seller Sign In
                </Link>
              </>
            )}
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free to list
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Escrow holds buyer funds first
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Irrevocable bank payout
            </span>
          </div>
        </div>
      </section>

      {/* 2. Supported Platforms Ribbon */}
      <section className="py-10 bg-[#F8FAFC] border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
            Supported Digital Assets & Communities
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-[#1877F2] rounded-xl">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Facebook</h4>
                <p className="text-[10px] text-gray-400">Pages & groups</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">YouTube</h4>
                <p className="text-[10px] text-gray-400">Monetized channels</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Instagram</h4>
                <p className="text-[10px] text-gray-400">Niche theme pages</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-900 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">TikTok</h4>
                <p className="text-[10px] text-gray-400">Creator rewards accounts</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Twitter / X</h4>
                <p className="text-[10px] text-gray-400">Verified handles</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Discord</h4>
                <p className="text-[10px] text-gray-400">Active gaming servers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Sell on Dealoura: 4 Core Pillars */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-gray-900">
            Why Top Creators & Brokers Choose Dealoura
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Traditional direct wires or PayPal result in chargebacks and stolen accounts. Dealoura removes 100% of the risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Guaranteed Vault Deposit</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Buyers must deposit 100% of the funds into our escrow vault before you are ever asked to hand over any credentials.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Official Middleman Agent</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              You hand over credentials to the Dealoura Escrow Agent, who verifies ownership and manages primary owner transfer cleanly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Irrevocable Payouts</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Receive your payout directly to your bank account via Wire, ACH, or Bank Transfer with zero chance of buyer dispute reversals.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">KYC Trust Badge</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Get verified with Government ID to unlock the Verified Seller badge on all your listings and public seller profile.
            </p>
          </div>
        </div>
      </section>

      {/* 4. 3-Step Selling Guide */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-3xl font-black text-gray-900">
              How Selling Works on Dealoura
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#F8FAFC] p-8 rounded-3xl border border-gray-100 relative space-y-4">
              <div className="w-10 h-10 bg-blue-600 text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-md shadow-blue-200">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900">List Your Channel</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Enter your platform, organic follower count, monthly revenue (if monetized), niche, and upload analytics screenshots. Set your asking price.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8FAFC] p-8 rounded-3xl border border-gray-100 relative space-y-4">
              <div className="w-10 h-10 bg-blue-600 text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-md shadow-blue-200">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900">Review & Accept Offers</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Receive instant offers from verified buyers. Accept the best price or counter. Once accepted, the buyer is directed to transfer funds to escrow.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8FAFC] p-8 rounded-3xl border border-gray-100 relative space-y-4">
              <div className="w-10 h-10 bg-blue-600 text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-md shadow-blue-200">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900">Hand Over & Get Paid</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Submit credentials to the Dealoura Escrow Agent. After the buyer's 7-day evaluation window concludes, your full payout is released to your bank!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Seller FAQ */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-gray-500">
            Everything you need to know about selling social accounts safely.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              When do I give up access to my account?
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed pl-6">
              You only hand over credentials AFTER the Dealoura Escrow Desk has verified and confirmed the buyer's payment into our segregated client trust account. You never send credentials directly to the buyer.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              What are the selling fees?
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed pl-6">
              Listing your account is 100% free. When a deal successfully completes, a standard low 5% escrow protection fee is transparently deducted from the payout to cover middleman inspection, payment reconciliation, and dispute guarantees.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              How do I receive my payout?
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed pl-6">
              Payouts are disbursed via direct Bank Wire, ACH, or Wise transfer immediately upon the conclusion of the 7-day buyer evaluation period.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black">
              Ready to Sell Your Channel Safely?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Join thousands of creators who safely monetize and exit digital assets on Dealoura. Create your listing in under 2 minutes.
            </p>
            <div className="pt-2">
              <Link
                href={user ? '/dashboard/seller/listings/new' : '/register?redirect=/dashboard/seller/listings/new'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition"
              >
                <Sparkles className="w-4 h-4" />
                List Your Account Now &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
