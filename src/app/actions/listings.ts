'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createListing(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const action = formData.get('action') as string // 'draft' or 'pending'
  
  // Social Media Metrics
  const platform = (formData.get('platform') as string) || 'YouTube'
  const followers_count = parseInt((formData.get('followers_count') as string) || '0', 10)
  const monetized = formData.get('monetized') === 'true'
  const niche = (formData.get('niche') as string) || 'General'
  const account_handle = (formData.get('account_handle') as string) || ''

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
      currency: 'USD',
      platform,
      followers_count,
      monetized,
      niche,
      account_handle,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { error: error?.message || 'Failed to create listing' }
  }

  // Process uploaded images
  const files = formData.getAll('images') as File[]
  const validFiles = files.filter(f => f && typeof f.size === 'number' && f.size > 0)

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i]
    const ext = file.name ? file.name.split('.').pop() : 'jpg'
    const fileName = `${user.id}/${data.id}/${Date.now()}_${i}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName)

      await supabase.from('listing_media').insert({
        listing_id: data.id,
        media_url: publicUrl,
        media_type: 'image',
        display_order: i,
      })
    } else {
      console.error('Failed to upload image:', uploadError.message)
    }
  }

  revalidatePath('/')
  revalidatePath(`/marketplace/listings/${data.id}`)
  redirect(`/marketplace/listings/${data.id}`)
}
