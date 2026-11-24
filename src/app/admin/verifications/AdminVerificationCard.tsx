'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  FileText,
  Camera,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  AlertCircle,
  Eye,
  X,
  Copy,
  Check,
  Scale,
  Maximize2,
  Clock,
} from 'lucide-react'
import { updateVerificationStatus, markVerificationUnderReview } from '@/app/actions/verification'

interface AdminVerificationItem {
  id: string
  user_id: string
  status: string
  verification_type?: string | null
  id_document_url?: string | null
  selfie_url?: string | null
  account_url?: string | null
  bio_code?: string | null
  evidence_url?: string | null
  admin_notes?: string | null
  created_at: string
  user_profiles?: {
    username?: string
    full_name?: string
    email?: string
    verification_level?: number
  } | null
  signedIdUrl?: string | null
  signedSelfieUrl?: string | null
  signedEvidenceUrl?: string | null
}

const PRESET_REJECTIONS_L2 = [
  'Government ID is blurry, cropped, or illegible.',
  'ID document has expired or is invalid.',
  'Selfie photo does not match the portrait on the Government ID.',
  'Handwritten note is missing "Dealoura", today\'s date, or your username.',
  'Document name does not match Dealoura registered account name.',
]

const PRESET_REJECTIONS_L3 = [
  'Bio verification code was not found in public channel/account bio.',
  'Studio analytics screenshot does not show channel owner/manager access.',
  'Account link provided is invalid, private, or inaccessible.',
  'Account metrics do not meet authenticity or quality thresholds.',
]

export function AdminVerificationCard({ item }: { item: AdminVerificationItem }) {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedBioCode, setCopiedBioCode] = useState(false)
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null)

  // Checklist states
  const [chk1, setChk1] = useState(false)
  const [chk2, setChk2] = useState(false)
  const [chk3, setChk3] = useState(false)

  const isL3 = item.verification_type === 'level_3_ownership'
  const isPending = item.status === 'submitted' || item.status === 'under_review'
  const isVerified = item.status === 'verified' || item.status === 'approved'
  const isRejected = item.status === 'rejected'

  const handleCopyBioCode = () => {
    if (item.bio_code) {
      navigator.clipboard.writeText(item.bio_code)
      setCopiedBioCode(true)
      setTimeout(() => setCopiedBioCode(false), 2000)
    }
  }

  const handleSetUnderReview = async () => {
    setProcessing(true)
    setErrorMessage(null)
    try {
      const res = await markVerificationUnderReview(item.id)
      if (res?.error) {
        setErrorMessage(res.error)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update status.')
    } finally {
      setProcessing(false)
    }
  }

  const handleApprove = async () => {
    setProcessing(true)
    setErrorMessage(null)
    try {
      const level = isL3 ? 3 : 2
      const defaultNotes = isL3
        ? 'Approved as Level 3 Trusted Partner by Dealoura Compliance.'
        : 'Approved as Level 2 Verified Seller by Dealoura Compliance.'
      const finalNotes = approvalNotes.trim() || defaultNotes

      const res = await updateVerificationStatus(item.id, 'verified', finalNotes, level)
      if (res?.error) {
        setErrorMessage(res.error)
        setProcessing(false)
      } else {
        setIsAuditModalOpen(false)
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Approval failed.')
      setProcessing(false)
    }
  }

  const handleReject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!rejectNotes.trim()) {
      setErrorMessage('Please provide a specific reason for rejection.')
      return
    }

    setProcessing(true)
    setErrorMessage(null)
    try {
      const res = await updateVerificationStatus(item.id, 'rejected', rejectNotes.trim())
      if (res?.error) {
        setErrorMessage(res.error)
        setProcessing(false)
      } else {
        setIsAuditModalOpen(false)
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Rejection failed.')
      setProcessing(false)
    }
  }

  return (
    <>
      <li className="p-6 hover:bg-[#ebf1f5]/30 transition space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* User and Tier Info */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-[#010b13]">@{item.user_profiles?.username}</span>
              <span className="text-xs text-[#526371]">({item.user_profiles?.full_name || 'No full name'})</span>

              {isL3 ? (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-[#010b13] flex items-center gap-1 shadow-2xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Level 3 (Trusted Partner)</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5] flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Level 2 (Identity Verification)</span>
                </span>
              )}

              {/* Status Badge */}
              {item.status === 'submitted' && (
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Awaiting Audit</span>
                </span>
              )}
              {item.status === 'under_review' && (
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Under Investigation</span>
                </span>
              )}
              {isVerified && (
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified &amp; Active</span>
                </span>
              )}
              {isRejected && (
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  <span>Rejected</span>
                </span>
              )}
            </div>

            <span className="text-[11px] font-mono text-[#526371] block" suppressHydrationWarning>
              Submitted: {new Date(item.created_at).toISOString().split('T')[0]}
            </span>

            {/* Quick Evidence Preview Snippets */}
            {!isL3 && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {item.signedIdUrl && (
                  <button
                    type="button"
                    onClick={() => setIsAuditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ebf1f5] border border-[#d2dde4] text-xs font-bold text-[#010b13] hover:bg-[#d2dde4] transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#526371]" />
                    <span>Government ID Document</span>
                  </button>
                )}
                {item.signedSelfieUrl && (
                  <button
                    type="button"
                    onClick={() => setIsAuditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ebf1f5] border border-[#d2dde4] text-xs font-bold text-[#010b13] hover:bg-[#d2dde4] transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#526371]" />
                    <span>Selfie with Note</span>
                  </button>
                )}
              </div>
            )}

            {isL3 && (
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#010b13]">Channel/Account:</span>
                  {item.account_url ? (
                    <a
                      href={item.account_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-mono inline-flex items-center gap-1"
                    >
                      <span>{item.account_url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[#526371]">None provided</span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#010b13]">Expected Bio Code:</span>
                  <span className="font-mono font-black px-2 py-0.5 rounded bg-[#ebf1f5] border border-[#d2dde4] text-[#010b13]">
                    {item.bio_code || 'N/A'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBioCode}
                    className="text-[#526371] hover:text-[#010b13] p-1 rounded transition"
                    title="Copy Code"
                  >
                    {copiedBioCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* If has admin notes */}
            {item.admin_notes && (
              <div className="p-3 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-xs text-[#010b13] space-y-1 mt-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#526371] block">
                  Compliance Audit Notes:
                </span>
                <p className="italic">&ldquo;{item.admin_notes}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Open Full Audit Suite */}
            <button
              type="button"
              onClick={() => setIsAuditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Audit &amp; Review</span>
            </button>

            {item.status === 'submitted' && (
              <button
                type="button"
                onClick={handleSetUnderReview}
                disabled={processing}
                className="inline-flex items-center px-3 py-2 border border-[#d2dde4] bg-[#ebf1f5] hover:bg-[#d2dde4] text-xs font-bold text-[#010b13] rounded-xl transition cursor-pointer"
              >
                Start Audit
              </button>
            )}
          </div>
        </div>
      </li>

      {/* FULL EVIDENCE AUDIT LIGHTBOX & REVIEW MODAL */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#ffffff] rounded-3xl border border-[#d2dde4] max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#d2dde4] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center shrink-0">
                  {isL3 ? <Star className="w-5 h-5 text-amber-400 fill-current" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
                      {isL3 ? 'Level 3 Trusted Partner Desk' : 'Level 2 Identity KYC Desk'}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      Audit Case
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#010b13] mt-1">
                    Compliance Audit: @{item.user_profiles?.username}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAuditModalOpen(false)
                  setRejecting(false)
                }}
                className="text-[#526371] hover:text-[#010b13] p-1.5 rounded-xl hover:bg-[#ebf1f5] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Details Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#ebf1f5] p-4 rounded-2xl border border-[#d2dde4] text-xs">
              <div>
                <span className="text-[#526371] block text-[10px] uppercase font-mono font-bold">Username</span>
                <strong className="text-[#010b13]">@{item.user_profiles?.username}</strong>
              </div>
              <div>
                <span className="text-[#526371] block text-[10px] uppercase font-mono font-bold">Full Name</span>
                <strong className="text-[#010b13]">{item.user_profiles?.full_name || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-[#526371] block text-[10px] uppercase font-mono font-bold">Current Tier</span>
                <span className="font-bold text-[#010b13]">Tier {item.user_profiles?.verification_level || 1}</span>
              </div>
              <div>
                <span className="text-[#526371] block text-[10px] uppercase font-mono font-bold">Submission Status</span>
                <span className="font-mono uppercase font-bold text-[#010b13]">{item.status}</span>
              </div>
            </div>

            {/* EVIDENCE INSPECTOR SECTION */}
            {!isL3 ? (
              /* Level 2: Side-by-Side Government ID and Selfie */
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#010b13]">
                  Identity Evidence Verification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Document 1: Government ID */}
                  <div className="space-y-2 border border-[#d2dde4] rounded-2xl p-4 bg-[#ebf1f5]/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-[#010b13] flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#526371]" />
                          1. Government-Issued ID
                        </span>
                        {item.signedIdUrl && (
                          <a
                            href={item.signedIdUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-[#010b13] underline hover:opacity-80 inline-flex items-center gap-1"
                          >
                            <span>Open Full</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="bg-white rounded-xl border border-[#d2dde4] overflow-hidden aspect-4/3 flex items-center justify-center relative">
                        {item.signedIdUrl ? (
                          <img
                            src={item.signedIdUrl}
                            alt="Government ID Document"
                            className="w-full h-full object-contain cursor-zoom-in"
                            onClick={() => setActiveImageZoom(item.signedIdUrl || null)}
                          />
                        ) : (
                          <span className="text-xs text-[#526371]">No ID document uploaded</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#526371] block mt-2">
                      Verify: Clear photo, valid expiry, name matches account profile.
                    </span>
                  </div>

                  {/* Document 2: Selfie holding ID & Note */}
                  <div className="space-y-2 border border-[#d2dde4] rounded-2xl p-4 bg-[#ebf1f5]/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-[#010b13] flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-[#526371]" />
                          2. Live Selfie with ID &amp; Note
                        </span>
                        {item.signedSelfieUrl && (
                          <a
                            href={item.signedSelfieUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-[#010b13] underline hover:opacity-80 inline-flex items-center gap-1"
                          >
                            <span>Open Full</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="bg-white rounded-xl border border-[#d2dde4] overflow-hidden aspect-4/3 flex items-center justify-center relative">
                        {item.signedSelfieUrl ? (
                          <img
                            src={item.signedSelfieUrl}
                            alt="Selfie with ID"
                            className="w-full h-full object-contain cursor-zoom-in"
                            onClick={() => setActiveImageZoom(item.signedSelfieUrl || null)}
                          />
                        ) : (
                          <span className="text-xs text-[#526371]">No selfie uploaded</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#526371] block mt-2">
                      Verify: Face matches ID, handwritten note reads &quot;Dealoura + Date + Username&quot;.
                    </span>
                  </div>
                </div>

                {/* Level 2 Verification Checklist */}
                <div className="p-4 rounded-2xl bg-[#ebf1f5] border border-[#d2dde4] space-y-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#526371] block">
                    Officer Compliance Checklist
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chk1}
                      onChange={(e) => setChk1(e.target.checked)}
                      className="rounded border-[#d2dde4] text-[#010b13] focus:ring-0"
                    />
                    <span className="text-[#010b13]">Full name on ID matches registered user profile ({item.user_profiles?.full_name || 'N/A'})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chk2}
                      onChange={(e) => setChk2(e.target.checked)}
                      className="rounded border-[#d2dde4] text-[#010b13] focus:ring-0"
                    />
                    <span className="text-[#010b13]">Face in live selfie matches portrait on Government ID</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chk3}
                      onChange={(e) => setChk3(e.target.checked)}
                      className="rounded border-[#d2dde4] text-[#010b13] focus:ring-0"
                    />
                    <span className="text-[#010b13]">Handwritten note is legible with &quot;Dealoura&quot; and valid date</span>
                  </label>
                </div>
              </div>
            ) : (
              /* Level 3: Account Ownership & Bio Code Verification */
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#010b13]">
                  Level 3 Account Ownership &amp; Quality Audit
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Step 1: Channel URL & Bio Verification */}
                  <div className="p-4 rounded-2xl border border-[#d2dde4] bg-[#ebf1f5]/40 space-y-3">
                    <span className="text-xs font-black text-[#010b13] block">
                      1. Social Account &amp; Bio Code
                    </span>

                    <div className="space-y-1.5 text-xs">
                      <span className="text-[11px] text-[#526371] block">Public Account / Channel Link:</span>
                      {item.account_url ? (
                        <a
                          href={item.account_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 underline hover:text-blue-800 break-all"
                        >
                          <span>{item.account_url}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-red-600 italic">No account URL provided</span>
                      )}
                    </div>

                    <div className="space-y-1 pt-2">
                      <span className="text-[11px] text-[#526371] block">Required Bio Verification Code:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm px-3 py-1 bg-white border border-[#d2dde4] rounded-xl text-[#010b13]">
                          {item.bio_code || 'N/A'}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyBioCode}
                          className="py-1 px-2.5 rounded-lg border border-[#d2dde4] bg-white hover:bg-[#ebf1f5] text-xs font-bold transition flex items-center gap-1"
                        >
                          {copiedBioCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedBioCode ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-[#526371] mt-1">
                        Open the link above and verify that this code appears in the account bio / channel about description.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Creator Studio Analytics Screenshot */}
                  <div className="p-4 rounded-2xl border border-[#d2dde4] bg-[#ebf1f5]/40 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-[#010b13] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          2. Creator Studio Proof
                        </span>
                        {item.signedEvidenceUrl && (
                          <a
                            href={item.signedEvidenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-[#010b13] underline hover:opacity-80 inline-flex items-center gap-1"
                          >
                            <span>Open Full</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="bg-white rounded-xl border border-[#d2dde4] overflow-hidden aspect-4/3 flex items-center justify-center relative">
                        {item.signedEvidenceUrl ? (
                          <img
                            src={item.signedEvidenceUrl}
                            alt="Creator Studio Analytics Proof"
                            className="w-full h-full object-contain cursor-zoom-in"
                            onClick={() => setActiveImageZoom(item.signedEvidenceUrl || null)}
                          />
                        ) : (
                          <span className="text-xs text-[#526371]">No studio screenshot uploaded</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#526371] block mt-2">
                      Verify: Dashboard confirms owner/manager access, subscriber count matches, monetization status in good standing.
                    </span>
                  </div>
                </div>

                {/* Level 3 Verification Checklist */}
                <div className="p-4 rounded-2xl bg-[#ebf1f5] border border-[#d2dde4] space-y-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#526371] block">
                    Level 3 Compliance Checklist
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chk1}
                      onChange={(e) => setChk1(e.target.checked)}
                      className="rounded border-[#d2dde4] text-[#010b13] focus:ring-0"
                    />
                    <span className="text-[#010b13]">Bio verification code is present in public profile description</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chk2}
                      onChange={(e) => setChk2(e.target.checked)}
                      className="rounded border-[#d2dde4] text-[#010b13] focus:ring-0"
                    />
                    <span className="text-[#010b13]">Studio analytics screenshot confirms genuine ownership and permissions</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chk3}
                      onChange={(e) => setChk3(e.target.checked)}
                      className="rounded border-[#d2dde4] text-[#010b13] focus:ring-0"
                    />
                    <span className="text-[#010b13]">No copyright strikes, severe community warnings, or suspicious metric drops</span>
                  </label>
                </div>
              </div>
            )}

            {/* REJECTION FORM SECTION (If rejecting) */}
            {rejecting && (
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-red-950 uppercase tracking-wider">
                    Specify Rejection Grounds
                  </span>
                  <button
                    type="button"
                    onClick={() => setRejecting(false)}
                    className="text-xs text-red-700 hover:text-red-950 font-bold cursor-pointer"
                  >
                    Cancel Rejection
                  </button>
                </div>

                {/* Preset rejection quick chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-red-800 block">
                    Common Rejection Reasons (Click to use):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(isL3 ? PRESET_REJECTIONS_L3 : PRESET_REJECTIONS_L2).map((reason, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRejectNotes(reason)}
                        className="text-[11px] py-1 px-2.5 rounded-lg bg-white border border-red-200 text-red-900 hover:bg-red-100 transition text-left cursor-pointer"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Explain why this submission is rejected so the user can correct it..."
                  className="w-full text-xs rounded-xl border border-red-300 bg-white text-[#010b13] p-3 outline-none focus:border-red-500"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleReject()}
                    disabled={processing || !rejectNotes.trim()}
                    className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {processing ? 'Rejecting...' : 'Confirm Rejection & Notify User'}
                  </button>
                </div>
              </div>
            )}

            {/* APPROVAL & REJECTION ACTIONS */}
            {!rejecting && (
              <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-[#d2dde4]">
                <div>
                  <button
                    type="button"
                    onClick={() => setRejecting(true)}
                    className="py-2.5 px-4 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Reject Submission...
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAuditModalOpen(false)}
                    className="py-2.5 px-4 border border-[#d2dde4] text-[#526371] hover:text-[#010b13] text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={processing}
                    className={`py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs ${
                      isL3
                        ? 'bg-amber-400 hover:bg-amber-500 text-[#010b13]'
                        : 'bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5]'
                    }`}
                  >
                    {isL3 ? <Star className="w-3.5 h-3.5 fill-current" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{processing ? 'Approving...' : isL3 ? 'Approve Level 3 Trusted Partner' : 'Approve Level 2 Verified Seller'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX ZOOM */}
      {activeImageZoom && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setActiveImageZoom(null)}
        >
          <img
            src={activeImageZoom}
            alt="Enlarged Document"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setActiveImageZoom(null)}
            className="absolute top-6 right-6 text-white p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  )
}
