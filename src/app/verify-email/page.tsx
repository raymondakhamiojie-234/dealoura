import Link from 'next/link'
import { resendVerification } from '@/app/actions/auth'
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react'

export default async function VerifyEmailPage(props: { searchParams: Promise<{ email?: string, resent?: string, error?: string }> }) {
  const searchParams = await props.searchParams
  const email = searchParams.email
  const resent = searchParams.resent === 'true'
  const error = searchParams.error

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#ebf1f5] p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-[#ffffff] p-8 shadow-xs border border-[#d2dde4] text-center">
        <div className="w-14 h-14 bg-[#010b13] text-[#ebf1f5] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Mail className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#010b13]">
            Check your email
          </h2>
          <p className="text-xs text-[#526371] mt-2 leading-relaxed">
            We sent a secure verification link to your inbox. Click the link to activate your Dealoura marketplace account before logging in.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs border border-red-200">
            {error}
          </div>
        )}

        {resent && (
          <div className="bg-[#ebf1f5] text-[#010b13] p-3.5 rounded-xl text-xs font-bold border border-[#d2dde4] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#010b13]" />
            <span>A fresh verification link has been sent!</span>
          </div>
        )}

        {email && (
          <form action={resendVerification as any} className="pt-4 border-t border-[#d2dde4]">
            <input type="hidden" name="email" value={email} />
            <p className="text-xs text-[#526371] mb-3">Didn&apos;t receive the email in your inbox or spam?</p>
            <button
              type="submit"
              className="w-full py-2.5 px-4 border border-[#d2dde4] rounded-xl text-xs font-bold text-[#010b13] bg-[#ebf1f5] hover:bg-[#d2dde4] transition cursor-pointer"
            >
              Resend Verification Email
            </button>
          </form>
        )}

        <div className="pt-2">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-1.5 text-[#010b13] hover:underline font-bold text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to login
          </Link>
        </div>
      </div>
    </div>
  )
}
