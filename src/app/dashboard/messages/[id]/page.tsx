import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import LiveChat from './LiveChat'

export default async function ChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch Conversation
  const { data: convo } = await supabase
    .from('conversations')
    .select(`
      *,
      listings (title, price),
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

  // Simulate Banned status for the spammer (If username contains 'spam' or 'banned')
  const isBanned = otherUser?.toLowerCase().includes('spam') || otherUser?.toLowerCase().includes('banned')
  const displayUser = isBanned ? 'Unknown' : otherUser

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
      <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col p-6 hidden lg:flex items-center text-center">
        <div className="w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-blue-600">
            {displayUser?.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <p className="text-xs text-gray-500 mb-1">Last online 41 minutes ago</p>
        <h3 className="text-xl font-bold text-gray-900">{displayUser}</h3>
        
        {isBanned && (
          <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            (banned)
          </span>
        )}

        <div className="mt-8 w-full border-t border-gray-100 pt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Subject</p>
          <p className="text-sm font-medium text-gray-900">{convo.listings?.title}</p>
          <p className="text-lg font-bold text-blue-600 mt-1">${convo.listings?.price}</p>
        </div>
      </div>
    </>
  )
}
