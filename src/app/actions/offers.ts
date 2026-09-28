'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function makeOffer(formData: FormData) {
  const amount = parseFloat(formData.get('amount') as string)
  const message = formData.get('message') as string
  const listing_id = formData.get('listing_id') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Expiration set to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { error } = await supabase
    .from('offers')
    .insert({
      listing_id,
      buyer_id: user.id,
      amount,
      message,
      expires_at: expiresAt.toISOString(),
      status: 'pending'
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/offers')
  redirect('/dashboard/offers')
}

export async function updateOfferStatus(offerId: string, newStatus: string, counterAmount?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const updateData: any = { status: newStatus }
  if (newStatus === 'countered' && counterAmount) {
    updateData.amount = counterAmount
  }

  const { error } = await supabase
    .from('offers')
    .update(updateData)
    .eq('id', offerId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/offers')
  return { success: true }
}
