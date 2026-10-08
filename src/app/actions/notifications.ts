import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/utils/resend'
import { revalidatePath } from 'next/cache'

/**
 * Creates an in-app notification and optionally sends an email if the user has an email address.
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  const supabase = await createClient()

  // 1. Create the in-app notification
  const { error: notifError } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      link,
      is_read: false
    })

  if (notifError) {
    console.error('Failed to create in-app notification:', notifError)
    return { success: false, error: notifError.message }
  }

  // 2. Fetch the user's email to send a Resend email
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('email, username')
    .eq('id', userId)
    .single()

  if (profile?.email) {
    // 3. Send email using our Resend utility
    const htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Dealoura</h2>
        <p style="font-size: 16px; color: #374151;">Hi ${profile.username},</p>
        <p style="font-size: 16px; color: #374151; font-weight: bold;">${title}</p>
        <p style="font-size: 16px; color: #4b5563;">${message}</p>
        ${
          link 
            ? `<a href="https://dealoura.com${link}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Details</a>`
            : ''
        }
        <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">This is an automated message from Dealoura.</p>
      </div>
    `

    await sendEmail({
      to: profile.email,
      subject: `Dealoura: ${title}`,
      html: htmlContent
    })
  }

  return { success: true }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/notifications')
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)

  revalidatePath('/dashboard/notifications')
  return { success: true }
}
