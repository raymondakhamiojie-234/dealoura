'use client'

import { useState, useEffect } from 'react'
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
  Eye, 
  Video, 
  Camera, 
  Smartphone,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChannelSample {
  id: string
  platform: string
  platformColor: string
  title: string
  handle: string
  followers: string
  engagement: string
  revenue: string
  niche: string
  escrowStatus: string
  stepProgress: number
}

const FEATURED_CHANNELS: ChannelSample[] = [
  {
    id: 'yt-1',
    platform: 'YouTube',
    platformColor: 'bg-red-600',
    title: 'Automated Tech & AI Explained',
    handle: '@TechNexusHQ',
    followers: '284,000',
    engagement: '14.2% CTR',
    revenue: '$3,180 / mo',
    niche: 'Technology & AI',
    escrowStatus: 'Payment Secured in Vault',
    stepProgress: 2
  },
  {
    id: 'tt-1',
    platform: 'TikTok',
    platformColor: 'bg-black',
    title: 'Viral Luxury & Lifestyle Clips',
    handle: '@LuxAuraDaily',
    followers: '640,000',
    engagement: '8.9% Engagement',
    revenue: '$2,450 / mo',
    niche: 'Luxury Lifestyle',
    escrowStatus: '2FA Credentials Verified',
    stepProgress: 3
  },
  {
    id: 'ig-1',
    platform: 'Instagram',
    platformColor: 'bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600',
    title: 'E-commerce & Dropshipping Niche',
    handle: '@BrandFounders',
    followers: '195,000',
    engagement: '6.4% Engagement',
    revenue: '$1,920 / mo',
    niche: 'Business & Finance',
    escrowStatus: 'Ownership Transfer in Progress',
    stepProgress: 3
  },
  {
    id: 'x-1',
    platform: 'Twitter / X',
    platformColor: 'bg-slate-900',
    title: 'Web3 & AI Developer Hub',
    handle: '@AlphaNodeX',
    followers: '88,500',
    engagement: '120k Impr / day',
    revenue: '$1,200 / mo',
    niche: 'Web3 & Tech',
    escrowStatus: 'Funds Released to Seller',
    stepProgress: 4
  }
]

export function HeroSlider() {
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % FEATURED_CHANNELS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const currentChannel = FEATURED_CHANNELS[activeTab]

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800">
      {/* Background radial glow & fine grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.22),rgba(255,255,255,0))] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: High-Impact Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Live Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6 shadow-sm shadow-blue-500/10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Institutional Escrow Protocol</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-normal">Zero Risk Guarantee</span>
            </div>

            {/* Massive Punchy Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white mb-6">
              Trade Verified Channels & Accounts{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Without Risk.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mb-8">
              The premier middleman escrow marketplace for monetized YouTube channels, high-reach TikTok accounts, Instagram brands, and digital properties. Funds and credentials stay locked in Dealoura Vault until transfer is 100% verified.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <Link
                href="/#browse"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>Browse Verified Accounts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700/80 hover:border-slate-600 transition-all duration-200"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>List an Account for Free</span>
              </Link>
            </div>

            {/* 3 Trust Checkmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 w-full text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Escrow on Every Order</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Supervised 2FA Handover</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Chargeback Risk</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Live Escrow Showcase Card */}
          <div className="lg:col-span-5 w-full">
            <div className="relative">
              
              {/* Outer decorative gradient glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/40 via-indigo-500/20 to-emerald-500/40 blur-xl opacity-70"></div>

              {/* Main Escrow Terminal Card */}
              <div className="relative rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                      DEALOURA VAULT #4928
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    ESCROW ACTIVE
                  </span>
                </div>

                {/* Category Selector Tabs */}
                <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
                  {FEATURED_CHANNELS.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => setActiveTab(idx)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
                        activeTab === idx
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {ch.platform}
                    </button>
                  ))}
                </div>

                {/* Animated Channel Preview */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentChannel.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Channel Identity */}
                    <div className="flex items-start justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-extrabold text-white px-2 py-0.5 rounded shadow-xs ${currentChannel.platformColor}`}>
                            {currentChannel.platform}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            Verified Channel
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {currentChannel.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {currentChannel.handle} • {currentChannel.niche}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">Est. Revenue</span>
                        <span className="text-sm font-black text-emerald-400">
                          {currentChannel.revenue}
                        </span>
                      </div>
                    </div>

                    {/* Channel Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-center">
                      <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-medium">Audience Size</span>
                        <span className="text-sm font-extrabold text-white">{currentChannel.followers}</span>
                      </div>
                      <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-medium">Audience Quality</span>
                        <span className="text-sm font-extrabold text-blue-400">{currentChannel.engagement}</span>
                      </div>
                    </div>

                    {/* Escrow Progress Bar */}
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-blue-400" />
                          <span>Escrow Stage:</span>
                        </span>
                        <span className="font-mono font-bold text-blue-400 text-[11px]">
                          {currentChannel.escrowStatus}
                        </span>
                      </div>

                      {/* 4 Steps Indicator */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        <div className={`h-1.5 rounded-full ${currentChannel.stepProgress >= 1 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                        <div className={`h-1.5 rounded-full ${currentChannel.stepProgress >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                        <div className={`h-1.5 rounded-full ${currentChannel.stepProgress >= 3 ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}`}></div>
                        <div className={`h-1.5 rounded-full ${currentChannel.stepProgress >= 4 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>1. Funds Vaulted</span>
                        <span>2. Audit</span>
                        <span>3. Handover</span>
                        <span>4. Released</span>
                      </div>
                    </div>

                  </motion.div>
                </AnimatePresence>

                {/* Footer Live Ticker */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Real-time Dealoura Middleman Protection</span>
                  </span>
                  <Link href="/#browse" className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5 text-xs">
                    <span>View Listing</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Global Escrow Stats Bar */}
        <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">$4.2M+</span>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Volume Escrowed</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100%</span>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Funds Protected</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">3,200+</span>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Accounts Transferred</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">&lt; 15 min</span>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Escrow Agent SLA</p>
          </div>
        </div>

      </div>
    </section>
  )
}
