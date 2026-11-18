'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ActiveConversationLink({ id, username, listingTitle }: { id: string, username: string, listingTitle: string }) {
  const pathname = usePathname()
  const isActive = pathname === `/dashboard/messages/${id}`

  return (
    <li>
      <Link
        href={`/dashboard/messages/${id}`}
        className={`block p-3.5 transition border-l-3 ${
          isActive
            ? 'bg-[#ebf1f5] border-[#010b13]'
            : 'hover:bg-[#ebf1f5]/60 border-transparent'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center font-bold text-xs shrink-0">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold truncate ${isActive ? 'text-[#010b13]' : 'text-[#010b13]'}`}>
              @{username}
            </p>
            <p className="text-[11px] text-[#526371] truncate mt-0.5">{listingTitle}</p>
          </div>
        </div>
      </Link>
    </li>
  )
}
