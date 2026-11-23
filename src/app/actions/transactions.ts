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

// 2b. Submit Bank Transfer / Payment Proof (Buyer)
export async function submitPaymentTransferProof(formData: FormData) {
  const transactionId = formData.get('transactionId') as string
  const payerName = formData.get('payer_name') as string
  const payerBank = formData.get('payer_bank') as string
  const referenceCode = formData.get('reference_code') as string
  const amountPaid = parseFloat(formData.get('amount_paid') as string) || 0
  const notes = (formData.get('notes') as string) || ''
  const receiptFile = formData.get('receipt_file') as File | null

  if (!transactionId || !payerName || !payerBank || !referenceCode) {
    return { error: 'Please provide payer name, sending bank, and reference code' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify user is buyer
  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      *,
      listings(title),
      seller:seller_id(username)
    `)
    .eq('id', transactionId)
    .single()

  if (!tx || tx.buyer_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Upload receipt if provided
  let receiptUrl = ''
  if (receiptFile && receiptFile.size > 0) {
    try {
      const fileExt = receiptFile.name.split('.').pop() || 'jpg'
      const filePath = `receipts/${transactionId}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, receiptFile)

      if (!uploadError) {
        receiptUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${filePath}`
      }
    } catch (uploadErr) {
      console.warn('Receipt upload exception:', uploadErr)
    }
  }

  const proofData = {
    payerName: payerName.trim(),
    payerBank: payerBank.trim(),
    referenceCode: referenceCode.trim(),
    amountPaid: amountPaid || tx.agreed_price,
    notes: notes.trim(),
    receiptUrl: receiptUrl || null,
    submittedAt: new Date().toISOString()
  }

  const proofJson = JSON.stringify(proofData)

  // Update transaction with payment proof data
  let { error: updateError } = await supabase
    .from('transactions')
    .update({
      status: 'payment_verifying',
      payment_proof_data: proofJson,
      payment_proof_url: receiptUrl || null
    })
    .eq('id', transactionId)

  if (updateError) {
    const res = await supabase
      .from('transactions')
      .update({
        payment_proof_data: proofJson,
        payment_proof_url: receiptUrl || null
      })
      .eq('id', transactionId)
    if (res.error) return { error: res.error.message }
  }

  // Record payment record
  await supabase
    .from('payments')
    .insert({
      transaction_id: transactionId,
      user_id: user.id,
      provider: 'bank_transfer',
      provider_transaction_id: referenceCode,
      amount: amountPaid || tx.agreed_price,
      status: 'pending'
    })

  // Notify seller of transfer submission
  try {
    const listingTitle = tx.listings?.title || 'Account'
    await createNotification(
      tx.seller_id,
      `Buyer Submitted Transfer Proof: "${listingTitle}"`,
      `The buyer submitted bank transfer proof of $${amountPaid || tx.agreed_price} (Ref: ${referenceCode}). The Dealoura Escrow Desk is reconciling the deposit.`,
      `/dashboard/transactions/${transactionId}`,
      'transaction'
    )
  } catch (notifErr) {
    console.warn('Payment proof submission notification note:', notifErr)
  }

  revalidatePath(`/dashboard/transactions/${transactionId}`)
  return { success: true }
}

// 2c. Admin / Desk Confirmation of Escrow Deposit
export async function adminConfirmEscrowDeposit(transactionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch transaction with buyer and seller details
  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      *,
      listings(title),
      buyer:buyer_id(username, email),
      seller:seller_id(username, email)
    `)
    .eq('id', transactionId)
    .single()

  if (!tx) return { error: 'Transaction not found' }

  // Advance status to payment_confirmed
  const { error: updateError } = await supabase
    .from('transactions')
    .update({ status: 'payment_confirmed' })
    .eq('id', transactionId)

  if (updateError) return { error: updateError.message }

  // Update payment record to succeeded
  await supabase
    .from('payments')
    .update({ status: 'succeeded' })
    .eq('transaction_id', transactionId)

  const listingTitle = tx.listings?.title || 'Account'
  const sellerUsername = (tx.seller as any)?.username || 'Seller'
  const buyerUsername = (tx.buyer as any)?.username || 'Buyer'

  try {
    // 1. Seller: Request credentials
    const sellerEmailHtml = renderEscrowDepositEmail({
      sellerName: sellerUsername,
      buyerUsername,
      listingTitle,
      agreedPrice: tx.agreed_price,
      transactionId: tx.id
    })
    await createNotification(
      tx.seller_id,
      `Escrow Deposit Confirmed: "${listingTitle}"`,
      `The buyer's deposit of $${tx.agreed_price} has been verified and locked in the Dealoura Escrow Vault. Please submit account credentials to the agent.`,
      `/dashboard/transactions/${tx.id}`,
      'transaction',
      sellerEmailHtml
    )

    // 2. Buyer: Confirmation receipt
    await createNotification(
      tx.buyer_id,
      `Deposit Verified & Secured: "${listingTitle}"`,
      `Your bank transfer of $${tx.agreed_price} has been reconciled and secured in escrow. The seller has been instructed to hand over credentials.`,
      `/dashboard/transactions/${tx.id}`,
      'transaction'
    )
  } catch (notifErr) {
    console.warn('Deposit confirmation notification error:', notifErr)
  }

  revalidatePath(`/dashboard/transactions/${transactionId}`)
  revalidatePath('/admin/transactions')
  revalidatePath('/admin')
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
      listings(title, platform),
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

  // If entering evaluation period, dynamically check platform:
  // YouTube = 7 Days (10,080 minutes) due to Google Brand Account primary transfer rules
  // Other platforms (TikTok, Instagram, Facebook, X, etc.) = 15 Minutes for rapid inspection
  if (newState === 'buyer_7_day_evaluation') {
    const isYouTube = tx.listings?.platform?.toLowerCase().includes('youtube')
    const durationMinutes = isYouTube ? 7 * 24 * 60 : 15
    const durationMs = durationMinutes * 60 * 1000

    const startedAt = new Date().toISOString()
    const endsAt = new Date(Date.now() + durationMs).toISOString()
    
    updatePayload.evaluation_started_at = startedAt
    updatePayload.evaluation_ends_at = endsAt
    updatePayload.hold_duration_minutes = durationMinutes

    try {
      const emailHtml = renderEvaluationCountdownStartedEmail({
        buyerName,
        listingTitle,
        evaluationEndsAt: endsAt,
        transactionId: tx.id
      })

      const holdTitle = isYouTube 
        ? `7-Day YouTube Transfer Hold Active: "${listingTitle}"`
        : `15-Minute Inspection Hold Active: "${listingTitle}"`
      
      const holdMsg = isYouTube
        ? `Account credentials verified. Your 7-day YouTube Brand Account ownership transfer window has started.`
        : `Account credentials verified. Your 15-minute credential & 2FA inspection window has started.`

      await createNotification(
        tx.buyer_id,
        holdTitle,
        holdMsg,
        `/dashboard/transactions/${tx.id}`,
        'transaction',
        emailHtml
      )
    } catch (err) {
      console.warn('Evaluation started notification error:', err)
    }
  }

  // If completed, email seller & buyer and release funds to seller wallet
  if (newState === 'completed') {
    // 1. Credit seller's internal wallet
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('wallet_release_escrow', {
        p_transaction_id: transactionId
      })
      if (rpcErr) {
        const escrowFee = tx.escrow_fee || Math.round(tx.agreed_price * 0.05 * 100) / 100
        const sellerPayout = Math.max(0, tx.agreed_price - escrowFee)
        const { data: sWallet } = await supabase
          .from('user_wallets')
          .select('available_balance')
          .eq('user_id', tx.seller_id)
          .maybeSingle()

        if (sWallet) {
          await supabase
            .from('user_wallets')
            .update({
              available_balance: Number(sWallet.available_balance || 0) + sellerPayout,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', tx.seller_id)

          await supabase.from('wallet_transactions').insert({
            user_id: tx.seller_id,
            type: 'escrow_release',
            amount: sellerPayout,
            fee: escrowFee,
            status: 'completed',
            reference_id: transactionId,
            payment_method: 'internal_balance',
            description: `Escrow earnings released for "${listingTitle}" (#${transactionId.slice(0, 8)})`
          })
        }
      }
    } catch (wErr) {
      console.warn('Wallet escrow release error:', wErr)
    }

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

/**
 * Buyer Early Acceptance:
 * Buyer inspects the account, changes password/2FA, and authorizes early escrow release to seller.
 */
export async function buyerAcceptAndRelease(transactionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated. Please log in.' }

  const { data: tx, error: fetchErr } = await supabase
    .from('transactions')
    .select('id, buyer_id, seller_id, status, listings(title)')
    .eq('id', transactionId)
    .single()

  if (fetchErr || !tx) return { error: 'Transaction not found' }
  if (tx.buyer_id !== user.id) return { error: 'Only the authorized buyer can accept this transaction.' }
  if (tx.status !== 'buyer_7_day_evaluation') {
    return { error: 'Transaction is not in the evaluation phase.' }
  }

  // Advance state to completed
  const res = await updateTransactionState(transactionId, 'completed')
  if (res?.error) return res

  // Log timeline
  await supabase.from('transaction_timeline').insert({
    transaction_id: transactionId,
    status: 'completed',
    description: 'Buyer completed inspection and authorized early escrow payout to seller.'
  })

  revalidatePath(`/dashboard/transactions/${transactionId}`)
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

/**
 * Buyer Opens Dispute:
 * Freezes transaction, registers formal claim, and alerts compliance officer.
 */
export async function buyerOpenDispute(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated. Please log in.' }

  const transactionId = formData.get('transactionId') as string
  const category = (formData.get('category') as string) || 'other'
  const reasonText = (formData.get('reason') as string)?.trim()
  const evidenceFile = formData.get('evidence') as File

  if (!transactionId || !reasonText) {
    return { error: 'Please provide a detailed reason for opening this dispute.' }
  }

  const { data: tx } = await supabase
    .from('transactions')
    .select('id, buyer_id, seller_id, status, listings(title)')
    .eq('id', transactionId)
    .single()

  if (!tx) return { error: 'Transaction not found' }
  if (tx.buyer_id !== user.id) return { error: 'Only the buyer can open a dispute ticket on this deal.' }

  let evidenceUrl: string | null = null
  if (evidenceFile && evidenceFile.size > 0) {
    try {
      const ext = evidenceFile.name?.split('.').pop() || 'jpg'
      const filePath = `disputes/${transactionId}/${Date.now()}.${ext}`
      const { data: uploadData } = await supabase.storage
        .from('listing-images')
        .upload(filePath, evidenceFile, { upsert: true })

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(filePath)
        evidenceUrl = publicUrl
      }
    } catch (uploadErr) {
      console.warn('Dispute evidence upload warning:', uploadErr)
    }
  }

  const fullReason = `[${category.toUpperCase().replace(/_/g, ' ')}] ${reasonText}`

  // 1. Insert dispute record
  const { error: disputeErr } = await supabase
    .from('disputes')
    .insert({
      transaction_id: transactionId,
      opened_by: user.id,
      reason: fullReason,
      evidence_url: evidenceUrl,
      status: 'open'
    })

  if (disputeErr) return { error: disputeErr.message }

  // 2. Update transaction status to disputed
  await supabase
    .from('transactions')
    .update({ status: 'disputed' })
    .eq('id', transactionId)

  // 3. Add timeline entry
  await supabase.from('transaction_timeline').insert({
    transaction_id: transactionId,
    status: 'disputed',
    description: `Escrow dispute opened by buyer: ${reasonText.slice(0, 80)}...`
  })

  // 4. Alert Seller & Admin
  await createNotification(
    tx.seller_id,
    `Dispute Opened: "${(tx.listings as any)?.title || 'Account'}"`,
    `The buyer has reported an issue and opened an escrow dispute ticket. An Escrow Officer is reviewing the case.`,
    `/dashboard/transactions/${transactionId}`,
    'transaction'
  )

  revalidatePath(`/dashboard/transactions/${transactionId}`)
  revalidatePath('/dashboard/transactions')
  revalidatePath('/admin/disputes')
  return { success: true }
}

/**
 * Seller Submits Payout Destination (Crypto USDT or Bank Wire)
 */
export async function submitSellerPayoutDetails(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated. Please log in.' }

  const transactionId = formData.get('transactionId') as string
  const payoutMethod = formData.get('payoutMethod') as string

  if (!transactionId || !payoutMethod) {
    return { error: 'Missing required payout fields.' }
  }

  const { data: tx } = await supabase
    .from('transactions')
    .select('id, seller_id, status, agreed_price')
    .eq('id', transactionId)
    .single()

  if (!tx) return { error: 'Transaction not found.' }
  if (tx.seller_id !== user.id) {
    return { error: 'Only the seller can provide settlement destination details.' }
  }

  let details: any = {}
  if (payoutMethod === 'crypto_usdt') {
    const network = formData.get('network') as string
    const address = (formData.get('address') as string)?.trim()
    if (!address) return { error: 'Receiving USDT wallet address is required.' }
    details = { network, address }
  } else {
    const account_name = (formData.get('account_name') as string)?.trim()
    const bank_name = (formData.get('bank_name') as string)?.trim()
    const account_number = (formData.get('account_number') as string)?.trim()
    const routing_swift = (formData.get('routing_swift') as string)?.trim() || ''
    const country = (formData.get('country') as string)?.trim() || ''

    if (!account_name || !bank_name || !account_number) {
      return { error: 'Account name, bank name, and account/IBAN number are required.' }
    }
    details = { account_name, bank_name, account_number, routing_swift, country }
  }

  const { error: updateErr } = await supabase
    .from('transactions')
    .update({
      seller_payout_method: payoutMethod,
      seller_payout_details: details,
      payout_status: 'pending'
    })
    .eq('id', transactionId)

  if (updateErr) return { error: updateErr.message }

  // Add timeline entry
  await supabase.from('transaction_timeline').insert({
    transaction_id: transactionId,
    status: tx.status,
    description: `Seller registered ${payoutMethod === 'crypto_usdt' ? 'Crypto USDT' : 'Bank Wire'} settlement destination.`
  })

  revalidatePath(`/dashboard/transactions/${transactionId}`)
  revalidatePath('/admin/transactions')
  return { success: true }
}

/**
 * Admin Disburses Seller Payout:
 * Records the blockchain TxHash or Bank Wire reference and completes disbursement.
 */
export async function adminDisburseSellerPayout(transactionId: string, txHashOrRef: string, notes?: string) {
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

  const { data: tx } = await supabase
    .from('transactions')
    .select('id, seller_id, agreed_price, escrow_fee, listings(title)')
    .eq('id', transactionId)
    .single()

  if (!tx) return { error: 'Transaction not found' }

  const escrowFee = tx.escrow_fee || Math.round(tx.agreed_price * 0.05 * 100) / 100
  const netAmount = Math.max(0, tx.agreed_price - escrowFee)

  const { error: updateErr } = await supabase
    .from('transactions')
    .update({
      payout_status: 'completed',
      payout_tx_hash: txHashOrRef.trim(),
      payout_sent_at: new Date().toISOString()
    })
    .eq('id', transactionId)

  if (updateErr) return { error: updateErr.message }

  // Timeline
  await supabase.from('transaction_timeline').insert({
    transaction_id: transactionId,
    status: 'completed',
    description: `Escrow Desk disbursed seller proceeds of $${netAmount}. Ref: ${txHashOrRef.trim()}`
  })

  // Alert Seller
  await createNotification(
    tx.seller_id,
    `Payout Sent: $${netAmount} USD`,
    `Dealoura Escrow Desk has disbursed your earnings for "${(tx.listings as any)?.title || 'Account'}". Reference/TxHash: ${txHashOrRef.trim()}`,
    `/dashboard/transactions/${transactionId}`,
    'transaction'
  )

  revalidatePath(`/dashboard/transactions/${transactionId}`)
  revalidatePath('/admin/transactions')
  return { success: true }
}
