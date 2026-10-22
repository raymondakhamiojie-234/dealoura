'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createNotification } from './notifications'
import {
  renderEscrowDepositEmail,
  renderCredentialsSubmittedEmail,
  renderEvaluationCountdownStartedEmail,
  renderEscrowCompletedEmail
} from '@/utils/email-templates'

// 1. Create a transaction from an accepted offer
export async function createTransactionFromOffer(offerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch offer details
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .select('*, listings(*)')
    .eq('id', offerId)
    .single()

  if (offerError || !offer) return { error: 'Offer not found' }
  if (offer.status !== 'accepted') return { error: 'Offer is not accepted' }

  // Check if transaction already exists for this offer
  const { data: existingTx } = await supabase
    .from('transactions')
    .select('id')
    .eq('offer_id', offerId)
    .maybeSingle()

  if (existingTx) {
    redirect(`/dashboard/transactions/${existingTx.id}`)
  }

  // Calculate standard 5% escrow protection fee
  const escrowFee = Math.round(offer.amount * 0.05 * 100) / 100

  // Create Transaction
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      buyer_id: offer.buyer_id,
      seller_id: offer.listings.seller_id,
      listing_id: offer.listing_id,
      offer_id: offer.id,
      agreed_price: offer.amount,
      escrow_fee: escrowFee,
      status: 'pending_payment',
    })
    .select('id')
    .single()

  if (txError) {
    console.error('txError:', txError)
    return { error: txError.message }
  }

  // Lock the listing so others can't buy it
  await supabase.from('listings').update({ status: 'sold' }).eq('id', offer.listing_id)

  revalidatePath('/dashboard/transactions')
  redirect(`/dashboard/transactions/${tx.id}`)
}

// 2. Process Escrow Deposit Payment
export async function processMockPayment(transactionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch Tx with seller and buyer profile
  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      *,
      listings(title),
      seller:seller_id(email, username),
      buyer:buyer_id(username)
    `)
    .eq('id', transactionId)
    .single()

  if (!tx || tx.buyer_id !== user.id) return { error: 'Invalid transaction' }
  if (tx.status !== 'pending_payment') return { error: 'Transaction is not awaiting payment' }

  // 1. Create Payment Record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      transaction_id: tx.id,
      user_id: user.id,
      provider: 'mock',
      amount: tx.agreed_price,
      status: 'succeeded',
    })

  if (paymentError) return { error: paymentError.message }

  // 2. Update Transaction Status
  await supabase
    .from('transactions')
    .update({ status: 'payment_confirmed' })
    .eq('id', tx.id)

  // 3. Automated Resend Notification & In-app alert to Seller
  try {
    const sellerUsername = (tx.seller as any)?.username || 'Seller'
    const buyerUsername = (tx.buyer as any)?.username || 'Buyer'
    const listingTitle = tx.listings?.title || 'Account'

    const emailHtml = renderEscrowDepositEmail({
      sellerName: sellerUsername,
      buyerUsername,
      listingTitle,
      agreedPrice: tx.agreed_price,
      transactionId: tx.id
    })

    await createNotification(
      tx.seller_id,
      `Payment Secured in Escrow: "${listingTitle}"`,
      `The buyer has deposited $${tx.agreed_price} into the Dealoura Escrow Vault. Please submit account credentials to the agent.`,
      `/dashboard/transactions/${tx.id}`,
      'transaction',
      emailHtml
    )
  } catch (err) {
    console.warn('Escrow deposit notification error:', err)
  }

  revalidatePath(`/dashboard/transactions/${tx.id}`)
  return { success: true }
}

// 3. Submit Account Credentials to Escrow Agent
export async function submitAccountCredentials(formData: FormData) {
  const transactionId = formData.get('transactionId') as string
  const accountLogin = formData.get('account_login') as string
  const accountPassword = formData.get('account_password') as string
  const backupCodes = (formData.get('backup_codes') as string) || ''
  const notes = (formData.get('notes') as string) || ''

  if (!transactionId || !accountLogin || !accountPassword) {
    return { error: 'Please provide both login and password' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify user is the seller
  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      *,
      listings(title),
      buyer:buyer_id(username)
    `)
    .eq('id', transactionId)
    .single()

  if (!tx || tx.seller_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const formattedCredentials = JSON.stringify({
    login: accountLogin,
    password: accountPassword,
    backupCodes,
    notes,
    submittedAt: new Date().toISOString(),
  })

  // Update transaction status to agent_verifying and save credentials
  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      credentials_data: formattedCredentials,
      status: 'agent_verifying',
    })
    .eq('id', transactionId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Notify buyer that credentials were submitted to the agent
  try {
    const buyerName = (tx.buyer as any)?.username || 'Buyer'
    const listingTitle = tx.listings?.title || 'Account'

    const emailHtml = renderCredentialsSubmittedEmail({
      recipientName: buyerName,
      listingTitle,
      transactionId: tx.id
    })

    await createNotification(
      tx.buyer_id,
      `Credentials in Verification: "${listingTitle}"`,
      `The seller has handed over credentials to the Escrow Agent. Inspection is underway.`,
      `/dashboard/transactions/${tx.id}`,
      'transaction',
      emailHtml
    )
  } catch (err) {
    console.warn('Credentials submitted notification error:', err)
  }

  revalidatePath(`/dashboard/transactions/${transactionId}`)
  return { success: true }
}

// 4. Update Transaction State with Evaluation Timestamps & Resend Emails
export async function updateTransactionState(transactionId: string, newState: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch transaction with buyer & seller details
  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      *,
      listings(title),
      buyer:buyer_id(email, username),
      seller:seller_id(email, username)
    `)
    .eq('id', transactionId)
    .single()

  if (!tx) return { error: 'Transaction not found' }

  const updatePayload: Record<string, any> = { status: newState }
  const listingTitle = tx.listings?.title || 'Account'
  const buyerName = (tx.buyer as any)?.username || 'Buyer'
  const sellerName = (tx.seller as any)?.username || 'Seller'

  // If entering 7-day evaluation, set timestamps and alert buyer
  if (newState === 'buyer_7_day_evaluation') {
    const startedAt = new Date().toISOString()
    const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    updatePayload.evaluation_started_at = startedAt
    updatePayload.evaluation_ends_at = endsAt

    try {
      const emailHtml = renderEvaluationCountdownStartedEmail({
        buyerName,
        listingTitle,
        evaluationEndsAt: endsAt,
        transactionId: tx.id
      })

      await createNotification(
        tx.buyer_id,
        `7-Day Inspection Active: "${listingTitle}"`,
        `Account credentials have been verified by the agent. Your 7-day inspection period has started.`,
        `/dashboard/transactions/${tx.id}`,
        'transaction',
        emailHtml
      )
    } catch (err) {
      console.warn('Evaluation started notification error:', err)
    }
  }

  // If completed, email seller & buyer
  if (newState === 'completed') {
    try {
      // Seller payout email
      const sellerEmailHtml = renderEscrowCompletedEmail({
        recipientName: sellerName,
        role: 'seller',
        listingTitle,
        agreedPrice: tx.agreed_price,
        transactionId: tx.id
      })
      await createNotification(
        tx.seller_id,
        `Payout Released: $${tx.agreed_price}`,
        `Evaluation for "${listingTitle}" is complete! Escrow funds of $${tx.agreed_price} have been released.`,
        `/dashboard/transactions/${tx.id}`,
        'transaction',
        sellerEmailHtml
      )

      // Buyer deal finalized email
      const buyerEmailHtml = renderEscrowCompletedEmail({
        recipientName: buyerName,
        role: 'buyer',
        listingTitle,
        agreedPrice: tx.agreed_price,
        transactionId: tx.id
      })
      await createNotification(
        tx.buyer_id,
        `Escrow Completed: "${listingTitle}"`,
        `Transaction for "${listingTitle}" is officially completed. Don't forget to leave seller feedback!`,
        `/dashboard/transactions/${tx.id}`,
        'transaction',
        buyerEmailHtml
      )
    } catch (err) {
      console.warn('Escrow completion notification error:', err)
    }
  }

  const { error } = await supabase
    .from('transactions')
    .update(updatePayload)
    .eq('id', transactionId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/transactions/${transactionId}`)
  return { success: true }
}
