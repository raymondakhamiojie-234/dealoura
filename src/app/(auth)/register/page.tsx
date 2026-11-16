'use client'

import { Suspense, useState } from 'react'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react'
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#ebf1f5] p-4 font-sans text-[#010b13]">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 sm:p-10 shadow-xl border border-[#d2dde4]">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-[#010b13] text-[#ebf1f5] flex items-center justify-center font-black text-sm">
              D
            </span>
            <span className="text-xl font-black text-[#010b13] tracking-tight">Dealoura</span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-[#010b13]">
            Create an account
          </h1>
          <p className="text-xs text-[#526371]">
            Join the secure digital asset escrow marketplace
          </p>
        </div>

        {/* 1-Click Google OAuth */}
        <div className="pt-1">
          <GoogleSignInButton text="Sign up with Google" />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#d2dde4] w-full" />
          <span className="bg-white px-3 text-[11px] text-[#526371] uppercase tracking-wider font-mono">
            or register with email
          </span>
          <div className="border-t border-[#d2dde4] w-full" />
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
            <label htmlFor="username" className="block text-xs font-bold text-[#010b13]">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#526371] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm focus:bg-white focus:border-[#010b13] focus:ring-2 focus:ring-[#010b13]/10 outline-none transition placeholder:text-[#526371]"
                placeholder="creator_handle"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold text-[#010b13]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#526371] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm focus:bg-white focus:border-[#010b13] focus:ring-2 focus:ring-[#010b13]/10 outline-none transition placeholder:text-[#526371]"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Password with toggle */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold text-[#010b13]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#526371] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm focus:bg-white focus:border-[#010b13] focus:ring-2 focus:ring-[#010b13]/10 outline-none transition placeholder:text-[#526371]"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526371] hover:text-[#010b13] p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#526371] leading-relaxed pt-1">
            By creating an account, you agree to Dealoura&apos;s{' '}
            <Link href="/terms" className="text-[#010b13] underline font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#010b13] underline font-medium">
              Privacy Policy
            </Link>.
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#010b13] hover:bg-[#0a1722] text-[#ebf1f5] font-bold text-sm shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
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

        <div className="text-center text-xs text-[#526371] pt-2 border-t border-[#d2dde4]">
          Already have an account?{' '}
          <Link
            href={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="font-bold text-[#010b13] hover:underline"
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
        <div className="flex min-h-screen items-center justify-center bg-[#ebf1f5]">
          <div className="w-6 h-6 border-2 border-[#010b13] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
