'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function openDispute(formData: FormData) {
  const transaction_id = formData.get('transaction_id') as string
  const reason = formData.get('reason') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('disputes')
    .insert({
      transaction_id,
      opened_by: user.id,
      reason,
      status: 'open'
    })

  if (error) return { error: error.message }

  // Update transaction status to disputed
  await supabase
    .from('transactions')
    .update({ status: 'disputed' })
    .eq('id', transaction_id)

  revalidatePath(`/dashboard/transactions/${transaction_id}`)
  redirect(`/dashboard/transactions/${transaction_id}`)
}

export async function resolveDispute(disputeId: string, transactionId: string, resolution: string, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Update dispute status
  const { error } = await supabase
    .from('disputes')
    .update({
      status: resolution, // 'resolved_buyer', 'resolved_seller', 'closed'
      resolution_notes: notes
    })
    .eq('id', disputeId)

  if (error) return { error: error.message }

  // Update transaction status back to cancelled or completed based on resolution
  const finalTxStatus = resolution === 'resolved_buyer' ? 'cancelled' : 'completed'

  await supabase
    .from('transactions')
    .update({ status: finalTxStatus })
    .eq('id', transactionId)

  revalidatePath('/admin/disputes')
  return { success: true }
}
