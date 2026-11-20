'use client'

import { useState } from 'react'
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Lock, 
  Copy, 
  Check, 
  Star, 
  ExternalLink,
  Camera,
  FileText,
  Sparkles
} from 'lucide-react'
import { submitLevel2Verification, submitLevel3Verification } from '@/app/actions/verification'

interface VerificationFormsProps {
  userEmail: string
  username: string
  verificationLevel: number
  isVerified: boolean
  isTrusted: boolean
  completedSales: number
  bioCode: string
  latestL2?: {
    id: string
    status: string
    admin_notes?: string | null
    created_at: string
  } | null
  latestL3?: {
    id: string
    status: string
    admin_notes?: string | null
    created_at: string
  } | null
}

export function VerificationForms({
  userEmail,
  username,
  verificationLevel,
  isVerified,
  isTrusted,
  completedSales,
  bioCode,
  latestL2,
  latestL3,
}: VerificationFormsProps) {
  // Level 2 State
  const [l2Submitting, setL2Submitting] = useState(false)
  const [l2Error, setL2Error] = useState<string | null>(null)
  const [l2Success, setL2Success] = useState(false)
  const [idFileName, setIdFileName] = useState<string | null>(null)
  const [selfieFileName, setSelfieFileName] = useState<string | null>(null)

  // Level 3 State
  const [l3Submitting, setL3Submitting] = useState(false)
  const [l3Error, setL3Error] = useState<string | null>(null)
  const [l3Success, setL3Success] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [studioFileName, setStudioFileName] = useState<string | null>(null)

  const copyBioCode = () => {
    navigator.clipboard.writeText(bioCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleL2Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setL2Submitting(true)
    setL2Error(null)

    const formData = new FormData(e.currentTarget)
    try {
      const res = await submitLevel2Verification(formData)
      if (res?.error) {
        setL2Error(res.error)
        setL2Submitting(false)
      } else {
        setL2Success(true)
        setL2Submitting(false)
        window.location.reload()
      }
    } catch (err: any) {
      setL2Error(err.message || 'Failed to submit verification request.')
      setL2Submitting(false)
    }
  }

  const handleL3Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setL3Submitting(true)
    setL3Error(null)

    const formData = new FormData(e.currentTarget)
    formData.append('bio_code', bioCode)

    try {
      const res = await submitLevel3Verification(formData)
      if (res?.error) {
        setL3Error(res.error)
        setL3Submitting(false)
      } else {
        setL3Success(true)
        setL3Submitting(false)
        window.location.reload()
      }
    } catch (err: any) {
      setL3Error(err.message || 'Failed to submit Level 3 verification.')
      setL3Submitting(false)
    }
  }

  const isL2Pending = latestL2?.status === 'submitted'
  const isL2Approved = verificationLevel >= 2 || isVerified || latestL2?.status === 'verified' || latestL2?.status === 'approved'
  const isL2Rejected = latestL2?.status === 'rejected'

  const isL3Pending = latestL3?.status === 'submitted'
  const isL3Approved = verificationLevel >= 3 || isTrusted || latestL3?.status === 'verified' || latestL3?.status === 'approved'
  const isL3Rejected = latestL3?.status === 'rejected'

  return (
    <div className="space-y-8">
      {/* 3-Tier Visual Roadmap */}
      <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#d2dde4] shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#526371] mb-5">
          Account Trust Hierarchy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Level 1 Status */}
          <div className="p-4 rounded-xl border border-[#010b13] bg-[#010b13] text-[#ebf1f5] flex items-start gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  Tier 1
                </span>
                <span className="text-xs font-bold">Active</span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">Registered Member</h4>
              <p className="text-[11px] text-white/70 mt-0.5">Email verified. Marketplace buying enabled.</p>
            </div>
          </div>

          {/* Level 2 Status */}
          <div className={`p-4 rounded-xl border transition ${
            isL2Approved
              ? 'border-[#010b13] bg-[#010b13] text-[#ebf1f5] shadow-sm'
              : isL2Pending
              ? 'border-amber-400 bg-amber-50/50 text-[#010b13]'
              : 'border-[#d2dde4] bg-[#ebf1f5]/60 text-[#010b13]'
          } flex items-start gap-3`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isL2Approved
                ? 'bg-emerald-500 text-white'
                : isL2Pending
                ? 'bg-amber-500 text-white'
                : 'bg-[#d2dde4] text-[#526371]'
            }`}>
              {isL2Approved ? <CheckCircle2 className="w-5 h-5" /> : isL2Pending ? <Clock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded">
                  Tier 2
                </span>
                <span className="text-xs font-bold">
                  {isL2Approved ? 'Verified' : isL2Pending ? 'Under Review' : 'Recommended'}
                </span>
              </div>
              <h4 className="text-sm font-black mt-1">Verified Seller</h4>
              <p className="text-[11px] opacity-75 mt-0.5">Government ID &amp; Selfie liveness.</p>
            </div>
          </div>

          {/* Level 3 Status */}
          <div className={`p-4 rounded-xl border transition ${
            isL3Approved
              ? 'border-[#010b13] bg-[#010b13] text-amber-300 shadow-sm'
              : isL3Pending
              ? 'border-amber-400 bg-amber-50/50 text-[#010b13]'
              : 'border-[#d2dde4] bg-[#ebf1f5]/60 text-[#010b13]'
          } flex items-start gap-3`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isL3Approved
                ? 'bg-amber-400 text-[#010b13]'
                : isL3Pending
                ? 'bg-amber-500 text-white'
                : 'bg-[#d2dde4] text-[#526371]'
            }`}>
              {isL3Approved ? <Star className="w-5 h-5 fill-current" /> : isL3Pending ? <Clock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded">
                  Tier 3 (Gold)
                </span>
                <span className="text-xs font-bold">
                  {isL3Approved ? 'Trusted Partner' : isL3Pending ? 'In Review' : 'Elite Tier'}
                </span>
              </div>
              <h4 className="text-sm font-black mt-1">Trusted Partner</h4>
              <p className="text-[11px] opacity-75 mt-0.5">Bio code ownership &amp; clean sales track.</p>
            </div>
          </div>
        </div>
      </div>

      {/* LEVEL 1 CARD (Registered) */}
      <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-7 border border-[#d2dde4] shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#010b13]">Level 1 – Registered Member</h3>
              <p className="text-xs text-[#526371]">Basic account security &amp; marketplace identity</p>
            </div>
          </div>
          <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
            Active &amp; Complete
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-[#ebf1f5] border border-[#d2dde4] flex items-center justify-between">
            <span className="text-[#526371]">Registered Email</span>
            <span className="font-mono font-bold text-[#010b13]">{userEmail}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#ebf1f5] border border-[#d2dde4] flex items-center justify-between">
            <span className="text-[#526371]">Escrow Buyer Privileges</span>
            <span className="font-bold text-emerald-700">Unlocked</span>
          </div>
        </div>
      </div>

      {/* LEVEL 2 CARD (Identity Verified Seller) */}
      <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#d2dde4] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#010b13]">Level 2 – Identity Verified Seller</h3>
              <p className="text-xs text-[#526371]">Government photo ID &amp; handwritten liveness photo verification</p>
            </div>
          </div>

          {isL2Approved ? (
            <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-full bg-[#010b13] text-[#ebf1f5]">
              Verified Seller Active
            </span>
          ) : isL2Pending ? (
            <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              In Compliance Review
            </span>
          ) : (
            <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
              Action Required
            </span>
          )}
        </div>

        {/* Existing Status Banner */}
        {latestL2 && (
          <div className={`p-4 rounded-xl border text-xs ${
            isL2Approved
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : isL2Pending
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : 'bg-red-50/70 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span>Latest Submission Status: {latestL2.status.toUpperCase()}</span>
              <span className="font-mono text-[11px] opacity-75" suppressHydrationWarning>
                {new Date(latestL2.created_at).toLocaleDateString()}
              </span>
            </div>
            {latestL2.admin_notes && (
              <p className="mt-1 opacity-90"><span className="font-bold">Compliance Note:</span> {latestL2.admin_notes}</p>
            )}
            {isL2Pending && (
              <p className="mt-1 opacity-80">Our compliance desk is currently reviewing your ID and selfie note. Typical response time is within 24 hours.</p>
            )}
          </div>
        )}

        {/* Form only shown if not approved or if rejected */}
        {(!isL2Approved && !isL2Pending) && (
          <form onSubmit={handleL2Submit} className="space-y-6">
            {l2Error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{l2Error}</span>
              </div>
            )}

            {/* Step 1: ID Document Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13]">
                1. Government-Issued Photo ID <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-[#526371]">
                Upload a clear photo or scan of your Passport, Driver&apos;s License, or National ID Card. All 4 corners must be visible.
              </p>
              <div className="relative border-2 border-dashed border-[#d2dde4] hover:border-[#010b13] rounded-xl p-5 text-center bg-[#ebf1f5]/50 transition cursor-pointer">
                <input
                  type="file"
                  name="id_document"
                  accept="image/png, image/jpeg, image/jpg, application/pdf"
                  required
                  onChange={(e) => setIdFileName(e.target.files?.[0]?.name || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="w-7 h-7 mx-auto text-[#526371] mb-2" />
                <span className="text-xs font-bold text-[#010b13] block">
                  {idFileName ? `Selected: ${idFileName}` : 'Click to select or drag & drop your Government ID'}
                </span>
                <span className="text-[11px] font-mono text-[#526371] mt-1 block">JPG, PNG, or PDF up to 10MB</span>
              </div>
            </div>

            {/* Step 2: Liveness Selfie with Note */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13]">
                2. Liveness Selfie with Handwritten Note <span className="text-red-500">*</span>
              </label>
              <div className="p-3.5 rounded-xl bg-[#ebf1f5] border border-[#d2dde4] text-xs text-[#010b13] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#010b13]" /> Anti-Fraud Security Check:
                </p>
                <p className="text-[#526371] leading-relaxed">
                  Hold your ID document next to your face along with a handwritten note that says:
                </p>
                <div className="p-2 rounded-lg bg-white border border-[#d2dde4] font-mono font-bold text-center text-xs text-[#010b13]" suppressHydrationWarning>
                  &ldquo;Dealoura — {new Date().toISOString().split('T')[0]} — @{username}&rdquo;
                </div>
              </div>

              <div className="relative border-2 border-dashed border-[#d2dde4] hover:border-[#010b13] rounded-xl p-5 text-center bg-[#ebf1f5]/50 transition cursor-pointer">
                <input
                  type="file"
                  name="selfie"
                  accept="image/png, image/jpeg, image/jpg"
                  required
                  onChange={(e) => setSelfieFileName(e.target.files?.[0]?.name || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Camera className="w-7 h-7 mx-auto text-[#526371] mb-2" />
                <span className="text-xs font-bold text-[#010b13] block">
                  {selfieFileName ? `Selected: ${selfieFileName}` : 'Click to upload your Selfie with the handwritten note'}
                </span>
                <span className="text-[11px] font-mono text-[#526371] mt-1 block">High quality JPG or PNG (face must be clearly visible)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={l2Submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#010b13] text-[#ebf1f5] font-bold text-xs uppercase tracking-wider hover:bg-[#18263B] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {l2Submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Encrypting &amp; Submitting to Compliance Desk...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Level 2 Identity Verification</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* LEVEL 3 CARD (Trusted Partner - Gold Tier) */}
      <div className={`rounded-2xl p-6 sm:p-8 border shadow-xs space-y-6 transition ${
        isL3Approved
          ? 'bg-[#ffffff] border-amber-300 ring-2 ring-amber-300/30'
          : !isL2Approved
          ? 'bg-[#ffffff]/80 border-[#d2dde4] opacity-80'
          : 'bg-[#ffffff] border-[#d2dde4]'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#d2dde4] pb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isL3Approved ? 'bg-amber-400 text-[#010b13]' : 'bg-[#010b13] text-[#ebf1f5]'
            }`}>
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#010b13]">Level 3 – Trusted Partner</h3>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded uppercase">
                  Gold Badge
                </span>
              </div>
              <p className="text-xs text-[#526371]">Real-time social media bio verification code + Creator Studio proof</p>
            </div>
          </div>

          {isL3Approved ? (
            <span className="text-xs font-mono font-black uppercase px-3.5 py-1.5 rounded-full bg-amber-400 text-[#010b13] shadow-xs flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Trusted Partner</span>
            </span>
          ) : isL3Pending ? (
            <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              In Review
            </span>
          ) : !isL2Approved ? (
            <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#ebf1f5] text-[#526371] border border-[#d2dde4] flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Locked</span>
            </span>
          ) : (
            <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#010b13] text-[#ebf1f5]">
              Eligible to Apply
            </span>
          )}
        </div>

        {/* Locked state if Level 2 is not completed */}
        {!isL2Approved && (
          <div className="p-6 rounded-xl bg-[#ebf1f5] border border-[#d2dde4] text-center space-y-2">
            <Lock className="w-8 h-8 mx-auto text-[#526371]" />
            <h4 className="text-sm font-bold text-[#010b13]">Prerequisite Required</h4>
            <p className="text-xs text-[#526371] max-w-md mx-auto">
              You must complete <strong>Level 2 Identity Verification</strong> above before applying for Trusted Partner status.
            </p>
          </div>
        )}

        {/* Eligible / Application Form */}
        {isL2Approved && !isL3Approved && !isL3Pending && (
          <form onSubmit={handleL3Submit} className="space-y-6">
            {l3Error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{l3Error}</span>
              </div>
            )}

            {/* Step 1: Real-time Bio Verification Code */}
            <div className="p-5 rounded-xl bg-[#ebf1f5] border border-[#d2dde4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#010b13]">
                  Step 1: Bio Ownership Verification Code
                </span>
                <span className="text-[11px] font-mono text-[#526371]">Instant Proof</span>
              </div>
              <p className="text-xs text-[#526371] leading-relaxed">
                Copy this unique code and temporarily paste it into the <strong>Bio or Channel Description</strong> of the social account you sell. Our compliance officer inspects the link to verify you control the account.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-white border border-[#d2dde4] rounded-xl font-mono font-black text-sm text-[#010b13] tracking-widest text-center shadow-xs">
                  {bioCode}
                </div>
                <button
                  type="button"
                  onClick={copyBioCode}
                  className="px-4 py-3 bg-[#010b13] text-[#ebf1f5] rounded-xl font-bold text-xs hover:bg-[#18263B] transition flex items-center gap-1.5 shrink-0"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Step 2: Account URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13]">
                Step 2: Social Account URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="account_url"
                required
                placeholder="https://youtube.com/@yourchannel or https://instagram.com/handle"
                className="w-full px-4 py-3 rounded-xl border border-[#d2dde4] bg-white text-xs font-mono text-[#010b13] focus:outline-none focus:border-[#010b13]"
              />
            </div>

            {/* Step 3: Creator Studio Analytics Screenshot */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#010b13]">
                Step 3: Creator Studio / Analytics Proof <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-[#526371]">
                Upload a screenshot from inside YouTube Studio, Meta Business Suite, or TikTok Analytics showing the channel name and monetization standing.
              </p>
              <div className="relative border-2 border-dashed border-[#d2dde4] hover:border-[#010b13] rounded-xl p-5 text-center bg-[#ebf1f5]/50 transition cursor-pointer">
                <input
                  type="file"
                  name="studio_proof"
                  accept="image/png, image/jpeg, image/jpg, application/pdf"
                  required
                  onChange={(e) => setStudioFileName(e.target.files?.[0]?.name || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Sparkles className="w-7 h-7 mx-auto text-[#526371] mb-2" />
                <span className="text-xs font-bold text-[#010b13] block">
                  {studioFileName ? `Selected: ${studioFileName}` : 'Click to select or drag & drop Creator Studio screenshot'}
                </span>
                <span className="text-[11px] font-mono text-[#526371] mt-1 block">JPG or PNG proof</span>
              </div>
            </div>

            {/* Step 4: Escrow Track Record Counter */}
            <div className="p-4 rounded-xl bg-[#ebf1f5] border border-[#d2dde4] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#010b13] block">Completed Escrow Transactions</span>
                <span className="text-[#526371] text-[11px]">Recommended benchmark: 3+ successful sales</span>
              </div>
              <span className="font-mono font-black text-sm px-3 py-1 rounded-lg bg-white border border-[#d2dde4] text-[#010b13]">
                {completedSales} sales
              </span>
            </div>

            <button
              type="submit"
              disabled={l3Submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#010b13] font-black text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {l3Submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#010b13] border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Level 3 Verification...</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 fill-current" />
                  <span>Submit for Trusted Partner Status</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Existing Status if L3 is pending or approved */}
        {isL3Approved && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <Star className="w-6 h-6 fill-current text-amber-500 shrink-0" />
            <div>
              <p className="font-bold">Trusted Partner Status Active</p>
              <p className="text-[11px] text-amber-800">
                You enjoy priority listing placement, instant listing approvals, and the official Gold Badge across all Dealoura channels.
              </p>
            </div>
          </div>
        )}

        {isL3Pending && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Level 3 Ownership Verification Under Review</p>
              <p className="text-[11px] text-amber-800">
                Our compliance officers are verifying your social bio code and Creator Studio analytics. Response expected within 24 hours.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
