import { createClient } from '@/utils/supabase/server'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, CheckCircle2, ExternalLink } from 'lucide-react'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#ebf1f5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#d2dde4] pb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
                Inbox & Activity
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#010b13] tracking-tight">Notifications</h1>
            <p className="text-xs sm:text-sm text-[#526371] mt-1">
              Escrow updates, offer responses, credential verifications, and system alerts.
            </p>
          </div>

          {notifications && notifications.some(n => !n.is_read) && (
            <form action={markAllNotificationsAsRead as any}>
              <button
                type="submit"
                className="text-xs font-bold text-[#010b13] underline hover:opacity-80 transition cursor-pointer"
              >
                Mark all as read
              </button>
            </form>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] overflow-hidden divide-y divide-[#d2dde4]">
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-6 transition ${
                  !n.is_read ? 'bg-[#ebf1f5]/60' : 'bg-[#ffffff]'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#010b13]" />
                      )}
                      <h3 className={`text-sm ${!n.is_read ? 'font-black' : 'font-bold'} text-[#010b13]`}>
                        {n.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#526371] leading-relaxed">{n.message}</p>
                    <span className="text-[10px] font-mono text-[#526371] block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {n.link && (
                      <Link
                        href={n.link}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#010b13] underline"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {!n.is_read && (
                      <form
                        action={(async () => {
                          'use server'
                          await markNotificationAsRead(n.id)
                        }) as any}
                      >
                        <button
                          type="submit"
                          className="text-[11px] font-bold text-[#526371] hover:text-[#010b13] px-2.5 py-1 rounded-lg border border-[#d2dde4] bg-[#ffffff] hover:bg-[#ebf1f5] transition cursor-pointer"
                        >
                          Mark read
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-[#526371] space-y-3">
              <Bell className="w-10 h-10 text-[#526371] mx-auto" />
              <p className="font-bold text-[#010b13]">You have no notifications yet.</p>
              <p className="text-[11px] text-[#526371]">When buyers make offers or escrow status advances, updates will appear here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
