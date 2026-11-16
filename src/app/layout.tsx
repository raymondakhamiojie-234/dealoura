import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Dealoura Digital Asset Marketplace',
    default: 'Dealoura - Peer-to-Peer Digital Asset Marketplace',
  },
  description: 'Buy and sell digital assets with confidence. A secure peer-to-peer marketplace for YouTube channels, TikTok accounts, Instagram brands, and digital communities protected by transparent escrow.',
  keywords: ['digital assets', 'youtube channels for sale', 'buy tiktok account', 'instagram accounts', 'escrow marketplace', 'dealoura'],
  openGraph: {
    title: 'Dealoura - Peer-to-Peer Digital Asset Marketplace',
    description: 'Buy and sell digital assets with confidence through verified escrow.',
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
      <body className={`${inter.className} min-h-screen bg-[#F7F9FC] text-[#101828] flex flex-col antialiased`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
