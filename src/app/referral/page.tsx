import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import Link from 'next/link'
import { 
  Share2, 
  ArrowRight, 
  Sparkles, 
  HelpCircle
} from 'lucide-react'
import { ReferralDashboardClient } from './ReferralDashboardClient'

export const metadata = {
  title: 'Affiliate & Referral Program — Earn 20% of Escrow Fees | Dealoura',
  description: 'Refer creators, buyers, and brokers to Dealoura and earn 20% commission on every escrow trade conducted through your referral link.',
}

export default async function ReferralPage() {
  const supabase = await createClient()
  let user = null
  let profile = null
  let wallet = null

  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
    if (user) {
      const [pRes, wRes] = await Promise.all([
        supabase.from('user_profiles').select('username').eq('id', user.id).single(),
        supabase.from('user_wallets').select('available_balance').eq('user_id', user.id).maybeSingle()
      ])
      profile = pRes.data
      wallet = wRes.data
    }
  } catch {
    user = null
  }

  const username = profile?.username || user?.id?.slice(0, 8) || 'user'
  
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') || 'https'
  const origin = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${protocol}://${host}` : 'https://dealoura.com')
  const referralLink = `${origin}/?ref=${username}`

  return (
    <div className="bg-[#ebf1f5] min-h-screen py-12 font-sans text-[#010b13]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d2dde4] text-[#010b13] text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-[#010b13]" />
            <span>Dealoura Partner &amp; Affiliate Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#010b13] tracking-tight leading-tight">
            Earn <span className="underline decoration-[#010b13]">20% Commission</span> on Every Escrow Fee.
          </h1>

          <p className="text-sm sm:text-base text-[#526371] max-w-2xl mx-auto leading-relaxed">
            Invite creators, buyers, and brokers to trade digital properties safely. You earn 20% of Dealoura&apos;s escrow fee every time someone buys or sells with your link.
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
          <div className="rounded-3xl bg-[#010b13] p-8 sm:p-12 text-[#ebf1f5] border border-[#0a1722] shadow-2xl text-center space-y-6 max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#071520] text-[#ebf1f5] flex items-center justify-center mx-auto border border-[#0f2436]">
              <Share2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                Get Your Unique Referral Link Today
              </h2>
              <p className="text-xs sm:text-sm text-[#ebf1f5]/70 max-w-lg mx-auto mt-2 leading-relaxed">
                Sign in or register an account to unlock your personalized affiliate link and begin earning automated commissions paid directly to your Dealoura Wallet.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register?redirect=/referral"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#ebf1f5] hover:bg-white text-[#010b13] font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Create Partner Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login?redirect=/referral"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#071520] hover:bg-[#0f2436] text-[#ebf1f5] font-bold text-xs rounded-xl border border-[#0f2436] transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* 3 Simple Steps */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#d2dde4] shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#010b13]">
              Workflow
            </span>
            <h3 className="text-2xl font-black text-[#010b13] mt-1">
              Start Earning in 3 Simple Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#ebf1f5] border border-[#d2dde4] space-y-3">
              <span className="w-8 h-8 rounded-xl bg-[#010b13] text-[#ebf1f5] font-black text-sm flex items-center justify-center">
                1
              </span>
              <h4 className="text-sm font-bold text-[#010b13]">Share Your Link</h4>
              <p className="text-xs text-[#526371] leading-relaxed">
                Share your personalized link on YouTube, Twitter/X, Telegram communities, or with fellow channel brokers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#ebf1f5] border border-[#d2dde4] space-y-3">
              <span className="w-8 h-8 rounded-xl bg-[#010b13] text-[#ebf1f5] font-black text-sm flex items-center justify-center">
                2
              </span>
              <h4 className="text-sm font-bold text-[#010b13]">They Complete Escrow</h4>
              <p className="text-xs text-[#526371] leading-relaxed">
                When your referral buys or sells any verified channel, the trade is safely locked and completed via Dealoura Escrow.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#ebf1f5] border border-[#d2dde4] space-y-3">
              <span className="w-8 h-8 rounded-xl bg-[#010b13] text-[#ebf1f5] font-black text-sm flex items-center justify-center">
                3
              </span>
              <h4 className="text-sm font-bold text-[#010b13]">Get Instant Wallet Payouts</h4>
              <p className="text-xs text-[#526371] leading-relaxed">
                20% of the escrow fee is automatically credited to your Dealoura balance. Withdraw to your bank or crypto anytime!
              </p>
            </div>
          </div>
        </div>

        {/* Commission Calculator Example */}
        <div className="bg-[#010b13] rounded-3xl p-8 sm:p-10 text-[#ebf1f5] border border-[#0a1722] space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#ebf1f5]/10 text-[#ebf1f5] border border-[#ebf1f5]/20">
                Earnings Potential
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Transparent High-Ticket Payouts
              </h3>
            </div>
            <div className="text-left md:text-right">
              <span className="text-xs text-[#ebf1f5]/60 block">Typical Channel Trade</span>
              <span className="text-2xl font-black text-white font-mono">$5,000 USD</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#071520] p-4 rounded-2xl border border-[#0f2436]">
              <span className="text-[11px] text-[#ebf1f5]/70 block font-medium">Dealoura 5% Escrow Fee</span>
              <span className="text-lg font-bold text-white font-mono">$250.00 USD</span>
            </div>
            <div className="bg-[#071520] p-4 rounded-2xl border border-[#0f2436]">
              <span className="text-[11px] text-[#ebf1f5]/70 block font-medium">Your 20% Affiliate Share</span>
              <span className="text-lg font-bold text-[#ebf1f5] font-mono">$50.00 USD</span>
            </div>
            <div className="bg-[#071520] p-4 rounded-2xl border border-[#0f2436]">
              <span className="text-[11px] text-[#ebf1f5]/70 block font-medium">Earnings on 10 Monthly Referrals</span>
              <span className="text-lg font-bold text-white font-mono">$500.00 / month</span>
            </div>
          </div>
        </div>

        {/* Affiliate FAQ */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="text-xl font-black text-[#010b13] text-center mb-6">
            Frequently Asked Questions
          </h3>

          <div className="bg-white p-5 rounded-2xl border border-[#d2dde4] text-xs space-y-1.5 shadow-xs">
            <h4 className="font-bold text-[#010b13]">How long do referral cookies last?</h4>
            <p className="text-[#526371] leading-relaxed">
              Referral cookies last 90 days. If someone clicks your link and registers within 90 days, their account is permanently linked to you as their referrer.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#d2dde4] text-xs space-y-1.5 shadow-xs">
            <h4 className="font-bold text-[#010b13]">How do I receive my commissions?</h4>
            <p className="text-[#526371] leading-relaxed">
              Commissions land directly in your Dealoura Internal Wallet available balance. You can withdraw your earnings anytime via Bank Wire, ACH, USDT, or USDC.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#d2dde4] text-xs space-y-1.5 shadow-xs">
            <h4 className="font-bold text-[#010b13]">Is there a limit on how much I can earn?</h4>
            <p className="text-[#526371] leading-relaxed">
              No limits. You earn 20% on every single completed escrow trade your referrals make.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
