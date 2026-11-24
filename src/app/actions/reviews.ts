'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createNotification } from './notifications'

export async function leaveReview(formData: FormData) {
  const transaction_id = formData.get('transaction_id') as string
  const reviewee_id = formData.get('reviewee_id') as string
  const listing_id = formData.get('listing_id') as string
  const rating = parseInt(formData.get('rating') as string, 10)
  const comment = (formData.get('comment') as string) || ''
  
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: 'Rating must be an integer between 1 and 5 stars.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (user.id === reviewee_id) {
    return { error: 'You cannot leave a review for yourself.' }
  }

  // 1. Verify transaction status and participant authorization
  if (transaction_id) {
    const { data: tx } = await supabase
      .from('transactions')
      .select('id, buyer_id, seller_id, status, listing_id')
      .eq('id', transaction_id)
      .single()

    if (!tx) {
      return { error: 'Transaction not found.' }
    }

    if (tx.buyer_id !== user.id && tx.seller_id !== user.id) {
      return { error: 'Unauthorized: You are not a participant in this transaction.' }
    }

    if (tx.status !== 'completed') {
      return { error: 'Reviews can only be submitted once the escrow transaction is completed.' }
    }

    const expectedCounterparty = user.id === tx.buyer_id ? tx.seller_id : tx.buyer_id
    if (reviewee_id !== expectedCounterparty) {
      return { error: 'Invalid review recipient.' }
    }
  }

  // 2. Prevent duplicate reviews
  if (listing_id) {
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('listing_id', listing_id)
      .maybeSingle()

    if (existing) {
      return { error: 'You have already submitted a review for this listing.' }
    }
  }

  // 3. Insert review
  const { error } = await supabase
    .from('reviews')
    .insert({
      reviewer_id: user.id,
      reviewee_id,
      listing_id,
      rating,
      comment: comment.trim()
    })

  if (error) return { error: error.message }

  // 4. Send notification to reviewee
  try {
    await createNotification(
      reviewee_id,
      `New ${rating}-Star Review Received!`,
      `A counterparty left you a ${rating}-star review: "${comment.trim().slice(0, 80) || 'Clean transfer verified'}"`,
      `/dashboard/transactions/${transaction_id}`,
      'system'
    )
  } catch (notifErr) {
    console.warn('Review notification error:', notifErr)
  }

  revalidatePath(`/dashboard/transactions/${transaction_id}`)
  return { success: true }
}
