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

export async function resolveDispute(disputeId: string, transactionId: string, resolution: string, notes: string) {
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
    .eq('id', transactionId)
    .single()

  // 2. Update dispute status
  const { error } = await supabase
    .from('disputes')
    .update({
      status: resolution, // 'resolved_buyer', 'resolved_seller', 'closed'
      resolution_notes: notes
    })
    .eq('id', disputeId)

  if (error) return { error: error.message }

  // 3. Update transaction status back to cancelled or completed based on resolution
  const finalTxStatus = resolution === 'resolved_buyer' ? 'cancelled' : 'completed'

  await supabase
    .from('transactions')
    .update({ status: finalTxStatus })
    .eq('id', transactionId)

  // 4. Notify both buyer and seller of resolution
  if (tx) {
    const listingTitle = (tx.listing as any)?.title || 'Escrow Item'

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
      `Dispute Resolved: "${listingTitle}"`,
      `The dispute for "${listingTitle}" has been resolved by our mediation staff.`,
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
      `Dispute Resolved: "${listingTitle}"`,
      `The dispute for "${listingTitle}" has been resolved by our mediation staff.`,
      `/dashboard/transactions/${transactionId}`,
      'transaction',
      sellerEmailHtml
    )
  }

  revalidatePath('/admin/disputes')
  revalidatePath(`/dashboard/transactions/${transactionId}`)
  return { success: true }
}
