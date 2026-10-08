import Link from 'next/link'
import { resendVerification } from '@/app/actions/auth'

export default async function VerifyEmailPage(props: { searchParams: Promise<{ email?: string, resent?: string, error?: string }> }) {
  const searchParams = await props.searchParams
  const email = searchParams.email
  const resent = searchParams.resent === 'true'
  const error = searchParams.error

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Check your email
        </h2>
        <p className="text-gray-600">
          We sent you a verification link. Please check your email to verify your account before logging in.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {resent && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm font-medium">
            A new verification email has been sent!
          </div>
        )}

        {email && (
          <form action={resendVerification as any} className="pt-4 border-t border-gray-100">
            <input type="hidden" name="email" value={email} />
            <p className="text-sm text-gray-500 mb-3">Didn't receive the email?</p>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Resend Verification Email
            </button>
          </form>
        )}

        <div className="pt-2">
          <Link 
            href="/login" 
            className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
          >
            &larr; Return to login
          </Link>
        </div>
      </div>
    </div>
  )
}
