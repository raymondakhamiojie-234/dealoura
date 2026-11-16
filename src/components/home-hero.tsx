'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Shield, 
  Layers,
  ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EscrowStepPreview {
  step: number
  title: string
  subtitle: string
  tag: string
  buyerStatus: string
  vaultStatus: string
  sellerStatus: string
}

const ESCROW_STEPS: EscrowStepPreview[] = [
  {
    step: 1,
    title: 'Buyer Deposits Into Escrow Vault',
    subtitle: 'Buyer agrees on price and transfers payment into Dealoura segregated escrow.',
    tag: 'FUNDS SECURED',
    buyerStatus: 'Funds Deposited ($1,500.00)',
    vaultStatus: 'Locked in FDIC-Insured Custody',
    sellerStatus: 'Notified: Payment 100% Confirmed'
  },
  {
    step: 2,
    title: 'Audit & Credential Verification',
    subtitle: 'Seller deposits account credentials into encrypted vault. Dealoura team verifies authenticity.',
    tag: 'AUDITING ASSET',
    buyerStatus: 'Evaluation Window Queued',
    vaultStatus: 'Analytics & 2FA Cleared by Escrow Officer',
    sellerStatus: 'Credentials Vaulted & Protected'
  },
  {
    step: 3,
    title: 'Supervised 2FA Handover',
    subtitle: 'Buyer receives primary ownership access, binds their security keys, and begins 7-day inspection.',
    tag: 'HANDOVER ACTIVE',
    buyerStatus: 'Primary Email & 2FA Bound to Buyer',
    vaultStatus: '7-Day Inspection Window Running',
    sellerStatus: 'Awaiting Final Auto-Release'
  },
  {
    step: 4,
    title: 'Irrevocable Payout Release',
    subtitle: 'Buyer approves transfer or inspection window concludes. Net payout is instantly wired to seller.',
    tag: 'DEAL COMPLETED',
    buyerStatus: 'Full Ownership Confirmed',
    vaultStatus: 'Escrow Successfully Settled',
    sellerStatus: 'Funds Disbursed ($1,425.00 Net)'
  }
]

export function HomeHero() {
  const [activeStep, setActiveStep] = useState(0)
  const currentStep = ESCROW_STEPS[activeStep]

  return (
    <section className="relative overflow-hidden bg-[#101828] text-white pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#18263B]">
      {/* Subtle radial glow & grid texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(22,163,106,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#18263B_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Supporting Text, CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Live Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18263B] border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A36A]" />
              </span>
              <span>Audited Escrow Protocol</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-normal">Peer-to-Peer Marketplace</span>
            </div>

            {/* Exact Required Hero Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white mb-6">
              Buy and Sell Digital Assets{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                With Confidence.
              </span>
            </h1>

            {/* Concise Supporting Text explaining Dealoura & Escrow */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mb-8">
              Dealoura is the secure peer-to-peer marketplace for buying and selling YouTube channels, TikTok accounts, Instagram brands, Facebook pages, X accounts, and Discord communities. Every transaction is guarded by transparent escrow—funds and credentials are never released until ownership is 100% verified.
            </p>

            {/* Two Prominent Required Actions: Browse Marketplace & Start Selling */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#16A36A] hover:bg-[#138a59] text-white font-extrabold text-sm shadow-lg shadow-emerald-900/30 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#18263B] hover:bg-[#223552] text-slate-200 font-extrabold text-sm border border-slate-700/80 hover:border-slate-600 transition-all duration-200"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Start Selling</span>
              </Link>
            </div>

            {/* 3 Core Trust Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 w-full text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                <span>Escrow on Every Order</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                <span>Supervised 2FA Handover</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                <span>Zero Chargeback Risk</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Escrow Protocol Terminal */}
          <div className="lg:col-span-5 w-full">
            <div className="relative">
              
              {/* Outer decorative glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-blue-500/10 to-amber-500/20 blur-xl opacity-75" />

              {/* Main Escrow Terminal Card */}
              <div className="relative rounded-2xl bg-[#18263B]/95 border border-slate-700/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-[#16A36A] animate-pulse" />
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                      DEALOURA ESCROW SYSTEM
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {currentStep.tag}
                  </span>
                </div>

                {/* 4 Step Selector Buttons */}
                <div className="grid grid-cols-4 gap-1.5 mb-5">
                  {ESCROW_STEPS.map((step, idx) => (
                    <button
                      key={step.step}
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      className={`text-[11px] font-bold py-2 px-1 rounded-lg text-center transition-all duration-200 ${
                        activeStep === idx
                          ? 'bg-[#16A36A] text-white shadow-sm'
                          : 'bg-[#101828] text-slate-400 hover:text-slate-200 hover:bg-[#101828]/80'
                      }`}
                    >
                      Step 0{step.step}
                    </button>
                  ))}
                </div>

                {/* Animated Step Details */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.step}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Step Title & Explanation */}
                    <div className="bg-[#101828]/80 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          STAGE 0{currentStep.step} / 04
                        </span>
                        <span className="text-xs font-bold text-slate-300">Escrow Security</span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {currentStep.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {currentStep.subtitle}
                      </p>
                    </div>

                    {/* Transaction Status Ledger */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#101828]/60 border border-slate-800">
                        <span className="text-slate-400 font-medium">Buyer Status:</span>
                        <span className="font-semibold text-emerald-400">{currentStep.buyerStatus}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#101828]/60 border border-slate-800">
                        <span className="text-slate-400 font-medium">Dealoura Vault:</span>
                        <span className="font-mono text-slate-200">{currentStep.vaultStatus}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#101828]/60 border border-slate-800">
                        <span className="text-slate-400 font-medium">Seller Status:</span>
                        <span className="font-semibold text-amber-300">{currentStep.sellerStatus}</span>
                      </div>
                    </div>

                    {/* Action link inside terminal */}
                    <div className="pt-2">
                      <Link
                        href="/how-it-works"
                        className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/40 transition"
                      >
                        <span>Learn How Dealoura Escrow Works</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
