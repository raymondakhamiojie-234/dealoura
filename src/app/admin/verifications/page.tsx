import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Star,
  Eye,
  Filter,
  UserCheck,
  AlertCircle,
  Users,
} from 'lucide-react'
import { AdminVerificationCard } from './AdminVerificationCard'

export const metadata = {
  title: 'KYC & Verification Desk | Dealoura Admin',
  description: 'Audit submitted Level 2 identity and Level 3 account ownership verifications.',
}

export default async function AdminVerificationsPage(props: {
  searchParams: Promise<{ status?: string; tier?: string }>
}) {
  const searchParams = await props.searchParams
  const currentStatus = searchParams.status || 'pending'
  const currentTier = searchParams.tier || 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check admin role
  const { data: adminProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // 1. Fetch all verifications
  const { data: allVerifications } = await supabase
    .from('verifications')
    .select(`
      *,
      user_profiles:user_id (id, username, full_name, email, verification_level, is_verified, is_trusted)
    `)
    .order('created_at', { ascending: false })

  const verifications = allVerifications || []

  // 2. Count total verified merchants in marketplace
  const { count: verifiedMerchantCount } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .gte('verification_level', 2)

  // 3. Compute Metrics
  const pendingSubmissions = verifications.filter(
    (v) => v.status === 'submitted' || v.status === 'under_review'
  )
  const pendingL2 = pendingSubmissions.filter(
    (v) => v.verification_type === 'level_2_identity' || !v.verification_type
  ).length
  const pendingL3 = pendingSubmissions.filter(
    (v) => v.verification_type === 'level_3_ownership'
  ).length
  const resolvedCount = verifications.filter(
    (v) => v.status === 'verified' || v.status === 'approved' || v.status === 'rejected'
  ).length

  // 4. Filter verifications
  const filteredVerifications = verifications.filter((v) => {
    // Status filter
    if (currentStatus === 'pending') {
      if (v.status !== 'submitted' && v.status !== 'under_review') return false
    } else if (currentStatus === 'verified') {
      if (v.status !== 'verified' && v.status !== 'approved') return false
    } else if (currentStatus === 'rejected') {
      if (v.status !== 'rejected') return false
    }

    // Tier filter
    if (currentTier === 'level_2') {
      if (v.verification_type === 'level_3_ownership') return false
    } else if (currentTier === 'level_3') {
      if (v.verification_type !== 'level_3_ownership') return false
    }

    return true
  })

  // 5. Generate signed URLs for filtered items (capped at 50 for performance)
  const itemsWithUrls = await Promise.all(
    filteredVerifications.slice(0, 50).map(async (v: any) => {
      let signedIdUrl: string | null = null
      let signedSelfieUrl: string | null = null
      let signedEvidenceUrl: string | null = null

      if (v.id_document_url) {
        try {
          const { data } = await supabase.storage
            .from('verifications')
            .createSignedUrl(v.id_document_url, 3600)
          signedIdUrl = data?.signedUrl || null
        } catch {
          // ignore
        }
      }

      if (v.selfie_url) {
        try {
          const { data } = await supabase.storage
            .from('verifications')
            .createSignedUrl(v.selfie_url, 3600)
          signedSelfieUrl = data?.signedUrl || null
        } catch {
          // ignore
        }
      }

      if (v.evidence_url) {
        try {
          const { data } = await supabase.storage
            .from('verifications')
            .createSignedUrl(v.evidence_url, 3600)
          signedEvidenceUrl = data?.signedUrl || null
        } catch {
          // ignore
        }
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
            Compliance &amp; KYC Desk
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            Trust &amp; Safety
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">
          Review Merchant Verifications
        </h1>
        <p className="text-xs sm:text-sm text-[#526371] mt-1">
          Audit submitted Level 2 government IDs + selfies and Level 3 social media bio code ownership proofs.
        </p>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-[#526371] block">
            Pending Audits
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#010b13]">
              {pendingSubmissions.length}
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[11px] text-[#526371] block">
            Submissions requiring compliance check
          </span>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-[#526371] block">
            Level 2 Identity Pending
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#010b13]">
              {pendingL2}
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[11px] text-[#526371] block">
            Government ID + Selfie liveness checks
          </span>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-[#526371] block">
            Level 3 Trusted Seller Pending
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-500">
              {pendingL3}
            </span>
            <Star className="w-5 h-5 text-amber-400 fill-current" />
          </div>
          <span className="text-[11px] text-[#526371] block">
            Bio code + Creator Studio ownership audits
          </span>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#d2dde4] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-[#526371] block">
            Active Verified Merchants
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-600">
              {verifiedMerchantCount || 0}
            </span>
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[11px] text-[#526371] block">
            Certified Level 2 &amp; 3 sellers
          </span>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d2dde4] pb-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Link
            href={`/admin/verifications?status=pending&tier=${currentTier}`}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition shrink-0 ${
              currentStatus === 'pending'
                ? 'bg-[#010b13] text-[#ebf1f5]'
                : 'bg-[#ffffff] text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
            }`}
          >
            Pending ({pendingSubmissions.length})
          </Link>
          <Link
            href={`/admin/verifications?status=verified&tier=${currentTier}`}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition shrink-0 ${
              currentStatus === 'verified'
                ? 'bg-[#010b13] text-[#ebf1f5]'
                : 'bg-[#ffffff] text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
            }`}
          >
            Verified ({verifications.filter((v) => v.status === 'verified' || v.status === 'approved').length})
          </Link>
          <Link
            href={`/admin/verifications?status=rejected&tier=${currentTier}`}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition shrink-0 ${
              currentStatus === 'rejected'
                ? 'bg-[#010b13] text-[#ebf1f5]'
                : 'bg-[#ffffff] text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
            }`}
          >
            Rejected ({verifications.filter((v) => v.status === 'rejected').length})
          </Link>
          <Link
            href={`/admin/verifications?status=all&tier=${currentTier}`}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition shrink-0 ${
              currentStatus === 'all'
                ? 'bg-[#010b13] text-[#ebf1f5]'
                : 'bg-[#ffffff] text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
            }`}
          >
            All Submissions ({verifications.length})
          </Link>
        </div>

        {/* Tier Filter */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-[#526371] mr-1">Tier:</span>
          <Link
            href={`/admin/verifications?status=${currentStatus}&tier=all`}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
              currentTier === 'all'
                ? 'bg-[#010b13] text-[#ebf1f5]'
                : 'bg-white text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
            }`}
          >
            All
          </Link>
          <Link
            href={`/admin/verifications?status=${currentStatus}&tier=level_2`}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
              currentTier === 'level_2'
                ? 'bg-[#010b13] text-[#ebf1f5]'
                : 'bg-white text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
            }`}
          >
            Level 2
          </Link>
          <Link
            href={`/admin/verifications?status=${currentStatus}&tier=level_3`}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
              currentTier === 'level_3'
                ? 'bg-amber-400 text-[#010b13]'
                : 'bg-white text-[#526371] hover:text-[#010b13] border border-[#d2dde4]'
            }`}
          >
            Level 3 (Gold)
          </Link>
        </div>
      </div>

      {/* Verifications List */}
      <div className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] overflow-hidden">
        {itemsWithUrls && itemsWithUrls.length > 0 ? (
          <ul className="divide-y divide-[#d2dde4]">
            {itemsWithUrls.map((item) => (
              <AdminVerificationCard key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <div className="p-16 text-center text-xs text-[#526371] space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#010b13] mx-auto" />
            <p className="font-bold text-base text-[#010b13]">No Verifications in this Queue</p>
            <p className="max-w-md mx-auto">
              There are no submissions matching your active filters (Status: {currentStatus}, Tier: {currentTier}). All seller documentation has been resolved.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
