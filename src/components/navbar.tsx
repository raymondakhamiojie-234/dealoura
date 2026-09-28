'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, ShoppingCart, Menu, X, Bell, LayoutDashboard, Inbox, LogOut } from 'lucide-react'

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
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
    <header className="w-full font-sans">
      {/* Top Blue Bar */}
      <div className="bg-blue-600 text-blue-100 text-xs py-2 px-4 sm:px-6 lg:px-8 flex justify-between items-center hidden sm:flex">
        <p>Free Account Transfer On All Orders Over $100 Code : <span className="font-bold text-white">DEAL1</span></p>
        <div className="flex space-x-4">
          <Link href="#" className="hover:text-white transition">Today's Deal</Link>
          <span className="text-blue-400">|</span>
          <Link href="#" className="hover:text-white transition">Support</Link>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                {/* Simulated Emetix Logo */}
                <div className="text-blue-600 font-black text-2xl tracking-tighter flex items-center">
                  <svg className="w-8 h-8 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  Dealoura
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-8 items-center h-full">
              <Link href="/" className="text-sm font-bold text-gray-900 dark:text-white border-b-2 border-blue-600 h-full flex items-center px-1">
                HOME
              </Link>
              <Link href="/shop" className="text-sm font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 h-full flex items-center px-1 transition">
                SHOP
              </Link>
              <Link href="/blog" className="text-sm font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 h-full flex items-center px-1 transition">
                BLOG
              </Link>
              <Link href="/features" className="text-sm font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 h-full flex items-center px-1 transition">
                FEATURES
              </Link>
            </div>

            {/* Desktop Icons Area */}
            <div className="hidden md:flex items-center space-x-6">
              <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                <Search className="h-5 w-5" />
              </button>

              {user ? (
                <div className="flex items-center space-x-5">
                  <Link href="/dashboard/notifications" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white dark:border-gray-900">2</span>
                  </Link>
                  <Link href="/dashboard/messages" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                    <Inbox className="h-5 w-5" />
                  </Link>
                  <Link href="/dashboard/profile" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                    <User className="h-5 w-5" />
                  </Link>
                  <Link href="/dashboard/transactions" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition relative">
                    <ShoppingCart className="h-5 w-5" />
                  </Link>
                  <button onClick={handleSignOut} className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
                    <User className="h-5 w-5" />
                  </Link>
                  <Link href="/login" className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">0</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden space-x-4">
              {user && (
                <Link href="/dashboard/transactions" className="relative text-gray-600 dark:text-gray-300">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="pt-2 pb-3 space-y-1">
              <Link href="/" className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 text-blue-700 dark:text-blue-500 block pl-3 pr-4 py-2 text-base font-medium">HOME</Link>
              <Link href="/shop" className="border-l-4 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 block pl-3 pr-4 py-2 text-base font-medium">SHOP</Link>
              
              {user ? (
                <>
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dashboard</p>
                    <Link href="/dashboard/profile" className="flex items-center border-l-4 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 pl-3 pr-4 py-2 text-base font-medium mt-1">
                      <User className="mr-3 h-5 w-5" /> Profile
                    </Link>
                    <Link href="/dashboard/notifications" className="flex items-center border-l-4 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 pl-3 pr-4 py-2 text-base font-medium">
                      <Bell className="mr-3 h-5 w-5" /> Alerts
                    </Link>
                    <Link href="/dashboard/messages" className="flex items-center border-l-4 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 pl-3 pr-4 py-2 text-base font-medium">
                      <Inbox className="mr-3 h-5 w-5" /> Messages
                    </Link>
                    <Link href="/dashboard/transactions" className="flex items-center border-l-4 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 pl-3 pr-4 py-2 text-base font-medium">
                      <LayoutDashboard className="mr-3 h-5 w-5" /> Orders
                    </Link>
                    <button onClick={handleSignOut} className="w-full text-left flex items-center border-l-4 border-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 pl-3 pr-4 py-2 text-base font-medium">
                      <LogOut className="mr-3 h-5 w-5" /> Sign out
                    </button>
                  </div>
                </>
              ) : (
                <Link href="/login" className="border-l-4 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 block pl-3 pr-4 py-2 text-base font-medium mt-4">Login / Register</Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
