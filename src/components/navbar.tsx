'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Inbox, 
  LogOut, 
  User, 
  ArrowRight, 
  PlusCircle, 
  ShoppingBag,
  Tag
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
    <header className="w-full sticky top-0 z-50 bg-[#ebf1f5]/90 backdrop-blur-md border-b border-[#d2dde4] shadow-xs">
      {/* Top Trust Notice Ribbon */}
      <div className="bg-[#010b13] text-[#ebf1f5] text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#0a1722]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#ebf1f5] animate-pulse"></span>
            <span className="text-white font-semibold">Dealoura Escrow Protection:</span>
            <span className="text-[#ebf1f5]/80 hidden sm:inline">Buyer funds and seller credentials held securely until ownership is transferred.</span>
            <span className="text-[#ebf1f5]/80 sm:hidden">Guaranteed Escrow Protection</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-[#ebf1f5]/70">
            <Link href="/how-it-works" className="hover:text-white transition font-medium">
              How Escrow Works
            </Link>
            <span className="text-[#0a1722]">|</span>
            <Link href="/referral" className="hover:text-white transition font-medium text-[#ebf1f5]/90">
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
            <div className="w-9 h-9 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center border border-[#010b13] group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-[#ebf1f5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#010b13] font-black text-xl tracking-tight leading-none">
                Dealoura
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#526371] mt-0.5">
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
                  ? 'text-[#010b13] bg-[#d2dde4]' 
                  : 'text-[#526371] hover:text-[#010b13] hover:bg-[#d2dde4]/50'
              }`}
            >
              Browse Marketplace
            </Link>
            <Link 
              href="/how-it-works" 
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                isActive('/how-it-works') 
                  ? 'text-[#010b13] bg-[#d2dde4]' 
                  : 'text-[#526371] hover:text-[#010b13] hover:bg-[#d2dde4]/50'
              }`}
            >
              How It Works
            </Link>
            <Link 
              href="/sell" 
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                isActive('/sell') 
                  ? 'text-[#010b13] bg-[#d2dde4]' 
                  : 'text-[#526371] hover:text-[#010b13] hover:bg-[#d2dde4]/50'
              }`}
            >
              Sell
            </Link>
            <Link 
              href="/referral" 
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                isActive('/referral') 
                  ? 'text-[#010b13] bg-[#d2dde4]' 
                  : 'text-[#526371] hover:text-[#010b13] hover:bg-[#d2dde4]/50'
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#010b13] bg-white hover:bg-[#d2dde4] border border-[#d2dde4] rounded-xl transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#010b13]" />
            <span>List an Asset</span>
          </Link>

          <div className="h-5 w-px bg-[#d2dde4]"></div>

          {user ? (
            <div className="flex items-center space-x-2">
              <Link 
                href="/dashboard/transactions" 
                className={`p-2 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 ${
                  isActive('/dashboard/transactions') 
                    ? 'bg-[#d2dde4] text-[#010b13]' 
                    : 'text-[#526371] hover:bg-[#d2dde4]/50 hover:text-[#010b13]'
                }`}
                title="Transactions & Escrow Orders"
              >
                <ShoppingBag className="w-4 h-4 text-[#010b13]" />
                <span>Orders</span>
              </Link>
              <Link 
                href="/dashboard/offers" 
                className={`p-2 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 ${
                  isActive('/dashboard/offers') 
                    ? 'bg-[#d2dde4] text-[#010b13]' 
                    : 'text-[#526371] hover:bg-[#d2dde4]/50 hover:text-[#010b13]'
                }`}
                title="Offers & Proposals"
              >
                <Tag className="w-4 h-4 text-[#010b13]" />
                <span>Offers</span>
              </Link>
              <Link 
                href="/dashboard/messages" 
                className="p-2 text-[#526371] hover:text-[#010b13] hover:bg-[#d2dde4]/50 rounded-lg transition" 
                title="Messages"
              >
                <Inbox className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/profile" 
                className="p-2 text-[#526371] hover:text-[#010b13] hover:bg-[#d2dde4]/50 rounded-lg transition" 
                title="Profile"
              >
                <User className="w-4 h-4" />
              </Link>
              <button 
                onClick={handleSignOut} 
                className="p-2 text-[#526371] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer" 
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <Link 
                href="/login" 
                className="text-xs font-bold text-[#010b13] hover:bg-[#d2dde4]/60 px-3.5 py-2 rounded-xl transition"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#ebf1f5] bg-[#010b13] hover:bg-[#0a1722] rounded-xl transition shadow-sm"
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
              className="text-xs font-bold px-3 py-1.5 bg-[#010b13] text-[#ebf1f5] rounded-xl"
            >
              Sign Up
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-[#010b13] hover:bg-[#d2dde4] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#ebf1f5] border-b border-[#d2dde4] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <Link
              href="/marketplace"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#010b13] hover:bg-[#d2dde4] rounded-lg"
            >
              Browse Marketplace
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#010b13] hover:bg-[#d2dde4] rounded-lg"
            >
              How It Works
            </Link>
            <Link
              href="/sell"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#010b13] hover:bg-[#d2dde4] rounded-lg"
            >
              Sell An Account
            </Link>
            <Link
              href="/referral"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#010b13] hover:bg-[#d2dde4] rounded-lg"
            >
              Affiliate Program
            </Link>
          </div>

          <div className="pt-3 border-t border-[#d2dde4] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard/transactions"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-xs font-bold text-[#ebf1f5] bg-[#010b13] rounded-xl"
                >
                  My Orders &amp; Escrow
                </Link>
                <Link
                  href="/dashboard/offers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 text-xs font-bold text-[#010b13] bg-white border border-[#d2dde4] rounded-xl"
                >
                  Manage Offers &amp; Proposals
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="w-full text-center py-2 px-4 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-xs font-bold text-[#010b13] bg-white border border-[#d2dde4] rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-xs font-bold text-[#ebf1f5] bg-[#010b13] rounded-xl"
                >
                  Create an Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
