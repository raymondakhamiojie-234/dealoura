import { createClient } from '@/utils/supabase/server'
import { updateProfile, changePassword } from '@/app/actions/profile'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, ShieldCheck, KeyRound, ExternalLink, Tag } from 'lucide-react'

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
    <div className="min-h-screen bg-[#ebf1f5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#d2dde4] pb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
                Account Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">Your Profile & Settings</h1>
            <p className="text-xs sm:text-sm text-[#526371] mt-1">
              Manage your marketplace identity, password credentials, and merchant verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/seller/listings"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#d2dde4] bg-[#ffffff] text-xs font-bold text-[#010b13] rounded-xl hover:bg-[#ebf1f5] transition"
            >
              <Tag className="w-3.5 h-3.5" /> My Listings
            </Link>
            {profile?.username && (
              <Link
                href={`/seller/${profile.username}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#d2dde4] bg-[#ffffff] text-xs font-bold text-[#010b13] rounded-xl hover:bg-[#ebf1f5] transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Public Profile
              </Link>
            )}
            <Link 
              href="/dashboard/profile/verification" 
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#010b13] hover:bg-[#18263B] text-xs font-bold text-[#ebf1f5] rounded-xl transition shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#ebf1f5]" /> Verify Account
            </Link>
          </div>
        </div>

        {/* Profile Information Form */}
        <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-[#d2dde4] pb-4">
            <div className="p-2.5 bg-[#010b13] text-[#ebf1f5] rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#010b13]">Public Profile Details</h2>
              <p className="text-xs text-[#526371]">Visible to buyers and sellers during marketplace deals.</p>
            </div>
          </div>

          <form action={updateProfile as any} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                defaultValue={profile?.username || ''}
                className="w-full text-xs font-bold rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="full_name" className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                id="full_name"
                defaultValue={profile?.full_name || ''}
                className="w-full text-xs font-medium rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#d2dde4] shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-[#d2dde4] pb-4">
            <div className="p-2.5 bg-[#010b13] text-[#ebf1f5] rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#010b13]">Change Account Password</h2>
              <p className="text-xs text-[#526371]">Ensure your account is protected with a strong passphrase.</p>
            </div>
          </div>

          <form action={changePassword as any} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#010b13] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                minLength={6}
                placeholder="At least 6 characters..."
                className="w-full text-xs font-mono rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 text-[#010b13] px-3.5 py-2.5 focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
