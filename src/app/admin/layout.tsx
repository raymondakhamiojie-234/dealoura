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
      <div className="min-h-screen bg-[#ebf1f5] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-[#010b13] text-[#ebf1f5] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#010b13]">403 — Restricted Area</h1>
          <p className="text-xs text-[#526371] leading-relaxed">
            This portal is restricted strictly to Dealoura administrators and authorized escrow compliance officers.
          </p>

          <div className="bg-[#ebf1f5] border border-[#d2dde4] rounded-xl p-4 text-xs text-[#526371] text-left">
            <p className="font-bold text-[#010b13] mb-1">Site Operator Notice</p>
            <p>
              To grant access, assign the <strong>admin</strong> role to this user account in the <code className="bg-[#ffffff] px-1 py-0.5 rounded font-mono text-[#010b13] border border-[#d2dde4]">user_profiles</code> database table.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ebf1f5]">
      {/* Admin Top Navigation */}
      <header className="bg-[#010b13] border-b border-[#18263B] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand & Admin Tag */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 text-[#ebf1f5] font-black text-lg tracking-tight">
                <span>Dealoura</span>
              </Link>
              <span className="bg-[#18263B] text-[#ebf1f5] text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border border-[#d2dde4]/20">
                Staff Desk
              </span>
            </div>

            {/* Middle: Admin Navigation Links */}
            <AdminNavLinks />

            {/* Right: Current Admin & Exit */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#ebf1f5]">@{profile.username}</p>
                <p className="text-[10px] text-[#526371] font-mono uppercase">Administrator</p>
              </div>
              <Link
                href="/"
                className="text-xs font-bold text-[#ebf1f5] hover:bg-[#18263B] bg-[#010b13] py-1.5 px-3 rounded-xl border border-[#d2dde4]/30 transition"
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
