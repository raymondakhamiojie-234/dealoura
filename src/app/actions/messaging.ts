'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function sendMessage(formData: FormData) {
  const content = formData.get('content') as string
  const conversation_id = formData.get('conversation_id') as string
  const receiver_id = formData.get('receiver_id') as string // Optional, just for logic checking
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. If conversation_id is provided, just insert the message
  if (conversation_id) {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        content
      })

    if (error) return { error: error.message }
    
    revalidatePath(`/dashboard/messages/${conversation_id}`)
    return { success: true }
  }

  // 2. If NO conversation_id, it means we are starting a new conversation from a listing
  const listing_id = formData.get('listing_id') as string
  const seller_id = formData.get('seller_id') as string

  if (listing_id && seller_id) {
    // Check if conversation already exists
    let { data: existingConvo } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', seller_id)
      .eq('listing_id', listing_id)
      .maybeSingle()

    let newConvoId = existingConvo?.id

    // Create conversation if it doesn't exist
    if (!newConvoId) {
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
      newConvoId = newConvo.id
    }

    // Insert the first message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: newConvoId,
        sender_id: user.id,
        content
      })

    if (msgError) return { error: msgError.message }

    revalidatePath('/dashboard/messages')
    redirect(`/dashboard/messages/${newConvoId}`)
  }

  return { error: 'Invalid parameters' }
}
