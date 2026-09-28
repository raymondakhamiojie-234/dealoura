'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function leaveReview(formData: FormData) {
  const transaction_id = formData.get('transaction_id') as string
  const reviewee_id = formData.get('reviewee_id') as string
  const listing_id = formData.get('listing_id') as string
  const rating = parseInt(formData.get('rating') as string)
  const comment = formData.get('comment') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('reviews')
    .insert({
      reviewer_id: user.id,
      reviewee_id,
      listing_id,
      rating,
      comment
    })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/transactions/${transaction_id}`)
  return { success: true }
}
