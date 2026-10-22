'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/utils/resend'

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

  // Fetch Tx with seller profile
  const { data: tx } = await supabase
    .from('transactions')
    .select('*, listings(title), seller:seller_id(email, username)')
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

  // 3. Automated Resend Notification Email to Seller
  const sellerEmail = (tx.seller as any)?.email
  if (sellerEmail) {
    await sendEmail({
      to: sellerEmail,
      subject: `Payment Secured in Escrow: "${tx.listings?.title}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #2563eb;">Payment Secured in Escrow!</h2>
          <p>Hello @${(tx.seller as any)?.username || 'Seller'},</p>
          <p>The buyer has deposited <strong>$${tx.agreed_price}</strong> into the Dealoura Escrow vault for <strong>${tx.listings?.title}</strong>.</p>
          <p>Please log in to your dashboard and submit account transfer credentials to the Escrow Agent.</p>
          <div style="margin: 25px 0;">
            <a href="https://dealoura.vercel.app/dashboard/transactions/${tx.id}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Open Escrow Tracker
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px;">Never transfer accounts outside Dealoura Escrow.</p>
        </div>
      `,
    })
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
    .select('*, listings(title)')
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

  // If entering 7-day evaluation, set timestamps
  if (newState === 'buyer_7_day_evaluation') {
    const startedAt = new Date().toISOString()
    const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    updatePayload.evaluation_started_at = startedAt
    updatePayload.evaluation_ends_at = endsAt

    // Email buyer
    const buyerEmail = (tx.buyer as any)?.email
    if (buyerEmail) {
      await sendEmail({
        to: buyerEmail,
        subject: `Account Verified: Your 7-Day Evaluation Has Started`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #2563eb;">Your 7-Day Evaluation Period is Active</h2>
            <p>Hello @${(tx.buyer as any)?.username || 'Buyer'},</p>
            <p>The Dealoura Escrow Agent has verified the account credentials for <strong>${tx.listings?.title}</strong> and granted you Manager access.</p>
            <p>You now have <strong>7 days</strong> to inspect analytics, traffic sources, and ensure account cleanliness.</p>
            <div style="margin: 25px 0;">
              <a href="https://dealoura.vercel.app/dashboard/transactions/${tx.id}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View Evaluation Countdown
              </a>
            </div>
            <p style="color: #64748b; font-size: 12px;">Funds remain safely held in escrow throughout the 7-day period.</p>
          </div>
        `,
      })
    }
  }

  // If completed, email seller
  if (newState === 'completed') {
    const sellerEmail = (tx.seller as any)?.email
    if (sellerEmail) {
      await sendEmail({
        to: sellerEmail,
        subject: `Escrow Deal Completed - Payout Released!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #16a34a;">Payout Released! 🎉</h2>
            <p>Hello @${(tx.seller as any)?.username || 'Seller'},</p>
            <p>The 7-day buyer evaluation for <strong>${tx.listings?.title}</strong> has finished and primary ownership has been transferred.</p>
            <p>Your escrow payout of <strong>$${tx.agreed_price}</strong> has been released.</p>
            <div style="margin: 25px 0;">
              <a href="https://dealoura.vercel.app/dashboard/transactions/${tx.id}" style="background-color: #16a34a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View Transaction Summary
              </a>
            </div>
          </div>
        `,
      })
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
