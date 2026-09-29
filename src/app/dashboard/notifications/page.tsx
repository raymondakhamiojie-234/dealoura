import { createClient } from '@/utils/supabase/server'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        {notifications && notifications.some(n => !n.is_read) && (
          <form action={markAllNotificationsAsRead as any}>
            <button type="submit" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Mark all as read
            </button>
          </form>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {notifications && notifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notifications.map((n) => (
              <li key={n.id} className={`p-6 ${!n.is_read ? 'bg-indigo-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-lg ${!n.is_read ? 'font-bold' : 'font-medium'} text-gray-900`}>{n.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2 items-end">
                    {n.link && (
                      <Link href={n.link} className="text-sm text-indigo-600 hover:underline">
                        View Details
                      </Link>
                    )}
                    {!n.is_read && (
                      <form action={(async () => {
                        'use server'
                        await markNotificationAsRead(n.id)
                      }) as any}>
                        <button type="submit" className="text-xs text-gray-500 hover:text-gray-900">
                          Mark read
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-gray-500">
            You have no notifications.
          </div>
        )}
      </div>
    </div>
  )
}
