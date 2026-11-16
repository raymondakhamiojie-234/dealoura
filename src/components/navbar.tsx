'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Bell, 
  Inbox, 
  LogOut, 
  User, 
  Wallet,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  ShoppingBag
} from 'lucide-react'

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-[#E4E7EC] shadow-[0_1px_3px_0_rgba(16,24,40,0.05)]">
      {/* Top Trust Notice Ribbon */}
      <div className="bg-[#101828] text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#18263B]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#16A36A]"></span>
            <span className="text-white font-semibold">Dealoura Escrow Protection:</span>
            <span className="text-slate-300 hidden sm:inline">Buyer funds and seller credentials held securely until ownership is transferred.</span>
            <span className="text-slate-300 sm:hidden">Guaranteed Escrow Protection</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <Link href="/how-it-works" className="hover:text-white transition font-medium">
              How Escrow Works
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/referral" className="hover:text-[#D6A84F] transition font-medium text-slate-300">
              Affiliate Program
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center border border-[#18263B] group-hover:border-[#16A36A] transition-colors">
              <ShieldCheck className="w-5 h-5 text-[#16A36A]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#101828] font-black text-xl tracking-tight leading-none">
                Dealoura
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-[#667085] mt-0.5">
                Digital Asset Escrow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/marketplace" 
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                isActive('/marketplace') 
                  ? 'text-[#101828] bg-slate-100' 
                  : 'text-[#344054] hover:text-[#101828] hover:bg-slate-50'
              }`}
            >
              Browse Marketplace
            </Link>
            <Link 
              href="/how-it-works" 
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                isActive('/how-it-works') 
                  ? 'text-[#101828] bg-slate-100' 
                  : 'text-[#344054] hover:text-[#101828] hover:bg-slate-50'
              }`}
            >
              How It Works
            </Link>
            <Link 
              href="/sell" 
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                isActive('/sell') 
                  ? 'text-[#101828] bg-slate-100' 
                  : 'text-[#344054] hover:text-[#101828] hover:bg-slate-50'
              }`}
            >
              Sell
            </Link>
            <Link 
              href="/referral" 
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                isActive('/referral') 
                  ? 'text-[#101828] bg-slate-100' 
                  : 'text-[#344054] hover:text-[#101828] hover:bg-slate-50'
              }`}
            >
              Affiliate
            </Link>
          </div>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            href="/sell"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#101828] bg-[#F7F9FC] hover:bg-slate-100 border border-[#E4E7EC] rounded-lg transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#16A36A]" />
            <span>List an Asset</span>
          </Link>

          <div className="h-5 w-px bg-[#E4E7EC]"></div>

          {user ? (
            <div className="flex items-center space-x-2">
              <Link 
                href="/dashboard/wallet" 
                className={`p-2 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 ${
                  isActive('/dashboard/wallet') 
                    ? 'bg-slate-100 text-[#101828]' 
                    : 'text-[#344054] hover:bg-slate-50 hover:text-[#101828]'
                }`}
                title="Wallet Balance"
              >
                <Wallet className="w-4 h-4 text-[#16A36A]" />
                <span>Wallet</span>
              </Link>
              <Link 
                href="/dashboard/transactions" 
                className={`p-2 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 ${
                  isActive('/dashboard/transactions') 
                    ? 'bg-slate-100 text-[#101828]' 
                    : 'text-[#344054] hover:bg-slate-50 hover:text-[#101828]'
                }`}
                title="Transactions & Escrow Orders"
              >
                <ShoppingBag className="w-4 h-4 text-[#344054]" />
                <span>Orders</span>
              </Link>
              <Link 
                href="/dashboard/messages" 
                className="p-2 text-[#667085] hover:text-[#101828] hover:bg-slate-50 rounded-lg transition" 
                title="Messages"
              >
                <Inbox className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/profile" 
                className="p-2 text-[#667085] hover:text-[#101828] hover:bg-slate-50 rounded-lg transition" 
                title="Profile"
              >
                <User className="w-4 h-4" />
              </Link>
              <button 
                onClick={handleSignOut} 
                className="p-2 text-[#667085] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer" 
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <Link 
                href="/login" 
                className="text-xs font-bold text-[#344054] hover:text-[#101828] px-3 py-2 rounded-lg transition"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#101828] hover:bg-[#18263B] rounded-lg transition shadow-xs"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden space-x-2">
          {!user && (
            <Link
              href="/register"
              className="text-xs font-bold px-3 py-1.5 bg-[#101828] text-white rounded-lg"
            >
              Sign Up
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-[#344054] hover:text-[#101828] hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E4E7EC] bg-white px-4 py-5 space-y-3">
          <Link 
            href="/marketplace" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#101828] hover:bg-slate-50 rounded-lg"
          >
            Browse Marketplace
          </Link>
          <Link 
            href="/how-it-works" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#344054] hover:bg-slate-50 rounded-lg"
          >
            How It Works
          </Link>
          <Link 
            href="/sell" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#344054] hover:bg-slate-50 rounded-lg"
          >
            Sell Account / Asset
          </Link>
          <Link 
            href="/referral" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#344054] hover:bg-slate-50 rounded-lg"
          >
            Affiliate Program
          </Link>

          {user ? (
            <div className="pt-3 border-t border-[#E4E7EC] space-y-1">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#667085] block mb-1">
                Account &amp; Escrow
              </span>
              <Link 
                href="/dashboard/wallet" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm font-semibold text-[#344054] hover:bg-slate-50 rounded-lg"
              >
                <Wallet className="w-4 h-4 mr-2.5 text-[#16A36A]" /> Wallet &amp; Balance
              </Link>
              <Link 
                href="/dashboard/transactions" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm font-semibold text-[#344054] hover:bg-slate-50 rounded-lg"
              >
                <ShoppingBag className="w-4 h-4 mr-2.5 text-[#344054]" /> My Orders &amp; Escrow
              </Link>
              <Link 
                href="/dashboard/seller/listings" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm font-semibold text-[#344054] hover:bg-slate-50 rounded-lg"
              >
                <PlusCircle className="w-4 h-4 mr-2.5 text-[#344054]" /> My Listings
              </Link>
              <Link 
                href="/dashboard/messages" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm font-semibold text-[#344054] hover:bg-slate-50 rounded-lg"
              >
                <Inbox className="w-4 h-4 mr-2.5 text-[#344054]" /> Messages
              </Link>
              <Link 
                href="/dashboard/profile" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm font-semibold text-[#344054] hover:bg-slate-50 rounded-lg"
              >
                <User className="w-4 h-4 mr-2.5 text-[#344054]" /> Profile &amp; Settings
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleSignOut()
                }} 
                className="w-full text-left flex items-center px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2.5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#E4E7EC] flex gap-2">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg text-xs font-bold text-[#344054] bg-slate-100 hover:bg-slate-200"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg text-xs font-bold text-white bg-[#101828] hover:bg-[#18263B]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
