'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { sendMessage } from '@/app/actions/messaging'
import { Paperclip, Send, AlertTriangle, ShieldCheck } from 'lucide-react'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: {
    username?: string
  }
}

interface LiveChatProps {
  initialMessages: Message[]
  conversationId: string
  currentUserId: string
  displayUser: string
  isBanned: boolean
}

export default function LiveChat({
  initialMessages,
  conversationId,
  currentUserId,
  displayUser,
  isBanned,
}: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || [])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom whenever messages update
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom('auto')
  }, [])

  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages])

  // Real-time listener + Polling Fallback
  useEffect(() => {
    // 1. Supabase WebSocket Channel for instant updates
    const channel = supabase
      .channel(`chat_room_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev
            }
            const filtered = prev.filter(
              (m) =>
                !(
                  m.id.startsWith('temp-') &&
                  m.sender_id === newMsg.sender_id &&
                  m.content === newMsg.content
                )
            )
            return [...filtered, newMsg]
          })
        }
      )
      .subscribe()

    // 2. Polling fallback every 2.5 seconds
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(username)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (data && !error) {
        setMessages((prev) => {
          if (
            data.length !== prev.length ||
            (data.length > 0 && prev.length > 0 && data[data.length - 1].id !== prev[prev.length - 1].id)
          ) {
            return data
          }
          return prev
        })
      }
    }, 2500)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [conversationId, supabase])

  // Handle Send
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!inputText.trim() || isSending || isBanned) return

    const messageText = inputText.trim()
    setInputText('')
    setIsSending(true)

    // Optimistic UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: messageText,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMessage])

    try {
      const formData = new FormData()
      formData.append('conversation_id', conversationId)
      formData.append('content', messageText)

      const result = await sendMessage(formData)
      if (result?.error) {
        console.error('Error sending message:', result.error)
        // Rollback optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex-1 bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] flex flex-col min-w-0 h-full overflow-hidden">
      {/* Warning Banner */}
      <div className="bg-[#010b13] px-4 py-2.5 text-[#ebf1f5] flex items-center justify-between text-xs border-b border-[#18263B]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#ebf1f5]" />
          <span>
            <strong>Dealoura Escrow Protection:</strong> Never pay off-platform or share credentials directly.
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#526371] uppercase hidden sm:inline">Protected Chat</span>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col max-w-[85%] sm:max-w-[75%]">
                {!isMe && (
                  <span className="text-[10px] font-mono font-bold text-[#526371] mb-1 ml-1">
                    @{displayUser}
                  </span>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-[#010b13] text-[#ebf1f5] rounded-br-xs'
                      : 'bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4] rounded-bl-xs'
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className={`text-[10px] font-mono text-[#526371] mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-[#ffffff] border-t border-[#d2dde4]">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isBanned}
            placeholder={isBanned ? 'You cannot message a suspended user.' : 'Type your message or negotiate terms...'}
            className="flex-1 rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/40 px-4 py-2.5 text-xs text-[#010b13] focus:border-[#010b13] focus:bg-[#ffffff] outline-none transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isBanned || !inputText.trim() || isSending}
            className="p-2.5 bg-[#010b13] text-[#ebf1f5] rounded-xl hover:bg-[#18263B] transition disabled:opacity-50 shadow-xs cursor-pointer shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
