'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { updateTransactionState, adminDisburseSellerPayout } from './transactions'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden: Administrator access required')
  }

  return { supabase, user }
}

export async function approveListing(listingId: string) {
  try {
    const { supabase } = await assertAdmin()

    const { error } = await supabase
      .from('listings')
      .update({ status: 'approved' })
      .eq('id', listingId)

    if (error) return { error: error.message }

    revalidatePath('/admin/listings')
    revalidatePath('/admin')
    revalidatePath('/marketplace')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' }
  }
}

export async function rejectListing(listingId: string) {
  try {
    const { supabase } = await assertAdmin()

    const { error } = await supabase
      .from('listings')
      .update({ status: 'rejected' })
      .eq('id', listingId)

    if (error) return { error: error.message }

    revalidatePath('/admin/listings')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' }
  }
}

export async function adminAdvanceEscrow(transactionId: string, nextStatus: string) {
  try {
    await assertAdmin()

    // Use updateTransactionState so platform-specific hold durations (YouTube 7d vs Other 15m),
    // notifications, and emails execute cleanly
    const res = await updateTransactionState(transactionId, nextStatus)
    if (res?.error) return res

    revalidatePath('/admin/transactions')
    revalidatePath('/admin')
    revalidatePath(`/dashboard/transactions/${transactionId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' }
  }
}

export async function adminDisburseSellerPayoutAction(formData: FormData) {
  try {
    await assertAdmin()
    const transactionId = formData.get('transactionId') as string
    const txHashOrRef = (formData.get('txHashOrRef') as string)?.trim()
    const notes = (formData.get('notes') as string)?.trim()

    if (!transactionId || !txHashOrRef) {
      return { error: 'Transaction ID and TxHash/Reference are required.' }
    }

    return await adminDisburseSellerPayout(transactionId, txHashOrRef, notes)
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' }
  }
}

export async function sendTestEmailAction(targetEmail?: string) {
  try {
    const { supabase, user } = await assertAdmin()
    
    let recipient = targetEmail?.trim()
    if (!recipient) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', user.id)
        .single()
      recipient = profile?.email || user.email
    }

    if (!recipient) {
      return { error: 'No recipient email address found. Please specify an email.' }
    }

    const { sendEmail } = await import('@/utils/resend')
    const { renderTestEmail } = await import('@/utils/email-templates')

    const emailHtml = renderTestEmail({ adminEmail: recipient })

    const result = await sendEmail({
      to: recipient,
      subject: 'Dealoura Resend Test Notification',
      html: emailHtml
    })

    if (!result.success) {
      return { error: typeof result.error === 'string' ? result.error : JSON.stringify(result.error) || 'Resend API key missing or invalid' }
    }

    return { success: true, recipient }
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' }
  }
}
