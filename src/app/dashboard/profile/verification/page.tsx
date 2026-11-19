import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { VerificationForms } from './VerificationForms'

export const metadata = {
  title: 'Merchant Verification Center | Dealoura Escrow',
  description: 'Complete 3-tier merchant verification to unlock verified seller and trusted partner badges on Dealoura.'
}

export default async function VerificationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, username, full_name, is_verified, verification_level, is_trusted')
    .eq('id', user.id)
    .single()

  const username = profile?.username || user.email?.split('@')[0] || 'Member'
  const verificationLevel = profile?.verification_level || (profile?.is_verified ? 2 : 1)
  const isVerified = Boolean(profile?.is_verified || verificationLevel >= 2)
  const isTrusted = Boolean(profile?.is_trusted || verificationLevel >= 3)

  // 2. Fetch all verification submissions for this user
  const { data: allVerifications } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Find latest submissions by tier
  const latestL2 = (allVerifications || []).find(
    (v: any) => v.verification_type === 'level_2_identity' || !v.verification_type
  ) || null

  const latestL3 = (allVerifications || []).find(
    (v: any) => v.verification_type === 'level_3_ownership'
  ) || null

  // 3. Count completed escrow sales
  const { count: completedCount } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', user.id)
    .eq('status', 'completed')

  const completedSales = completedCount || 0

  // 4. Generate persistent bio verification code
  const bioCode = `DL-${user.id.slice(0, 4).toUpperCase()}${new Date().getDate()}${new Date().getMonth() + 1}`

  return (
    <div className="min-h-screen bg-[#ebf1f5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-[#010b13]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center text-xs font-bold text-[#526371] hover:text-[#010b13] transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Profile &amp; Settings
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
              Merchant Trust &amp; Compliance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">
            Account Verification Center
          </h1>
          <p className="text-xs sm:text-sm text-[#526371] mt-1">
            Build buyer trust and unlock verified merchant badges by certifying your legal identity and social account ownership.
          </p>
        </div>

        {/* Interactive Verification Forms */}
        <VerificationForms
          userEmail={user.email || 'N/A'}
          username={username}
          verificationLevel={verificationLevel}
          isVerified={isVerified}
          isTrusted={isTrusted}
          completedSales={completedSales}
          bioCode={bioCode}
          latestL2={latestL2}
          latestL3={latestL3}
        />

      </div>
    </div>
  )
}
