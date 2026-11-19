import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import { AdminVerificationCard } from './AdminVerificationCard'

export const metadata = {
  title: 'KYC & Verification Desk | Dealoura Admin',
  description: 'Audit submitted Level 2 identity and Level 3 account ownership verifications.',
}

export default async function AdminVerificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch pending submissions
  const { data: verifications } = await supabase
    .from('verifications')
    .select(`
      *,
      user_profiles:user_id (username, full_name)
    `)
    .eq('status', 'submitted')
    .order('created_at', { ascending: true })

  // Generate signed URLs for private evidence files
  const itemsWithUrls = await Promise.all(
    (verifications || []).map(async (v: any) => {
      let signedIdUrl: string | null = null
      let signedSelfieUrl: string | null = null
      let signedEvidenceUrl: string | null = null

      if (v.id_document_url) {
        const { data } = await supabase.storage
          .from('verifications')
          .createSignedUrl(v.id_document_url, 3600)
        signedIdUrl = data?.signedUrl || null
      }

      if (v.selfie_url) {
        const { data } = await supabase.storage
          .from('verifications')
          .createSignedUrl(v.selfie_url, 3600)
        signedSelfieUrl = data?.signedUrl || null
      }

      if (v.evidence_url) {
        const { data } = await supabase.storage
          .from('verifications')
          .createSignedUrl(v.evidence_url, 3600)
        signedEvidenceUrl = data?.signedUrl || null
      }

      return {
        ...v,
        signedIdUrl,
        signedSelfieUrl,
        signedEvidenceUrl,
      }
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
            Compliance &amp; KYC Desk
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">
          Review Merchant Verifications
        </h1>
        <p className="text-xs sm:text-sm text-[#526371] mt-1">
          Inspect submitted Level 2 government IDs + selfies and Level 3 social media bio code ownership proofs.
        </p>
      </div>

      <div className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] overflow-hidden">
        {itemsWithUrls && itemsWithUrls.length > 0 ? (
          <ul className="divide-y divide-[#d2dde4]">
            {itemsWithUrls.map((item) => (
              <AdminVerificationCard key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-xs text-[#526371] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#010b13] mx-auto" />
            <p className="font-bold text-[#010b13]">No Pending Verifications</p>
            <p>All merchant documents have been audited and resolved.</p>
          </div>
        )}
      </div>
    </div>
  )
}
