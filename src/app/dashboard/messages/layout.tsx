import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, ShieldCheck } from 'lucide-react'
import ActiveConversationLink from './ActiveConversationLink' // We will create this client component

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      updated_at,
      buyer_id,
      seller_id,
      listings (title),
      buyer:buyer_id (username),
      seller:seller_id (username)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  return (
    <div className="max-w-[1600px] mx-auto w-full h-[calc(100vh-80px)] p-4 flex gap-4">
      
      {/* 1. Left Sidebar: Conversations List */}
      <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden hidden md:flex">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <h2 className="font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
            Messages
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations && conversations.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {conversations.map((convo) => {
                const isBuyer = convo.buyer_id === user.id
                const seller = convo.seller as any;
                const buyer = convo.buyer as any;
                const otherUser = isBuyer ? seller?.username : buyer?.username

                return (
                  <ActiveConversationLink 
                    key={convo.id} 
                    id={convo.id} 
                    username={otherUser || 'Unknown'} 
                    listingTitle={(convo.listings as any)?.title || 'Unknown Item'}
                  />
                )
              })}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">
              No conversations yet.
            </div>
          )}
        </div>

        {/* Pinned Escrow Agent Button */}
        <div className="p-4 border-t border-gray-200 bg-slate-900 mt-auto">
          <Link href="/dashboard/messages/escrow" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold group-hover:text-blue-400 transition">Escrow Agent</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 2 & 3. Middle and Right Columns (Children) */}
      <div className="flex-1 flex gap-4 min-w-0">
        {children}
      </div>

    </div>
  )
}
