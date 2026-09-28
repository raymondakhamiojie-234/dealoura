'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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
  const { data: existingTx, error: existingTxError } = await supabase
    .from('transactions')
    .select('id')
    .eq('offer_id', offerId)
    .maybeSingle()

  if (existingTxError) {
    console.error("existingTxError:", existingTxError);
  }

  if (existingTx) {
    redirect(`/dashboard/transactions/${existingTx.id}`)
  }

  // Create Transaction
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      buyer_id: offer.buyer_id,
      seller_id: offer.listings.seller_id,
      listing_id: offer.listing_id,
      offer_id: offer.id,
      agreed_price: offer.amount,
      status: 'pending_payment'
    })
    .select('id')
    .single()

  if (txError) {
    console.error("txError:", txError)
    return { error: txError.message }
  }

  // Lock the listing so others can't buy it
  await supabase.from('listings').update({ status: 'sold' }).eq('id', offer.listing_id)

  revalidatePath('/dashboard/transactions')
  redirect(`/dashboard/transactions/${tx.id}`)
}

// 2. Simulate Payment Processing
export async function processMockPayment(transactionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch Tx
  const { data: tx } = await supabase.from('transactions').select('*').eq('id', transactionId).single()
  if (!tx || tx.buyer_id !== user.id) return { error: 'Invalid transaction' }

  if (tx.status !== 'pending_payment') return { error: 'Transaction is not awaiting payment' }

  // 1. Create Payment Record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      transaction_id: tx.id,
      user_id: user.id,
      provider: 'mock',
      amount: tx.agreed_price,
      status: 'succeeded'
    })
    .select('id')
    .single()

  if (paymentError) return { error: paymentError.message }

  // 2. Update Transaction Status
  await supabase
    .from('transactions')
    .update({ status: 'payment_confirmed' })
    .eq('id', tx.id)

  revalidatePath(`/dashboard/transactions/${tx.id}`)
  return { success: true }
}

// 3. Transfer Workflow Actions
export async function updateTransactionState(transactionId: string, newState: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('transactions')
    .update({ status: newState })
    .eq('id', transactionId)

  if (error) return { error: error.message }

  // If the agent is granting manager access, auto-advance to 7 day evaluation. 
  // In a real app this would just be the single state change.
  if (newState === 'buyer_7_day_evaluation') {
    // We are simulating the agent here
  }

  revalidatePath(`/dashboard/transactions/${transactionId}`)
  return { success: true }
}
