'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createNotification } from './notifications'
import { renderNewOfferEmail, renderOfferStatusEmail } from '@/utils/email-templates'

export async function makeOffer(formData: FormData) {
  const amount = parseFloat(formData.get('amount') as string)
  const message = formData.get('message') as string
  const listing_id = formData.get('listing_id') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch listing and seller details
  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id,
      seller_id,
      title,
      seller:seller_id (username, email)
    `)
    .eq('id', listing_id)
    .single()

  // Fetch buyer's username
  const { data: buyerProfile } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const buyerUsername = buyerProfile?.username || user.user_metadata?.username || 'buyer'

  // Expiration set to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: newOffer, error } = await supabase
    .from('offers')
    .insert({
      listing_id,
      buyer_id: user.id,
      amount,
      message,
      expires_at: expiresAt.toISOString(),
      status: 'pending'
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Send Branded Notification & Email to Seller
  if (listing && listing.seller_id) {
    const sellerUsername = (listing.seller as any)?.username || 'Seller'
    const emailHtml = renderNewOfferEmail({
      sellerName: sellerUsername,
      buyerUsername,
      listingTitle: listing.title,
      offerAmount: amount,
      offerId: newOffer?.id
    })

    await createNotification(
      listing.seller_id,
      `New Offer: $${amount} on "${listing.title}"`,
      `@${buyerUsername} submitted an offer of $${amount} on your listing "${listing.title}".`,
      '/dashboard/offers',
      'offer',
      emailHtml
    )
  }

  revalidatePath('/dashboard/offers')
  redirect('/dashboard/offers')
}

export async function updateOfferStatus(offerId: string, newStatus: string, counterAmount?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch offer details before updating
  const { data: offer } = await supabase
    .from('offers')
    .select(`
      id,
      buyer_id,
      amount,
      listing:listing_id (
        id,
        title,
        seller:seller_id (username)
      )
    `)
    .eq('id', offerId)
    .single()

  const updateData: any = { status: newStatus }
  if (newStatus === 'countered' && counterAmount) {
    updateData.amount = counterAmount
  }

  const { error } = await supabase
    .from('offers')
    .update(updateData)
    .eq('id', offerId)

  if (error) return { error: error.message }

  // Send Notification & Email to Buyer if status changed
  if (offer && offer.buyer_id && ['accepted', 'countered', 'rejected'].includes(newStatus)) {
    const sellerUsername = (offer.listing as any)?.seller?.username || 'Seller'
    const listingTitle = (offer.listing as any)?.title || 'Account'
    
    // Fetch buyer name
    const { data: buyerProfile } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('id', offer.buyer_id)
      .single()

    const buyerName = buyerProfile?.username || 'Buyer'

    const emailHtml = renderOfferStatusEmail({
      buyerName,
      sellerUsername,
      listingTitle,
      status: newStatus as 'accepted' | 'countered' | 'rejected',
      amount: offer.amount,
      counterAmount
    })

    const statusTitle = newStatus === 'accepted'
      ? `Offer Accepted: "${listingTitle}"`
      : newStatus === 'countered'
      ? `Counter-Offer Received: $${counterAmount}`
      : `Offer Declined: "${listingTitle}"`

    const statusMessage = newStatus === 'accepted'
      ? `@${sellerUsername} accepted your offer of $${offer.amount} on "${listingTitle}". Proceed to escrow payment.`
      : newStatus === 'countered'
      ? `@${sellerUsername} countered with $${counterAmount} on "${listingTitle}".`
      : `@${sellerUsername} declined your offer on "${listingTitle}".`

    await createNotification(
      offer.buyer_id,
      statusTitle,
      statusMessage,
      newStatus === 'accepted' ? `/dashboard/transactions/new?offer_id=${offer.id}` : '/dashboard/offers',
      'offer',
      emailHtml
    )
  }

  revalidatePath('/dashboard/offers')
  return { success: true }
}
