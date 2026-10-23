import { createClient } from '@/utils/supabase/server'
import { updateProfile, changePassword } from '@/app/actions/profile'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-xs text-gray-500 mt-1">Manage your account information, seller reputation, and listings.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/seller/listings"
            className="inline-flex items-center px-3.5 py-2 border border-gray-200 text-xs font-bold rounded-lg shadow-xs text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            My Listings
          </Link>
          {profile?.username && (
            <Link
              href={`/seller/${profile.username}`}
              className="inline-flex items-center px-3.5 py-2 border border-blue-200 text-xs font-bold rounded-lg shadow-xs text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
            >
              Public Profile
            </Link>
          )}
          <a 
            href="/dashboard/profile/verification" 
            className="inline-flex items-center px-3.5 py-2 border border-transparent text-xs font-bold rounded-lg shadow-xs text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            Verify Account
          </a>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <form action={updateProfile as any} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              defaultValue={profile?.username || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
            />
          </div>
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              defaultValue={profile?.full_name || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Profile
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form action={changePassword as any} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              name="password"
              id="password"
              required
              minLength={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
