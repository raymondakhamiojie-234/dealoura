'use server'

import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/utils/resend'
import { wrapEmailLayout } from '@/utils/email-templates'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'message' | 'offer' | 'transaction' | 'system'

/**
 * Creates an in-app notification and dispatches a branded email via Resend (non-blocking).
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string,
  type: NotificationType = 'system',
  customEmailHtml?: string
) {
  const supabase = await createClient()

  // 1. Insert in-app notification
  try {
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        link: link || null,
        is_read: false
      })

    if (notifError) {
      console.warn('In-app notification note:', notifError.message)
    }
  } catch (err) {
    console.warn('Exception creating in-app notification:', err)
  }

  // 2. Fetch user's profile to dispatch branded Resend email
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email, username')
      .eq('id', userId)
      .single()

    if (profile?.email) {
      const emailHtml = customEmailHtml || wrapEmailLayout({
        title: `Dealoura: ${title}`,
        headline: title,
        recipientName: profile.username || 'there',
        badgeText: type === 'offer' ? 'Offer Alert' : type === 'transaction' ? 'Escrow Update' : type === 'message' ? 'New Message' : 'Notification',
        badgeColor: type === 'offer' ? 'blue' : type === 'transaction' ? 'green' : 'amber',
        contentHtml: `<p>${message}</p>`,
        ctaText: link ? 'View Details' : undefined,
        ctaUrl: link
      })

      // Send asynchronously without throwing
      await sendEmail({
        to: profile.email,
        subject: `Dealoura: ${title}`,
        html: emailHtml
      })
    }
  } catch (emailErr) {
    console.warn('Non-blocking email delivery warning:', emailErr)
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
