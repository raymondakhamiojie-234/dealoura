'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function approveListing(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // In a real app, verify the user has the 'admin' role here.
  // For now, we will allow the update for testing the flow.
  
  const { error } = await supabase
    .from('listings')
    .update({ status: 'approved' })
    .eq('id', listingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/listings')
  revalidatePath('/')
  return { success: true }
}

export async function rejectListing(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('listings')
    .update({ status: 'rejected' })
    .eq('id', listingId)

  if (error) return { error: error.message }

  revalidatePath('/admin/listings')
  return { success: true }
}
