'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ActiveConversationLink({ id, username, listingTitle }: { id: string, username: string, listingTitle: string }) {
  const pathname = usePathname()
  const isActive = pathname === `/dashboard/messages/${id}`

  return (
    <li>
      <Link href={`/dashboard/messages/${id}`} className={`block p-4 transition ${isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
              {username}
            </p>
            <p className="text-xs text-gray-500 truncate">{listingTitle}</p>
          </div>
        </div>
      </Link>
    </li>
  )
}
