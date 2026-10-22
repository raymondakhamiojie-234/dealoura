'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createNotification } from './notifications'
import { renderKycStatusEmail } from '@/utils/email-templates'

export async function submitVerification(formData: FormData) {
  const file = formData.get('evidence') as File
  const notes = formData.get('notes') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!file || file.size === 0) {
    return { error: 'Please upload an evidence file' }
  }

  // 1. Upload file to private storage bucket
  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/${Date.now()}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('verifications')
    .upload(filePath, file)

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` }

  // 2. Create the verification record
  const { error: dbError } = await supabase
    .from('verifications')
    .insert({
      user_id: user.id,
      status: 'submitted',
      evidence_url: filePath
    })

  if (dbError) return { error: dbError.message }

  revalidatePath('/dashboard/profile')
  redirect('/dashboard/profile')
}

export async function updateVerificationStatus(verificationId: string, newStatus: string, adminNotes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: updatedVerification, error } = await supabase
    .from('verifications')
    .update({ 
      status: newStatus,
      admin_notes: adminNotes 
    })
    .eq('id', verificationId)
    .select('user_id')
    .single()

  if (error) return { error: error.message }

  // Sync is_verified on the user's public profile
  if (updatedVerification?.user_id) {
    const isApproved = newStatus === 'verified'

    await supabase
      .from('user_profiles')
      .update({ is_verified: isApproved })
      .eq('id', updatedVerification.user_id)

    // Send in-app and email alert to user
    try {
      const { data: targetProfile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('id', updatedVerification.user_id)
        .single()

      const username = targetProfile?.username || 'Seller'

      const emailHtml = renderKycStatusEmail({
        recipientName: username,
        status: isApproved ? 'verified' : 'rejected',
        notes: adminNotes
      })

      const title = isApproved ? 'KYC Verification Approved!' : 'KYC Verification Update'
      const message = isApproved
        ? 'Congratulations! Your identity has been verified. The Verified Seller badge is now active on your profile and listings.'
        : `Your KYC verification was not approved. ${adminNotes ? `Reason: ${adminNotes}` : 'Please review and re-submit your documents.'}`

      await createNotification(
        updatedVerification.user_id,
        title,
        message,
        '/dashboard/profile',
        'system',
        emailHtml
      )
    } catch (notifErr) {
      console.warn('KYC notification warning:', notifErr)
    }
  }

  revalidatePath('/admin/verifications')
  return { success: true }
}
