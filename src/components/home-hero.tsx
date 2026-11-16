'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
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
    <section className="relative overflow-hidden bg-[#010b13] text-[#ebf1f5] pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#0a1722]">
      {/* Background subtle radial texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(235,241,245,0.08),rgba(1,11,19,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#0f2436_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Supporting Text, CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Live Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1722] border border-[#d2dde4]/30 text-[#ebf1f5] text-xs font-semibold mb-6 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ebf1f5] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ebf1f5]" />
              </span>
              <span>Audited Escrow Protocol</span>
              <span className="text-[#526371]">•</span>
              <span className="text-[#ebf1f5]/80 font-normal">Peer-to-Peer Marketplace</span>
            </div>

            {/* Exact Required Hero Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white mb-6">
              Buy and Sell Digital Assets{' '}
              <span className="bg-gradient-to-r from-[#ebf1f5] via-white to-[#d2dde4] bg-clip-text text-transparent">
                With Confidence.
              </span>
            </h1>

            {/* Concise Supporting Text explaining Dealoura & Escrow */}
            <p className="text-base sm:text-lg text-[#ebf1f5]/80 font-normal leading-relaxed max-w-2xl mb-8">
              Dealoura is the secure peer-to-peer marketplace for buying and selling YouTube channels, TikTok accounts, Instagram brands, Facebook pages, X accounts, and Discord communities. Every transaction is guarded by transparent escrow—funds and credentials are never released until ownership is 100% verified.
            </p>

            {/* Two Prominent Actions: Browse Marketplace & Start Selling */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#ebf1f5] hover:bg-white text-[#010b13] font-black text-sm shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0a1722] hover:bg-[#122434] text-[#ebf1f5] font-extrabold text-sm border border-[#d2dde4]/30 hover:border-[#ebf1f5]/60 transition-all duration-200"
              >
                <Lock className="w-4 h-4 text-[#ebf1f5]" />
                <span>Start Selling</span>
              </Link>
            </div>

            {/* 3 Core Trust Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#0a1722] w-full text-xs text-[#ebf1f5]/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ebf1f5] shrink-0" />
                <span>Escrow on Every Order</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ebf1f5] shrink-0" />
                <span>Supervised 2FA Handover</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ebf1f5] shrink-0" />
                <span>Zero Chargeback Risk</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Escrow Protocol Terminal */}
          <div className="lg:col-span-5 w-full">
            <div className="relative">
              
              {/* Outer decorative glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#ebf1f5]/15 via-white/5 to-[#ebf1f5]/15 blur-xl opacity-75" />

              {/* Main Escrow Terminal Card */}
              <div className="relative rounded-2xl bg-[#071520] border border-[#0f2436] p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#0f2436]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-[#ebf1f5] animate-pulse" />
                    <span className="text-xs font-mono font-bold text-[#ebf1f5] uppercase tracking-wider">
                      DEALOURA ESCROW SYSTEM
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ebf1f5]/10 text-[#ebf1f5] border border-[#ebf1f5]/20 font-bold">
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
                          ? 'bg-[#ebf1f5] text-[#010b13] shadow-sm'
                          : 'bg-[#010b13] text-[#ebf1f5]/60 hover:text-[#ebf1f5] hover:bg-[#010b13]/80'
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
                    <div className="bg-[#010b13]/80 p-4 rounded-xl border border-[#0f2436]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#ebf1f5]/10 text-[#ebf1f5] border border-[#ebf1f5]/20">
                          STAGE 0{currentStep.step} / 04
                        </span>
                        <span className="text-xs font-bold text-[#ebf1f5]/70">Escrow Security</span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {currentStep.title}
                      </h3>
                      <p className="text-xs text-[#ebf1f5]/70 mt-1 leading-relaxed">
                        {currentStep.subtitle}
                      </p>
                    </div>

                    {/* Transaction Status Ledger */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#010b13]/60 border border-[#0f2436]">
                        <span className="text-[#ebf1f5]/60 font-medium">Buyer Status:</span>
                        <span className="font-semibold text-white">{currentStep.buyerStatus}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#010b13]/60 border border-[#0f2436]">
                        <span className="text-[#ebf1f5]/60 font-medium">Dealoura Vault:</span>
                        <span className="font-mono text-[#ebf1f5]">{currentStep.vaultStatus}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#010b13]/60 border border-[#0f2436]">
                        <span className="text-[#ebf1f5]/60 font-medium">Seller Status:</span>
                        <span className="font-semibold text-[#ebf1f5]">{currentStep.sellerStatus}</span>
                      </div>
                    </div>

                    {/* Action link inside terminal */}
                    <div className="pt-2">
                      <Link
                        href="/how-it-works"
                        className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#ebf1f5] hover:text-white py-2.5 rounded-lg bg-[#ebf1f5]/10 border border-[#ebf1f5]/20 hover:border-[#ebf1f5]/40 transition"
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
