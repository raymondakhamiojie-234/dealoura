'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { sendMessage } from '@/app/actions/messaging'
import { Paperclip, Send, AlertTriangle } from 'lucide-react'

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
            // Avoid duplicate if message ID exists
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev
            }
            // Check if there was an optimistic message with same text & sender
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

    // 2. Polling fallback every 2.5 seconds (ensures auto-refresh even if websockets are blocked or realtime is disabled in DB)
    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(username)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (data && !error) {
        setMessages((prev) => {
          // Only update if count or IDs changed to prevent unnecessary re-renders
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
      // Direct insert via Supabase client for fastest response
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: messageText,
        })
        .select('*, sender:sender_id(username)')
        .single()

      if (error) {
        // Fallback to Server Action if client RLS blocks direct client insert
        const formData = new FormData()
        formData.append('conversation_id', conversationId)
        formData.append('content', messageText)
        await sendMessage(formData)
      } else if (data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? data : m))
        )
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-w-0 h-full">
      {/* Warning Banner */}
      <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-start rounded-t-xl">
        <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">
          <strong>Reminder:</strong> communication outside of the website and conducting deals without our escrow agent is FORBIDDEN for your own safety.
        </p>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col max-w-[80%]">
                {!isMe && <span className="text-xs text-gray-400 mb-1 ml-1">{displayUser}</span>}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isBanned}
            placeholder={isBanned ? 'You cannot message a banned user.' : 'Enter your message...'}
            className="flex-1 rounded-full border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 border outline-none"
          />
          <button
            type="submit"
            disabled={isBanned || !inputText.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
