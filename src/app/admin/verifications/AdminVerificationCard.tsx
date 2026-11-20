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
  AlertCircle
} from 'lucide-react'
import { updateVerificationStatus } from '@/app/actions/verification'

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
  } | null
  signedIdUrl?: string | null
  signedSelfieUrl?: string | null
  signedEvidenceUrl?: string | null
}

export function AdminVerificationCard({ item }: { item: AdminVerificationItem }) {
  const [rejecting, setRejecting] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isL3 = item.verification_type === 'level_3_ownership'

  const handleApprove = async () => {
    setProcessing(true)
    setErrorMessage(null)
    try {
      const level = isL3 ? 3 : 2
      const notes = isL3 
        ? 'Approved as Level 3 Trusted Partner by Dealoura Compliance.' 
        : 'Approved as Level 2 Verified Seller by Dealoura Compliance.'
      
      const res = await updateVerificationStatus(item.id, 'verified', notes, level)
      if (res?.error) {
        setErrorMessage(res.error)
        setProcessing(false)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Approval failed.')
      setProcessing(false)
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setErrorMessage(null)
    try {
      const res = await updateVerificationStatus(
        item.id, 
        'rejected', 
        rejectNotes.trim() || 'Document does not meet Dealoura verification criteria or was illegible.'
      )
      if (res?.error) {
        setErrorMessage(res.error)
        setProcessing(false)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Rejection failed.')
      setProcessing(false)
    }
  }

  return (
    <li className="p-6 hover:bg-[#ebf1f5]/30 transition space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* User and Tier Info */}
        <div className="space-y-2">
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
          </div>

          <span className="text-[11px] font-mono text-[#526371] block" suppressHydrationWarning>
            Submitted: {new Date(item.created_at).toLocaleString()}
          </span>

          {/* Level 2 Proof Files */}
          {!isL3 && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {item.signedIdUrl ? (
                <a
                  href={item.signedIdUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ebf1f5] border border-[#d2dde4] text-xs font-bold text-[#010b13] hover:bg-[#d2dde4] transition"
                >
                  <FileText className="w-3.5 h-3.5 text-[#526371]" />
                  <span>1. View Government ID</span>
                  <ExternalLink className="w-3 h-3 text-[#526371]" />
                </a>
              ) : null}

              {item.signedSelfieUrl ? (
                <a
                  href={item.signedSelfieUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ebf1f5] border border-[#d2dde4] text-xs font-bold text-[#010b13] hover:bg-[#d2dde4] transition"
                >
                  <Camera className="w-3.5 h-3.5 text-[#526371]" />
                  <span>2. View Selfie with Note</span>
                  <ExternalLink className="w-3 h-3 text-[#526371]" />
                </a>
              ) : null}

              {!item.signedIdUrl && !item.signedSelfieUrl && item.signedEvidenceUrl && (
                <a
                  href={item.signedEvidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ebf1f5] border border-[#d2dde4] text-xs font-bold text-[#010b13] hover:bg-[#d2dde4] transition"
                >
                  <FileText className="w-3.5 h-3.5 text-[#526371]" />
                  <span>View Evidence Document</span>
                  <ExternalLink className="w-3 h-3 text-[#526371]" />
                </a>
              )}
            </div>
          )}

          {/* Level 3 Ownership Proof */}
          {isL3 && (
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#010b13]">Account Link:</span>
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

              <div className="flex items-center gap-2">
                <span className="font-bold text-[#010b13]">Expected Bio Code:</span>
                <span className="font-mono font-black px-2 py-0.5 rounded bg-[#ebf1f5] border border-[#d2dde4] text-[#010b13]">
                  {item.bio_code || 'N/A'}
                </span>
                <span className="text-[11px] text-[#526371]">(Check if this code is in the bio link above)</span>
              </div>

              {item.signedEvidenceUrl && (
                <div className="pt-1">
                  <a
                    href={item.signedEvidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>View Creator Studio Screenshot Proof</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {!rejecting ? (
            <>
              <button
                type="button"
                onClick={handleApprove}
                disabled={processing}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                  isL3 
                    ? 'bg-amber-400 hover:bg-amber-500 text-[#010b13]' 
                    : 'bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5]'
                }`}
              >
                {isL3 ? <Star className="w-3.5 h-3.5 fill-current" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>{processing ? 'Processing...' : isL3 ? 'Approve Level 3' : 'Approve Level 2'}</span>
              </button>

              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={processing}
                className="inline-flex items-center px-4 py-2 border border-[#d2dde4] hover:bg-red-50 text-xs font-bold text-red-600 rounded-xl transition cursor-pointer"
              >
                Reject...
              </button>
            </>
          ) : (
            <form onSubmit={handleReject} className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <input
                type="text"
                placeholder="Reason (e.g. illegible photo, bio code missing)"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                required
                className="px-3 py-2 border border-red-300 rounded-xl text-xs bg-white text-[#010b13] focus:outline-none focus:border-red-500 w-64"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Confirm Reject
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="px-3 py-2 border border-[#d2dde4] hover:bg-[#ebf1f5] text-xs font-bold text-[#526371] rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </li>
  )
}
