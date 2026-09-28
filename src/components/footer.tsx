import Link from 'next/link'
import { Camera, Video, Hash, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 font-sans border-t-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="text-blue-500 font-black text-2xl tracking-tighter flex items-center">
                <svg className="w-8 h-8 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                Dealoura
              </div>
            </Link>
            <p className="text-sm text-gray-500 mb-6">
              The premium, secure marketplace for buying and selling verified social media accounts, channels, and communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition"><Camera className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><Hash className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><Video className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-blue-400 transition">Browse Accounts</Link></li>
              <li><Link href="/sell" className="hover:text-blue-400 transition">Sell Your Account</Link></li>
              <li><Link href="/escrow" className="hover:text-blue-400 transition">How Escrow Works</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-400 transition">Fees & Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="hover:text-blue-400 transition">Help Center / FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition">Contact Us</Link></li>
              <li><Link href="/disputes" className="hover:text-blue-400 transition">Report an Issue</Link></li>
              <li><Link href="/verification" className="hover:text-blue-400 transition">ID Verification Process</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Stay Updated</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get the latest high-value accounts delivered straight to your inbox.
            </p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-gray-800 text-white px-4 py-2 w-full rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700"
              />
              <button 
                type="button" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md font-bold transition"
              >
                Go
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} Dealoura Marketplace. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
