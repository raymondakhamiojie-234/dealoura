import Link from 'next/link'
import { ShieldCheck, Video, Camera, Smartphone, MessageCircle, Lock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#010b13] text-[#ebf1f5] pt-16 pb-12 font-sans border-t border-[#0a1722]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#0a1722]">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#071520] text-white flex items-center justify-center border border-[#0f2436]">
                <ShieldCheck className="w-5 h-5 text-[#ebf1f5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl tracking-tight leading-none">
                  Dealoura
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#ebf1f5]/60 mt-0.5">
                  Digital Asset Escrow
                </span>
              </div>
            </Link>
            
            <p className="text-xs text-[#ebf1f5]/70 leading-relaxed max-w-sm">
              Dealoura is a peer-to-peer marketplace for buying and selling verified digital assets and social channels with transparent escrow protection.
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071520] border border-[#0f2436] text-[11px] font-medium text-[#ebf1f5]/80">
                <Lock className="w-3.5 h-3.5 text-[#ebf1f5]" />
                <span>Escrow Inspection &amp; Protected Settlement</span>
              </span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h3 className="text-white font-bold text-xs font-mono uppercase tracking-wider mb-4">
              Marketplace
            </h3>
            <ul className="space-y-2.5 text-xs text-[#ebf1f5]/80">
              <li>
                <Link href="/marketplace?platform=YouTube" className="hover:text-white transition flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-red-500" />
                  <span>YouTube Channels</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?platform=TikTok" className="hover:text-white transition flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#ebf1f5]" />
                  <span>TikTok Accounts</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?platform=Instagram" className="hover:text-white transition flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram Pages</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?platform=Twitter+%2F+X" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="font-bold text-[#ebf1f5]">𝕏</span>
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
                <Link href="/marketplace" className="text-white hover:underline font-bold transition inline-block pt-1">
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
            <ul className="space-y-2.5 text-xs text-[#ebf1f5]/80">
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
                <Link href="/how-it-works#buyer-guarantee" className="hover:text-white transition">
                  Buyer Protection Guarantee
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#evaluation-window" className="hover:text-white transition">
                  7-Day Evaluation Policy
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#credential-handover" className="hover:text-white transition">
                  2FA Credential Handover
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Legal */}
          <div>
            <h3 className="text-white font-bold text-xs font-mono uppercase tracking-wider mb-4">
              Legal &amp; Trust
            </h3>
            <ul className="space-y-2.5 text-xs text-[#ebf1f5]/80">
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service &amp; Escrow
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/referral" className="hover:text-white transition">
                  Affiliate Program (20%)
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition">
                  Seller Agreement
                </Link>
              </li>
              <li>
                <a href="mailto:support@dealoura.com" className="hover:text-white transition">
                  Escrow Officer Support
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#ebf1f5]/60 gap-4">
          <p>© {new Date().getFullYear()} Dealoura Inc. All rights reserved. Secure middleman escrow for digital properties.</p>
          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <Link href="/how-it-works" className="hover:text-white transition">
              Security
            </Link>
            <span className="text-[#ebf1f5]/40">•</span>
            <span className="text-white font-medium">FDIC Insured Escrow Custody</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
