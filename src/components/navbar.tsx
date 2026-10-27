'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Search, 
  User, 
  ShoppingCart, 
  Menu, 
  X, 
  Bell, 
  LayoutDashboard, 
  Inbox, 
  LogOut, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles,
  ChevronRight,
  ExternalLink
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
      (event, session) => {
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

  return (
    <header className="w-full font-sans sticky top-0 z-50">
      {/* Top Security & Live Status Ribbon */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-[11px] font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">Dealoura Vault:</span>
            <span className="hidden sm:inline text-slate-300">Audited Escrow Active • 100% Funds & Credentials Protected</span>
            <span className="sm:hidden text-slate-300">100% Escrow Protected</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span className="hidden md:inline font-mono text-slate-400">
              <span className="text-white font-semibold">$4.2M+</span> Escrowed
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <Link href="/sell#escrow-guide" className="hover:text-emerald-400 transition flex items-center gap-1 font-medium">
              <span>How Escrow Works</span>
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard/messages" className="hover:text-white transition">
              Live Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navbar */}
      <nav className="glass-panel border-b border-slate-200/80 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18 items-center">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-900 font-black text-xl tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                    Dealoura
                  </span>
                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-blue-600 mt-0.5">
                    Verified Escrow
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-1 lg:space-x-2 items-center h-full">
              <Link 
                href="/" 
                className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/' ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                HOME
              </Link>
              <Link 
                href="/#browse" 
                className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>BROWSE ACCOUNTS</span>
                <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold">Live</span>
              </Link>
              <Link 
                href="/sell#how-it-works" 
                className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 px-3 py-2 rounded-lg transition-colors"
              >
                HOW IT WORKS
              </Link>
              <Link 
                href="/dashboard/transactions" 
                className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 px-3 py-2 rounded-lg transition-colors"
              >
                MY ESCROWS
              </Link>
            </div>

            {/* Right Action Controls */}
            <div className="hidden md:flex items-center space-x-3">
              <Link 
                href="/sell" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>SELL ACCOUNT</span>
              </Link>

              <div className="h-6 w-px bg-slate-200 mx-1"></div>

              {user ? (
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/dashboard/notifications" 
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition relative" 
                    title="Alerts"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    <span className="absolute 1 top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">1</span>
                  </Link>
                  <Link 
                    href="/dashboard/messages" 
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition" 
                    title="Messages & Escrow Chat"
                  >
                    <Inbox className="h-4.5 w-4.5" />
                  </Link>
                  <Link 
                    href="/dashboard/profile" 
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition" 
                    title="User Profile"
                  >
                    <User className="h-4.5 w-4.5" />
                  </Link>
                  <Link 
                    href="/dashboard/transactions" 
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition relative" 
                    title="Escrow Orders"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                  </Link>
                  <button 
                    onClick={handleSignOut} 
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" 
                    title="Sign Out"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/login" 
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100/70 transition"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition border border-slate-200"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden space-x-2">
              <Link
                href="/sell"
                className="bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm"
              >
                Sell
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="block h-5 w-5" /> : <Menu className="block h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              HOME
            </Link>
            <Link 
              href="/#browse" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              BROWSE ACCOUNTS
            </Link>
            <Link 
              href="/sell" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50"
            >
              SELL ACCOUNT
            </Link>
            <Link 
              href="/sell#how-it-works" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              HOW ESCROW WORKS
            </Link>
            
            {user ? (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Account Dashboard</p>
                <Link 
                  href="/dashboard/transactions" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ShoppingCart className="w-4 h-4 mr-2 text-slate-400" /> Escrow Orders
                </Link>
                <Link 
                  href="/dashboard/messages" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Inbox className="w-4 h-4 mr-2 text-slate-400" /> Messages
                </Link>
                <Link 
                  href="/dashboard/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 mr-2 text-slate-400" /> Profile & Verification
                </Link>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleSignOut()
                  }} 
                  className="w-full text-left flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
