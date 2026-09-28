import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Check your email
        </h2>
        <p className="text-gray-600 mt-2">
          We sent you a verification link. Please check your email to verify your account before logging in.
        </p>
        <div className="mt-6">
          <Link 
            href="/login" 
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  )
}
