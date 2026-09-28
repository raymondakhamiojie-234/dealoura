import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Dealoura Marketplace',
    default: 'Dealoura - Peer-to-Peer Marketplace',
  },
  description: 'Buy and sell items securely on Dealoura. A modern peer-to-peer marketplace with secure payments, buyer protection, and verified sellers.',
  keywords: ['marketplace', 'peer-to-peer', 'buy', 'sell', 'ecommerce'],
  openGraph: {
    title: 'Dealoura Marketplace',
    description: 'Buy and sell items securely on Dealoura.',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#F8FAFC] flex flex-col`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
