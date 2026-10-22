import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert, ShieldCheck, LayoutDashboard, RefreshCw, CheckSquare, FileText, AlertTriangle, ArrowLeft } from 'lucide-react'
import AdminNavLinks from './AdminNavLinks'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify Role in user_profiles
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username, role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // If not admin, show 403 Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">403 - Access Denied</h1>
          <p className="text-sm text-gray-600">
            This portal is restricted strictly to Dealoura administrators and authorized escrow staff.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 text-left">
            <p className="font-bold mb-1">Are you the site owner?</p>
            <p>
              Run the query in <code className="bg-amber-100 px-1 rounded font-semibold">schema-phase10-admin.sql</code> inside your Supabase SQL Editor to assign the <strong>admin</strong> role to your email.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Top Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand & Admin Tag */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 text-white font-black text-lg tracking-tight">
                <span className="text-blue-500">Dealoura</span>
              </Link>
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-blue-500/30">
                Staff Portal
              </span>
            </div>

            {/* Middle: Admin Navigation Links */}
            <AdminNavLinks />

            {/* Right: Current Admin & Exit */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">@{profile.username}</p>
                <p className="text-[10px] text-blue-400 font-semibold uppercase">Administrator</p>
              </div>
              <Link
                href="/"
                className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 py-1.5 px-3 rounded-lg border border-slate-700 transition"
              >
                Exit to Site &rarr;
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
