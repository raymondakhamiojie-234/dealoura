'use client'

import { Suspense, useState } from 'react'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { GoogleSignInButton } from '@/components/google-sign-in-button'

function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || searchParams.get('next') || '/'

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
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
            Create an account
          </h1>
          <p className="text-xs text-[#667085]">
            Join the secure digital asset escrow marketplace
          </p>
        </div>

        {/* 1-Click Google OAuth */}
        <div className="pt-1">
          <GoogleSignInButton text="Sign up with Google" />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E4E7EC] w-full" />
          <span className="bg-white px-3 text-[11px] text-[#667085] uppercase tracking-wider font-mono">
            or register with email
          </span>
          <div className="border-t border-[#E4E7EC] w-full" />
        </div>
        
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Hidden redirect target */}
          <input type="hidden" name="redirect" value={redirectUrl} />
          
          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-xs font-bold text-[#101828]">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4E7EC] bg-[#F7F9FC] text-[#101828] text-sm focus:bg-white focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/20 outline-none transition placeholder:text-[#667085]"
                placeholder="creator_handle"
              />
            </div>
          </div>

          {/* Email Address */}
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

          {/* Password with toggle */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold text-[#101828]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E4E7EC] bg-[#F7F9FC] text-[#101828] text-sm focus:bg-white focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/20 outline-none transition placeholder:text-[#667085]"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#667085] leading-relaxed pt-1">
            By creating an account, you agree to Dealoura&apos;s{' '}
            <Link href="/terms" className="text-[#101828] underline font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#101828] underline font-medium">
              Privacy Policy
            </Link>.
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-[#667085] pt-2 border-t border-[#E4E7EC]">
          Already have an account?{' '}
          <Link
            href={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="font-bold text-[#16A36A] hover:underline"
          >
            Sign in
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
          <div className="w-6 h-6 border-2 border-[#16A36A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
