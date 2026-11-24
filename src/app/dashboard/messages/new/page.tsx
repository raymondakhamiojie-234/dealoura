import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewConversationPage(props: {
  searchParams: Promise<{
    listing_id?: string
    seller_id?: string
    recipient_id?: string
    buyer_id?: string
  }>
}) {
  const searchParams = await props.searchParams
  const listing_id = searchParams.listing_id
  const targetId = searchParams.recipient_id || searchParams.seller_id || searchParams.buyer_id

  if (!listing_id || !targetId) {
    redirect('/dashboard/messages')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Prevent messaging oneself
  if (user.id === targetId) {
    redirect('/dashboard/messages')
  }

  // Check if conversation already exists (either orientation)
  const { data: existingConvo } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listing_id)
    .or(`and(buyer_id.eq.${user.id},seller_id.eq.${targetId}),and(buyer_id.eq.${targetId},seller_id.eq.${user.id})`)
    .maybeSingle()

  if (existingConvo) {
    redirect(`/dashboard/messages/${existingConvo.id}`)
  }

  // Determine who is seller and who is buyer from listing
  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id')
    .eq('id', listing_id)
    .single()

  const isUserSeller = listing?.seller_id === user.id
  const buyerId = isUserSeller ? targetId : user.id
  const sellerId = isUserSeller ? user.id : targetId

  // Create new conversation
  const { data: newConvo, error } = await supabase
    .from('conversations')
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      listing_id
    })
    .select('id')
    .single()

  if (error || !newConvo) {
    redirect('/dashboard/messages')
  }

  redirect(`/dashboard/messages/${newConvo.id}`)
}
