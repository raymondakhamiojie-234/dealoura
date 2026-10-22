'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createNotification } from './notifications'
import { renderNewMessageEmail } from '@/utils/email-templates'

export async function sendMessage(formData: FormData) {
  const content = formData.get('content') as string
  const conversation_id = formData.get('conversation_id') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (!content || !content.trim()) return { error: 'Message cannot be empty' }

  let targetConvoId = conversation_id
  let shouldRedirect = false

  // 1. If NO conversation_id, handle conversation discovery or creation
  if (!targetConvoId) {
    const listing_id = formData.get('listing_id') as string
    const seller_id = formData.get('seller_id') as string

    if (!listing_id || !seller_id) {
      return { error: 'Missing listing or seller information' }
    }

    // Check if conversation already exists
    const { data: existingConvo } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', seller_id)
      .eq('listing_id', listing_id)
      .maybeSingle()

    if (existingConvo?.id) {
      targetConvoId = existingConvo.id
    } else {
      const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id,
          listing_id
        })
        .select('id')
        .single()

      if (convoError) return { error: convoError.message }
      targetConvoId = newConvo.id
    }
    shouldRedirect = true
  }

  // 2. Insert the message
  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: targetConvoId,
      sender_id: user.id,
      content: content.trim()
    })

  if (msgError) return { error: msgError.message }

  // 3. Notify the counterparty via in-app & Resend email
  try {
    const { data: convo } = await supabase
      .from('conversations')
      .select(`
        buyer_id,
        seller_id,
        buyer:buyer_id (username),
        seller:seller_id (username)
      `)
      .eq('id', targetConvoId)
      .single()

    if (convo) {
      const isBuyer = convo.buyer_id === user.id
      const recipientId = isBuyer ? convo.seller_id : convo.buyer_id
      const senderUsername = isBuyer
        ? (convo.buyer as any)?.username || 'User'
        : (convo.seller as any)?.username || 'Seller'
      const recipientName = isBuyer
        ? (convo.seller as any)?.username || 'Seller'
        : (convo.buyer as any)?.username || 'User'

      const snippet = content.trim().length > 120
        ? `${content.trim().slice(0, 117)}...`
        : content.trim()

      const emailHtml = renderNewMessageEmail({
        recipientName,
        senderUsername,
        snippet,
        conversationId: targetConvoId
      })

      await createNotification(
        recipientId,
        `New Message from @${senderUsername}`,
        `@${senderUsername}: "${snippet}"`,
        `/dashboard/messages/${targetConvoId}`,
        'message',
        emailHtml
      )
    }
  } catch (err) {
    console.warn('Non-blocking chat notification warning:', err)
  }

  revalidatePath(`/dashboard/messages/${targetConvoId}`)
  revalidatePath('/dashboard/messages')

  if (shouldRedirect) {
    redirect(`/dashboard/messages/${targetConvoId}`)
  }

  return { success: true }
}
