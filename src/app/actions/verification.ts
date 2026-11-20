'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createNotification } from './notifications'
import { renderKycStatusEmail } from '@/utils/email-templates'

/**
 * Level 2 Identity Verification:
 * Government ID + Selfie holding ID with handwritten note ("Dealoura + Date + Username")
 */
export async function submitLevel2Verification(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated. Please log in.' }

  const idDoc = formData.get('id_document') as File
  const selfie = formData.get('selfie') as File

  if (!idDoc || idDoc.size === 0) {
    return { error: 'Please upload a photo or scan of your Government-Issued ID.' }
  }
  if (!selfie || selfie.size === 0) {
    return { error: 'Please upload a selfie holding your ID and the handwritten note.' }
  }

  // Upload Government ID
  const idExt = idDoc.name ? idDoc.name.split('.').pop()?.toLowerCase() || 'jpg' : 'jpg'
  const idPath = `${user.id}/id_${Date.now()}.${idExt}`
  const { error: idUploadError } = await supabase.storage
    .from('verifications')
    .upload(idPath, idDoc, { upsert: true })

  if (idUploadError) {
    return { error: `ID document upload failed: ${idUploadError.message}` }
  }

  // Upload Selfie
  const selfieExt = selfie.name ? selfie.name.split('.').pop()?.toLowerCase() || 'jpg' : 'jpg'
  const selfiePath = `${user.id}/selfie_${Date.now()}.${selfieExt}`
  const { error: selfieUploadError } = await supabase.storage
    .from('verifications')
    .upload(selfiePath, selfie, { upsert: true })

  if (selfieUploadError) {
    return { error: `Selfie upload failed: ${selfieUploadError.message}` }
  }

  // Insert verification record
  const payload: any = {
    user_id: user.id,
    status: 'submitted',
    verification_type: 'level_2_identity',
    id_document_url: idPath,
    selfie_url: selfiePath,
    evidence_url: idPath, // fallback for legacy queries
  }

  const { error: dbError } = await supabase
    .from('verifications')
    .insert(payload)

  if (dbError) {
    console.error('Verification insert error:', dbError)
    return { error: dbError.message }
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/profile/verification')
  revalidatePath('/admin/verifications')
  return { success: true }
}

/**
 * Level 3 Trusted Seller Verification:
 * Account ownership proof: Channel URL + Bio Verification Code + Studio Analytics Screenshot
 */
export async function submitLevel3Verification(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated. Please log in.' }

  const accountUrl = (formData.get('account_url') as string)?.trim()
  const bioCode = (formData.get('bio_code') as string)?.trim()
  const studioProof = formData.get('studio_proof') as File

  if (!accountUrl) {
    return { error: 'Please provide the public link to your social media account/channel.' }
  }
  if (!bioCode) {
    return { error: 'Verification bio code is missing. Please refresh and try again.' }
  }
  if (!studioProof || studioProof.size === 0) {
    return { error: 'Please upload a screenshot or video from inside your Creator Studio / Analytics.' }
  }

  const proofExt = studioProof.name ? studioProof.name.split('.').pop()?.toLowerCase() || 'jpg' : 'jpg'
  const proofPath = `${user.id}/studio_${Date.now()}.${proofExt}`
  const { error: uploadError } = await supabase.storage
    .from('verifications')
    .upload(proofPath, studioProof, { upsert: true })

  if (uploadError) {
    return { error: `Studio screenshot upload failed: ${uploadError.message}` }
  }

  const payload: any = {
    user_id: user.id,
    status: 'submitted',
    verification_type: 'level_3_ownership',
    account_url: accountUrl,
    bio_code: bioCode,
    evidence_url: proofPath,
  }

  const { error: dbError } = await supabase
    .from('verifications')
    .insert(payload)

  if (dbError) {
    console.error('Level 3 verification error:', dbError)
    return { error: dbError.message }
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/profile/verification')
  revalidatePath('/admin/verifications')
  return { success: true }
}

/**
 * Legacy / General verification fallback
 */
export async function submitVerification(formData: FormData) {
  return submitLevel2Verification(formData)
}

/**
 * Admin action to approve or reject a verification request
 */
export async function updateVerificationStatus(
  verificationId: string, 
  newStatus: string, 
  adminNotes?: string,
  approvedLevel?: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Fetch current verification details
  const { data: verif, error: fetchErr } = await supabase
    .from('verifications')
    .select('*')
    .eq('id', verificationId)
    .single()

  if (fetchErr || !verif) {
    return { error: 'Verification record not found' }
  }

  // 2. Update status in verifications table using valid enum value ('verified' or 'rejected')
  const isApproved = newStatus === 'approved' || newStatus === 'verified'
  const dbStatus = isApproved ? 'verified' : newStatus === 'rejected' ? 'rejected' : 'under_review'

  const { error: updateErr } = await supabase
    .from('verifications')
    .update({ 
      status: dbStatus,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', verificationId)

  if (updateErr) {
    console.error('Error updating verification status in DB:', updateErr)
    return { error: updateErr.message }
  }

  // 3. If approved, upgrade user's profile verification tier
  if (verif.user_id) {
    if (isApproved) {
      const isL3 = approvedLevel === 3 || verif.verification_type === 'level_3_ownership'
      
      const profileUpdates: any = {
        is_verified: true,
        verification_level: isL3 ? 3 : 2,
      }
      if (isL3) {
        profileUpdates.is_trusted = true
      }

      await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', verif.user_id)
    }

    // 4. Send in-app notification & email alert
    try {
      const { data: targetProfile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('id', verif.user_id)
        .single()

      const username = targetProfile?.username || 'Seller'
      const isL3 = approvedLevel === 3 || verif.verification_type === 'level_3_ownership'

      const emailHtml = renderKycStatusEmail({
        recipientName: username,
        status: isApproved ? 'verified' : 'rejected',
        notes: adminNotes
      })

      const title = isApproved 
        ? (isL3 ? '🏆 Trusted Partner Status Approved!' : '🛡️ Verified Seller Status Approved!')
        : 'KYC Verification Update'

      const message = isApproved
        ? (isL3 
            ? 'Congratulations! You are now an officially recognized Dealoura Trusted Partner with priority listing placement and the Gold Badge.'
            : 'Congratulations! Your identity has been verified. The Verified Seller badge is now active on your profile and listings.')
        : `Your verification submission was not approved. ${adminNotes ? `Reason: ${adminNotes}` : 'Please review and re-submit your documents.'}`

      await createNotification(
        verif.user_id,
        title,
        message,
        '/dashboard/profile/verification',
        'system',
        emailHtml
      )
    } catch (notifErr) {
      console.warn('KYC notification warning:', notifErr)
    }
  }

  revalidatePath('/admin/verifications')
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/profile/verification')
  return { success: true }
}
