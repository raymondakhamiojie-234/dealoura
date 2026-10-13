import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewConversationPage(props: {
  searchParams: Promise<{ listing_id?: string; seller_id?: string }>
}) {
  const searchParams = await props.searchParams
  const { listing_id, seller_id } = searchParams

  if (!listing_id || !seller_id) {
    redirect('/dashboard/messages')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Prevent messaging oneself
  if (user.id === seller_id) {
    redirect('/dashboard/messages')
  }

  // Check if conversation already exists
  const { data: existingConvo } = await supabase
    .from('conversations')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('seller_id', seller_id)
    .eq('listing_id', listing_id)
    .maybeSingle()

  if (existingConvo) {
    redirect(`/dashboard/messages/${existingConvo.id}`)
  }

  // Create new conversation
  const { data: newConvo, error } = await supabase
    .from('conversations')
    .insert({
      buyer_id: user.id,
      seller_id,
      listing_id
    })
    .select('id')
    .single()

  if (error || !newConvo) {
    redirect('/dashboard/messages')
  }

  redirect(`/dashboard/messages/${newConvo.id}`)
}
