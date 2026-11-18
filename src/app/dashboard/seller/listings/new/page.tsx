import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react'
import { NewListingForm } from '@/components/new-listing-form'

export const metadata = {
  title: 'List an Account for Sale | Dealoura Seller Hub',
  description: 'Create a new digital asset listing for YouTube channels, TikTok accounts, Instagram brands, Facebook pages, or Discord servers with guaranteed escrow protection.',
}

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/seller/listings/new')
  }

  return (
    <div className="bg-[#ebf1f5] min-h-screen py-10 font-sans text-[#010b13]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb & Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/seller/listings"
              className="inline-flex items-center text-xs font-bold text-[#526371] hover:text-[#010b13] transition gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Listings</span>
            </Link>
            <span className="text-[#d2dde4]">•</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#010b13]">
              Listing Creator
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#010b13] tracking-tight">
                List an Account for Sale
              </h1>
              <p className="text-xs sm:text-sm text-[#526371] mt-1 max-w-xl leading-relaxed">
                Provide accurate metrics and upload analytics screenshot proof. Your listing is verified by a Dealoura Escrow Agent before publication.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#d2dde4] text-[11px] font-bold text-[#010b13] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#010b13]" />
              <span>0% Upfront Listing Fee</span>
            </div>
          </div>
        </div>

        {/* Client Form Component with Live Payout Calculator & Image Previews */}
        <NewListingForm />

      </div>
    </div>
  )
}
