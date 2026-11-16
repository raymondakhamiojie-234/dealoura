import Link from 'next/link'
import { ShieldCheck, Video, Camera, Smartphone, MessageCircle, Lock, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#101828] text-slate-400 pt-16 pb-12 font-sans border-t border-[#18263B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#18263B]">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#18263B] text-white flex items-center justify-center border border-slate-700">
                <ShieldCheck className="w-5 h-5 text-[#16A36A]" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl tracking-tight leading-none">
                  Dealoura
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mt-0.5">
                  Digital Asset Escrow
                </span>
              </div>
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Dealoura is a peer-to-peer marketplace for buying and selling verified digital assets and social channels with transparent escrow protection.
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18263B] border border-slate-700 text-[11px] font-medium text-slate-300">
                <Lock className="w-3.5 h-3.5 text-[#16A36A]" />
                <span>Escrow Inspection &amp; Protected Settlement</span>
              </span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h3 className="text-white font-bold text-xs font-mono uppercase tracking-wider mb-4">
              Marketplace
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/marketplace?platform=YouTube" className="hover:text-white transition flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-red-500" />
                  <span>YouTube Channels</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?platform=TikTok" className="hover:text-white transition flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-300" />
                  <span>TikTok Accounts</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?platform=Instagram" className="hover:text-white transition flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram Pages</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?platform=Twitter+%2F+X" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="font-bold text-slate-300">𝕏</span>
                  <span>Twitter / X Profiles</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?platform=Discord" className="hover:text-white transition flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Discord Communities</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-slate-300 hover:text-white font-medium transition inline-block pt-1">
                  View All Listings &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Escrow & Process */}
          <div>
            <h3 className="text-white font-bold text-xs font-mono uppercase tracking-wider mb-4">
              How Escrow Works
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition">
                  5-Step Escrow Process
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition">
                  Seller Payouts &amp; Fees
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#evaluation" className="hover:text-white transition">
                  7-Day Buyer Evaluation
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#disputes" className="hover:text-white transition">
                  Dispute Resolution Rules
                </Link>
              </li>
              <li>
                <Link href="/referral" className="hover:text-white transition text-[#D6A84F] font-semibold">
                  Affiliate Program (20% Share)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Support */}
          <div>
            <h3 className="text-white font-bold text-xs font-mono uppercase tracking-wider mb-4">
              Trust &amp; Legal
            </h3>
            <ul className="space-y-2.5 text-xs">
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
              <li>
                <Link href="/how-it-works#security" className="hover:text-white transition">
                  Credential Security Protocol
                </Link>
              </li>
              <li>
                <Link href="/dashboard/messages" className="hover:text-white transition">
                  Support &amp; Escrow Desk
                </Link>
              </li>
              <li>
                <a href="mailto:support@dealoura.com" className="hover:text-white transition">
                  support@dealoura.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Dealoura. All rights reserved. Peer-to-peer digital asset escrow marketplace.
          </p>
          <div className="flex items-center space-x-6 text-slate-400">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/how-it-works" className="hover:text-white transition">Escrow</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
