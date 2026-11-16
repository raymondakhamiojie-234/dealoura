'use client'

import { useState } from 'react'
import { requestPasswordReset } from '@/app/actions/auth'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await requestPasswordReset(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F9FC] p-4 font-sans text-[#101828]">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 sm:p-10 shadow-xl border border-[#E4E7EC]">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-[#101828] text-white flex items-center justify-center font-black text-sm">
              D
            </span>
            <span className="text-xl font-black text-[#101828] tracking-tight">Dealoura</span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-[#101828]">
            Reset your password
          </h1>
          <p className="text-xs text-[#667085]">
            Enter your email address and we&apos;ll send you a password recovery link
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6 py-4">
            <div className="rounded-2xl bg-emerald-50 p-5 text-center border border-emerald-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#16A36A] mx-auto" />
              <h3 className="text-sm font-bold text-emerald-950">Password recovery email sent</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Check your inbox for instructions to securely reset your password.
              </p>
            </div>
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 font-bold text-xs text-[#101828] hover:text-[#16A36A] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-[#101828]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4E7EC] bg-[#F7F9FC] text-[#101828] text-sm focus:bg-white focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/20 outline-none transition placeholder:text-[#667085]"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#101828] hover:bg-[#18263B] text-white font-bold text-sm shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending recovery link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 font-bold text-xs text-[#667085] hover:text-[#101828] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
