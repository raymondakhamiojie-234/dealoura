import { createClient } from '@/utils/supabase/server'
import { updateVerificationStatus } from '@/app/actions/verification'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, FileText, CheckCircle2, ExternalLink } from 'lucide-react'

export default async function AdminVerificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch pending verifications
  const { data: verifications } = await supabase
    .from('verifications')
    .select(`
      *,
      user_profiles:user_id (username, full_name)
    `)
    .eq('status', 'submitted')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
            Compliance & KYC
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">Review KYC Verifications</h1>
        <p className="text-xs sm:text-sm text-[#526371] mt-1">
          Inspect submitted government identity and ownership evidence documents before granting the Verified Merchant badge.
        </p>
      </div>

      <div className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] overflow-hidden">
        {verifications && verifications.length > 0 ? (
          <ul className="divide-y divide-[#d2dde4]">
            {verifications.map((v) => (
              <li key={v.id} className="p-6 hover:bg-[#ebf1f5]/40 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#010b13]">@{v.user_profiles?.username}</span>
                      <span className="text-xs text-[#526371]">({v.user_profiles?.full_name || 'Name not set'})</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#526371] block">
                      Submitted: {new Date(v.created_at).toLocaleString()}
                    </span>
                    <div className="pt-1">
                      <a 
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/verifications/${v.evidence_url}`}
                        target="_blank"
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#010b13] underline hover:opacity-80"
                      >
                        <FileText className="w-4 h-4 text-[#526371]" />
                        <span>View Evidence Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <form action={async () => {
                      'use server'
                      await updateVerificationStatus(v.id, 'verified', 'Approved by Dealoura Compliance.')
                    }}>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 bg-[#010b13] hover:bg-[#18263B] text-xs font-bold text-[#ebf1f5] rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Approve KYC
                      </button>
                    </form>
                    <form action={async () => {
                      'use server'
                      await updateVerificationStatus(v.id, 'rejected', 'Document could not be verified or was illegible.')
                    }}>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-[#d2dde4] hover:bg-red-50 text-xs font-bold text-red-600 rounded-xl transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-xs text-[#526371] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#010b13] mx-auto" />
            <p className="font-bold text-[#010b13]">No Pending Verifications</p>
            <p>All merchant documents have been audited.</p>
          </div>
        )}
      </div>
    </div>
  )
}
