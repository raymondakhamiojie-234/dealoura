import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Define the default "From" address (requires domain verification in Resend)
const DEFAULT_FROM = 'Dealoura <notifications@dealoura.com>';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email not sent to:', to, 'Subject:', subject);
    return { success: false, error: 'Resend API key missing' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception sending email via Resend:', error);
    return { success: false, error };
  }
}
