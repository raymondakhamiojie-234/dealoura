'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Success! Redirect to login
    router.push('/login?message=Password+updated+successfully')
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
            Set a new password
          </h1>
          <p className="text-xs text-[#667085]">
            Please enter your new password below
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold text-[#101828]">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E4E7EC] bg-[#F7F9FC] text-[#101828] text-sm focus:bg-white focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/20 outline-none transition placeholder:text-[#667085]"
                placeholder="New password (min 6 characters)"
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#101828] hover:bg-[#18263B] text-white font-bold text-sm shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
