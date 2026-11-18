import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, ShieldCheck } from 'lucide-react'
import ActiveConversationLink from './ActiveConversationLink'

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
    <div className="bg-[#ebf1f5] min-h-[calc(100vh-70px)] p-4 sm:p-6">
      <div className="max-w-[1500px] mx-auto w-full h-[calc(100vh-130px)] flex gap-4">
        
        {/* 1. Left Sidebar: Conversations List */}
        <div className="w-80 bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] flex flex-col overflow-hidden hidden md:flex shrink-0">
          <div className="p-4 border-b border-[#d2dde4] bg-[#ebf1f5]/50 flex items-center justify-between">
            <h2 className="font-black text-sm text-[#010b13] flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-[#010b13]" />
              Dealoura Messages
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
              {conversations?.length || 0}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations && conversations.length > 0 ? (
              <ul className="divide-y divide-[#d2dde4]">
                {conversations.map((convo) => {
                  const isBuyer = convo.buyer_id === user.id
                  const seller = convo.seller as any
                  const buyer = convo.buyer as any
                  const otherUser = isBuyer ? seller?.username : buyer?.username

                  return (
                    <ActiveConversationLink 
                      key={convo.id} 
                      id={convo.id} 
                      username={otherUser || 'User'} 
                      listingTitle={(convo.listings as any)?.title || 'Digital Asset'}
                    />
                  )
                })}
              </ul>
            ) : (
              <div className="p-6 text-center text-xs text-[#526371]">
                No conversations yet. Inquire or make an offer on any listing to start.
              </div>
            )}
          </div>

          {/* Pinned Escrow Agent Button */}
          <div className="p-3.5 border-t border-[#18263B] bg-[#010b13] mt-auto">
            <Link href="/dashboard/messages/escrow" className="flex items-center space-x-3 group">
              <div className="relative shrink-0">
                <div className="w-9 h-9 bg-[#18263B] rounded-xl flex items-center justify-center text-[#ebf1f5] border border-[#d2dde4]/20">
                  <ShieldCheck className="w-5 h-5 text-[#ebf1f5]" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#010b13] rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#ebf1f5] font-extrabold text-xs group-hover:text-[#ebf1f5]/80 transition truncate">
                  Escrow Officer Desk
                </p>
                <p className="text-[10px] font-mono text-[#526371] uppercase">Official Support • Online</p>
              </div>
            </Link>
          </div>
        </div>

        {/* 2 & 3. Middle and Right Columns (Children) */}
        <div className="flex-1 flex gap-4 min-w-0 h-full">
          {children}
        </div>

      </div>
    </div>
  )
}
