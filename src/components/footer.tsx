import Link from 'next/link'
import { ShieldCheck, Video, Camera, Smartphone, MessageCircle, Lock, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 font-sans border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl tracking-tight leading-none">
                  Dealoura
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-blue-400 mt-0.5">
                  Verified Escrow
                </span>
              </div>
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-6">
              The gold-standard institutional escrow marketplace for buying and selling verified social media accounts, monetized channels, and digital properties with 100% middleman protection.
            </p>

            {/* Live Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Escrow Vault: All Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h3 className="text-white font-bold text-xs font-mono uppercase tracking-wider mb-4">
              Marketplace
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/?platform=YouTube#browse" className="hover:text-white transition flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-red-500" />
                  <span>Monetized YouTube</span>
                </Link>
              </li>
              <li>
                <Link href="/?platform=TikTok#browse" className="hover:text-white transition flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-300" />
                  <span>TikTok Accounts</span>
                </Link>
              </li>
              <li>
                <Link href="/?platform=Instagram#browse" className="hover:text-white transition flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram Brands</span>
                </Link>
              </li>
              <li>
                <Link href="/?platform=Twitter+%2F+X#browse" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="font-bold text-slate-300">𝕏</span>
                  <span>Twitter / X Handles</span>
                </Link>
              </li>
              <li>
                <Link href="/?platform=Discord#browse" className="hover:text-white transition flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Discord Servers</span>
                </Link>
              </li>
              <li>
                <Link href="/referral" className="text-emerald-400 hover:text-emerald-300 font-bold transition flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/80">
                  <span>★ Affiliate Program (Earn 20%)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Escrow & Safety */}
          <div>
            <h3 className="text-white font-bold text-xs font-mono uppercase tracking-wider mb-4">
              Escrow &amp; Safety
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/sell#how-it-works" className="hover:text-white transition">
                  How Escrow Works
                </Link>
              </li>
              <li>
                <Link href="/sell#escrow-guide" className="hover:text-white transition">
                  Seller Verification Protocol
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition">
                  7-Day Buyer Evaluation
                </Link>
              </li>
              <li>
                <Link href="/dashboard/transactions" className="hover:text-white transition">
                  Dispute Resolution Hub
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition">
                  Fee Schedule (5% Escrow)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Support */}
          <div>
            <h3 className="text-white font-bold text-xs font-mono uppercase tracking-wider mb-4">
              Support &amp; Trust
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/dashboard/messages" className="hover:text-white transition">
                  Escrow Officer Chat
                </Link>
              </li>
              <li>
                <a href="mailto:support@dealoura.com" className="hover:text-white transition">
                  support@dealoura.com
                </a>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition">
                  Seller Onboarding Guide
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Dealoura Inc. All rights reserved. Peer-to-peer digital asset escrow.
          </p>
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted Escrow Vault</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}
