'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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

  const { error } = await supabase
    .from('verifications')
    .update({ 
      status: newStatus,
      admin_notes: adminNotes 
    })
    .eq('id', verificationId)

  if (error) return { error: error.message }

  revalidatePath('/admin/verifications')
  return { success: true }
}
