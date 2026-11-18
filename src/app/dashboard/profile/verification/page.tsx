import { createClient } from '@/utils/supabase/server'
import { submitVerification } from '@/app/actions/verification'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Upload, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default async function VerificationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if they already have a verification request
  const { data: existing } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-[#ebf1f5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center text-xs font-bold text-[#526371] hover:text-[#010b13] transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Profile
        </Link>

        {/* Title */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
              Merchant Trust
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">Identity & Asset Verification</h1>
          <p className="text-xs sm:text-sm text-[#526371] mt-1">
            Get the verified merchant badge on your digital listings by verifying your identity or ownership documents.
          </p>
        </div>

        {/* Existing Status Banner */}
        {existing && (
          <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-7 border border-[#d2dde4] shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#010b13] block">Current Verification Status</span>
                  <span className="text-[11px] text-[#526371]">
                    Submitted on {new Date(existing.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-full ${
                  existing.status === 'approved'
                    ? 'bg-[#010b13] text-[#ebf1f5]'
                    : existing.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]'
                }`}
              >
                {existing.status}
              </span>
            </div>

            {existing.admin_notes && (
              <div className="mt-3 p-4 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-xs">
                <p className="font-bold text-[#010b13] mb-1">Compliance Desk Notes:</p>
                <p className="text-[#526371] leading-relaxed">{existing.admin_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Form to submit */}
        {(!existing || existing.status === 'rejected') && (
          <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#010b13]">Submit Verification Evidence</h2>
              <p className="text-xs text-[#526371] mt-1 leading-relaxed">
                Upload a government-issued photo ID (Passport, National ID, Driver&apos;s License) or official ownership screenshot from Google/YouTube Studio. All documents are encrypted and reviewed only by authorized Dealoura compliance officers.
              </p>
            </div>

            <form action={submitVerification as any} className="space-y-5">
              <div>
                <label htmlFor="evidence" className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-2">
                  Document or Screenshot File (JPG, PNG, PDF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="evidence"
                  id="evidence"
                  required
                  accept="image/*,.pdf"
                  className="w-full text-xs text-[#526371] border border-[#d2dde4] rounded-xl p-3 bg-[#ebf1f5]/30 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#010b13] file:text-[#ebf1f5] hover:file:opacity-90 transition cursor-pointer"
                />
              </div>

              <div className="p-4 bg-[#ebf1f5] rounded-xl border border-[#d2dde4] text-[11px] text-[#526371] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#010b13] shrink-0" />
                <span>Verification typically completes within 12 to 24 hours of submission.</span>
              </div>
              
              <button
                type="submit"
                className="py-3 px-6 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#ebf1f5]" />
                <span>Submit Document for Review</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
