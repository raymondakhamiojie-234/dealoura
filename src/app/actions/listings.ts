'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createListing(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const action = formData.get('action') as string // 'draft' or 'pending'
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Determine status (Save as Draft or Submit for Review)
  const status = action === 'draft' ? 'draft' : 'pending'

  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
      status,
      // Hardcode currency/platform/category for now until we build those selectors
      currency: 'USD',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  redirect(`/dashboard/profile`) // Redirect back to profile or seller dashboard
}
