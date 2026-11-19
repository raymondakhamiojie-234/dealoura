'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createListing(formData: FormData) {
  try {
    const title = (formData.get('title') as string)?.trim()
    const description = (formData.get('description') as string)?.trim() || ''
    const rawPrice = formData.get('price') as string
    const price = parseFloat(rawPrice)
    const action = (formData.get('action') as string) || 'pending'
    
    // Social Media Metrics
    const platform = (formData.get('platform') as string) || 'YouTube'
    const rawFollowers = formData.get('followers_count') as string
    const followers_count = parseInt(rawFollowers || '0', 10) || 0
    const monetized = formData.get('monetized') === 'true'
    const niche = (formData.get('niche') as string) || 'General'
    const account_handle = (formData.get('account_handle') as string)?.trim() || ''

    if (!title) {
      return { error: 'Listing title is required' }
    }
    if (isNaN(price) || price <= 0) {
      return { error: 'Please enter a valid asking price greater than 0' }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Your session has expired. Please log in again to list an account.' }
    }

    // Determine status (Save as Draft or Publish directly to marketplace)
    const status = action === 'draft' ? 'draft' : 'approved'

    // Verify user profile exists to prevent foreign key constraint crashes
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      await supabase.from('user_profiles').upsert({
        id: user.id,
        username: user.email ? user.email.split('@')[0] : 'user_' + user.id.slice(0, 6),
        full_name: user.user_metadata?.full_name || '',
      })
    }

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
      console.error('Database listing insertion error:', error)
      return { error: error?.message || 'Failed to create listing record in database' }
    }

    // Process uploaded images safely
    const files = formData.getAll('images') as File[]
    const validFiles = files.filter(f => f && typeof f.size === 'number' && f.size > 0 && f.name)

    for (let i = 0; i < validFiles.length; i++) {
      try {
        const file = validFiles[i]
        const ext = file.name ? file.name.split('.').pop()?.toLowerCase() || 'jpg' : 'jpg'
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
          console.error('Storage upload note:', uploadError.message)
        }
      } catch (uploadErr) {
        console.error('Failed to upload image file:', uploadErr)
      }
    }

    revalidatePath('/')
    revalidatePath('/marketplace')
    revalidatePath('/dashboard/seller/listings')
    revalidatePath(`/marketplace/listings/${data.id}`)

    return { success: true, listingId: data.id }
  } catch (err: any) {
    console.error('createListing server exception:', err)
    return { error: err.message || 'An unexpected server error occurred while creating listing' }
  }
}
