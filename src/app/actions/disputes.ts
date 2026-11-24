'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createNotification } from './notifications'
import { renderDisputeEmail } from '@/utils/email-templates'

export async function openDispute(formData: FormData) {
  const transaction_id = formData.get('transaction_id') as string
  const reason = formData.get('reason') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Fetch transaction details
  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      id,
      buyer_id,
      seller_id,
      listing:listings (title),
      buyer:buyer_id (username),
      seller:seller_id (username)
    `)
    .eq('id', transaction_id)
    .single()

  // 2. Insert dispute
  const { error } = await supabase
    .from('disputes')
    .insert({
      transaction_id,
      opened_by: user.id,
      reason,
      status: 'open'
    })

  if (error) return { error: error.message }

  // 3. Update transaction status to disputed
  await supabase
    .from('transactions')
    .update({ status: 'disputed' })
    .eq('id', transaction_id)

  // 4. Send notification & email to counterparty
  if (tx) {
    const isBuyer = user.id === tx.buyer_id
    const recipientId = isBuyer ? tx.seller_id : tx.buyer_id
    const recipientName = isBuyer ? (tx.seller as any)?.username || 'Seller' : (tx.buyer as any)?.username || 'Buyer'
    const listingTitle = (tx.listing as any)?.title || 'Escrow Item'

    const emailHtml = renderDisputeEmail({
      recipientName,
      listingTitle,
      reason,
      isResolved: false,
      transactionId: transaction_id
    })

    await createNotification(
      recipientId,
      `Escrow Dispute Opened: "${listingTitle}"`,
      `A dispute was opened for "${listingTitle}". Funds remain safely held in the Dealoura Escrow Vault.`,
      `/dashboard/transactions/${transaction_id}`,
      'transaction',
      emailHtml
    )
  }

  revalidatePath(`/dashboard/transactions/${transaction_id}`)
  redirect(`/dashboard/transactions/${transaction_id}`)
}

/**
 * Mark Dispute Under Review by Escrow Officer
 */
export async function markDisputeUnderReview(disputeId: string, transactionId: string, notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin privileges required.' }
  }

  const { error: updateErr } = await supabase
    .from('disputes')
    .update({
      status: 'under_review',
      resolution_notes: notes || 'Dispute assigned to Senior Escrow Officer for evidence arbitration.'
    })
    .eq('id', disputeId)

  if (updateErr) return { error: updateErr.message }

  // Log timeline
  await supabase.from('transaction_timeline').insert({
    transaction_id: transactionId,
    status: 'disputed',
    description: notes 
      ? `Senior Escrow Officer began investigation: ${notes}`
      : `Dealoura Arbitration Desk has initiated formal case investigation. Both parties are requested to stand by.`
  })

  // Fetch transaction details for notifications
  const { data: tx } = await supabase
    .from('transactions')
    .select('id, buyer_id, seller_id, listings(title)')
    .eq('id', transactionId)
    .single()

  if (tx) {
    const listingTitle = (tx.listings as any)?.title || 'Escrow Account'
    await createNotification(
      tx.buyer_id,
      `Dispute Under Formal Review: "${listingTitle}"`,
      `An Escrow Officer is actively reviewing the submitted evidence, transaction records, and account credentials.`,
      `/dashboard/transactions/${transactionId}`,
      'transaction'
    )
    await createNotification(
      tx.seller_id,
      `Dispute Under Formal Review: "${listingTitle}"`,
      `An Escrow Officer is actively reviewing the dispute ticket for "${listingTitle}".`,
      `/dashboard/transactions/${transactionId}`,
      'transaction'
    )
  }

  revalidatePath('/admin/disputes')
  revalidatePath(`/dashboard/transactions/${transactionId}`)
  return { success: true }
}

export async function resolveDispute(
  disputeId: string, 
  transactionId: string, 
  resolution: 'resolved_buyer' | 'resolved_seller' | 'closed', 
  notes: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin privileges required.' }
  }

  // 1. Fetch transaction details
  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      id,
      buyer_id,
      seller_id,
      agreed_price,
      escrow_fee,
      listings (title),
      buyer:buyer_id (username),
      seller:seller_id (username)
    `)
    .eq('id', transactionId)
    .single()

  // 2. Update dispute status
  const { error } = await supabase
    .from('disputes')
    .update({
      status: resolution,
      resolution_notes: notes
    })
    .eq('id', disputeId)

  if (error) return { error: error.message }

  // 3. Update transaction status and payout status based on resolution
  if (resolution === 'resolved_buyer') {
    // Refund Buyer: Cancel transaction and cancel seller payout
    await supabase
      .from('transactions')
      .update({ 
        status: 'cancelled',
        payout_status: 'cancelled'
      })
      .eq('id', transactionId)

    // Add Timeline Entry
    await supabase.from('transaction_timeline').insert({
      transaction_id: transactionId,
      status: 'cancelled',
      description: `Dispute resolved in favor of Buyer by Escrow Arbitration. Buyer refund issued. Ruling: ${notes}`
    })
  } else if (resolution === 'resolved_seller') {
    // Release to Seller: Complete transaction and queue payout
    await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        payout_status: 'pending'
      })
      .eq('id', transactionId)

    // Add Timeline Entry
    await supabase.from('transaction_timeline').insert({
      transaction_id: transactionId,
      status: 'completed',
      description: `Dispute resolved in favor of Seller by Escrow Arbitration. Funds released to seller payout queue. Ruling: ${notes}`
    })
  }

  // 4. Notify both buyer and seller of resolution
  if (tx) {
    const listingTitle = (tx.listings as any)?.title || 'Escrow Item'

    // Buyer notification
    const buyerEmailHtml = renderDisputeEmail({
      recipientName: (tx.buyer as any)?.username || 'Buyer',
      listingTitle,
      reason: '',
      isResolved: true,
      resolutionNotes: notes,
      transactionId
    })
    await createNotification(
      tx.buyer_id,
      `Dispute Ruling Issued: "${listingTitle}"`,
      `Dealoura Arbitration Desk has completed review: ${resolution === 'resolved_buyer' ? 'Refund approved for Buyer.' : 'Funds released to Seller.'} Finding: ${notes}`,
      `/dashboard/transactions/${transactionId}`,
      'transaction',
      buyerEmailHtml
    )

    // Seller notification
    const sellerEmailHtml = renderDisputeEmail({
      recipientName: (tx.seller as any)?.username || 'Seller',
      listingTitle,
      reason: '',
      isResolved: true,
      resolutionNotes: notes,
      transactionId
    })
    await createNotification(
      tx.seller_id,
      `Dispute Ruling Issued: "${listingTitle}"`,
      `Dealoura Arbitration Desk has completed review: ${resolution === 'resolved_seller' ? 'Dispute dismissed, funds queued for payout.' : 'Transaction cancelled, refund issued to buyer.'} Finding: ${notes}`,
      `/dashboard/transactions/${transactionId}`,
      'transaction',
      sellerEmailHtml
    )
  }

  revalidatePath('/admin/disputes')
  revalidatePath('/admin/transactions')
  revalidatePath(`/dashboard/transactions/${transactionId}`)
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

/**
 * Server Action for Admin Arbitration Form
 */
export async function adminArbitrateDisputeAction(formData: FormData) {
  const disputeId = formData.get('disputeId') as string
  const transactionId = formData.get('transactionId') as string
  const resolution = formData.get('resolution') as 'resolved_buyer' | 'resolved_seller'
  const notes = formData.get('notes') as string

  if (!disputeId || !transactionId || !resolution || !notes) {
    return { error: 'All arbitration fields and findings notes are required.' }
  }

  return await resolveDispute(disputeId, transactionId, resolution, notes.trim())
}
