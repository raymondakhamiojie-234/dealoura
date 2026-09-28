import { createClient } from '@/utils/supabase/server'
import { sendMessage } from '@/app/actions/messaging'
import { redirect, notFound } from 'next/navigation'
import { Paperclip, Send, AlertTriangle } from 'lucide-react'

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
      {/* Middle Column: Chat Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-w-0">
        
        {/* Warning Banner */}
        <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-start rounded-t-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            <strong>Reminder:</strong> communication outside of the website and conducting deals without our escrow agent is FORBIDDEN for your own safety.
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages?.map((msg) => {
            const isMe = msg.sender_id === user.id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-col max-w-[80%]">
                  {!isMe && <span className="text-xs text-gray-400 mb-1 ml-1">{displayUser}</span>}
                  <div className={`px-4 py-3 rounded-2xl ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}>
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                  <span className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-xl">
          <form action={sendMessage} className="flex items-center space-x-2">
            <input type="hidden" name="conversation_id" value={convo.id} />
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              name="content"
              required
              disabled={isBanned}
              placeholder={isBanned ? "You cannot message a banned user." : "Enter your message..."}
              className="flex-1 rounded-full border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isBanned}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

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
