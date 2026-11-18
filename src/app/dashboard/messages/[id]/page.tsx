import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import LiveChat from './LiveChat'

export default async function ChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch Conversation
  const { data: convo } = await supabase
    .from('conversations')
    .select(`
      *,
      listings (title, price, platform),
      buyer:buyer_id (username),
      seller:seller_id (username)
    `)
    .eq('id', params.id)
    .single()

  if (!convo) notFound()
  if (convo.buyer_id !== user.id && convo.seller_id !== user.id) notFound()

  // Fetch Messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:sender_id(username)')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  const isBuyer = convo.buyer_id === user.id
  const otherUser = isBuyer ? convo.seller?.username : convo.buyer?.username

  // Simulate Banned status for spammer (If username contains 'spam' or 'banned')
  const isBanned = otherUser?.toLowerCase().includes('spam') || otherUser?.toLowerCase().includes('banned')
  const displayUser = isBanned ? 'Suspended User' : otherUser

  return (
    <>
      {/* Middle Column: Real-time Live Chat Area */}
      <LiveChat
        initialMessages={messages || []}
        conversationId={convo.id}
        currentUserId={user.id}
        displayUser={displayUser || 'User'}
        isBanned={isBanned}
      />

      {/* Right Column: User Profile context */}
      <div className="w-68 bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] flex flex-col p-6 hidden lg:flex items-center text-center shrink-0">
        <div className="w-20 h-20 rounded-2xl bg-[#010b13] text-[#ebf1f5] flex items-center justify-center mb-3 shadow-xs">
          <span className="text-2xl font-black font-mono">
            {displayUser?.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <h3 className="text-base font-black text-[#010b13]">@{displayUser}</h3>
        <p className="text-[11px] font-mono text-[#526371] mt-0.5">
          {isBuyer ? 'Channel Seller' : 'Interested Buyer'}
        </p>
        
        {isBanned && (
          <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-800">
            Account Suspended
          </span>
        )}

        <div className="mt-6 w-full border-t border-[#d2dde4] pt-5 text-left space-y-2">
          <span className="text-[10px] font-mono uppercase font-bold text-[#526371] block">Referenced Asset</span>
          <p className="text-xs font-bold text-[#010b13] leading-snug line-clamp-2">{convo.listings?.title}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
              {convo.listings?.platform || 'Asset'}
            </span>
            <span className="text-sm font-black font-mono text-[#010b13]">${convo.listings?.price}</span>
          </div>
        </div>

        <div className="mt-auto w-full pt-4 border-t border-[#d2dde4]">
          <p className="text-[10px] text-[#526371] leading-relaxed">
            All conversations are logged for dispute resolution and buyer/seller protection.
          </p>
        </div>
      </div>
    </>
  )
}
