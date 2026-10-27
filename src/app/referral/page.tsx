import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { 
  Users, 
  DollarSign, 
  Share2, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  HelpCircle,
  Coins,
  Wallet,
  Zap
} from 'lucide-react'
import { ReferralDashboardClient } from './ReferralDashboardClient'

export const metadata = {
  title: 'Affiliate & Referral Program — Earn 20% on Escrow Fees',
  description: 'Refer creators, buyers, and brokers to Dealoura and earn 20% commission on every escrow trade conducted through your link.'
}

export default async function ReferralPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let wallet = null

  if (user) {
    const [pRes, wRes] = await Promise.all([
      supabase.from('user_profiles').select('username').eq('id', user.id).single(),
      supabase.from('user_wallets').select('available_balance').eq('user_id', user.id).maybeSingle()
    ])
    profile = pRes.data
    wallet = wRes.data
  }

  const username = profile?.username || user?.id?.slice(0, 8) || 'user'
  const referralLink = `https://dealoura.vercel.app/?ref=${username}`

  return (
    <div className="bg-slate-50 min-h-screen py-12 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Dealoura Partner &amp; Affiliate Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Earn <span className="text-blue-600">20% Lifetime Commission</span> on Every Escrow Trade.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Invite creators, buyers, and brokers to trade social channels safely. You earn 20% of Dealoura&apos;s escrow fee every time someone buys or sells with your link.
          </p>
        </div>

        {/* User Referral Dashboard (if authenticated) */}
        {user ? (
          <ReferralDashboardClient
            username={username}
            referralLink={referralLink}
            walletBalance={Number(wallet?.available_balance || 0)}
          />
        ) : (
          /* Public Join Card for Logged-Out Users */
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 sm:p-12 text-white border border-slate-800 shadow-2xl text-center space-y-6 max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-400/30">
              <Share2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                Get Your Unique Referral Link Today
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                Sign in or register an account to unlock your personalized affiliate link and begin earning automated commissions paid directly to your Dealoura Wallet.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register?redirect=/referral"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Create Partner Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login?redirect=/referral"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* 3 Simple Steps */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600">
              How It Works
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              Start Earning in 3 Simple Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                1
              </span>
              <h4 className="text-sm font-bold text-slate-900">Share Your Link</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Share your personalized link on YouTube, Twitter/X, Telegram communities, or with fellow channel brokers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                2
              </span>
              <h4 className="text-sm font-bold text-slate-900">They Complete Escrow</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                When your referral buys or sells any verified channel, the trade is safely locked and inspected in the Dealoura Vault.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                3
              </span>
              <h4 className="text-sm font-bold text-slate-900">Get Instant Wallet Payouts</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                20% of the escrow fee is automatically credited to your Dealoura balance. Withdraw to your bank or crypto anytime!
              </p>
            </div>
          </div>
        </div>

        {/* Commission Calculator Example */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-8 sm:p-10 text-white border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Earnings Potential
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Transparent High-Ticket Payouts
              </h3>
            </div>
            <div className="text-left md:text-right">
              <span className="text-xs text-slate-400 block">Typical Channel Trade</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">$5,000 USD</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-400 block font-medium">Dealoura 5% Escrow Fee</span>
              <span className="text-lg font-bold text-white font-mono">$250.00 USD</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-400 block font-medium">Your 20% Affiliate Share</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">$50.00 USD</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-400 block font-medium">Earnings on 10 Monthly Referrals</span>
              <span className="text-lg font-bold text-blue-300 font-mono">$500.00 / month</span>
            </div>
          </div>
        </div>

        {/* Affiliate FAQ */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="text-xl font-black text-slate-900 text-center mb-6">
            Frequently Asked Questions
          </h3>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900">How long do referral cookies last?</h4>
            <p className="text-slate-600 leading-relaxed">
              Referral cookies last 90 days. If someone clicks your link and registers within 90 days, their account is permanently linked to you as their referrer.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900">How do I receive my commissions?</h4>
            <p className="text-slate-600 leading-relaxed">
              Commissions land directly in your Dealoura Internal Wallet available balance. You can withdraw your earnings anytime via Bank Wire, ACH, USDT (TRC-20), or USDC (Polygon).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900">Is there a limit on how much I can earn?</h4>
            <p className="text-slate-600 leading-relaxed">
              No limits. You earn on every single completed escrow trade your referrals make, forever.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
