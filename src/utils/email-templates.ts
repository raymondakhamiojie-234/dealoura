/**
 * Dealoura Centralized Email Template Engine
 * Generates responsive, high-converting HTML emails compatible with all major email clients.
 */

export function getBaseSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

interface EmailLayoutOptions {
  title: string
  preheader?: string
  headline: string
  recipientName: string
  contentHtml: string
  ctaText?: string
  ctaUrl?: string
  badgeText?: string
  badgeColor?: 'blue' | 'green' | 'amber' | 'purple' | 'red'
}

export function wrapEmailLayout(options: EmailLayoutOptions): string {
  const {
    title,
    preheader = title,
    headline,
    recipientName,
    contentHtml,
    ctaText,
    ctaUrl,
    badgeText = 'SafeTrade Escrow Notification',
    badgeColor = 'blue'
  } = options

  const badgeBg = {
    blue: '#eff6ff',
    green: '#ecfdf5',
    amber: '#fffbeb',
    purple: '#faf5ff',
    red: '#fef2f2'
  }[badgeColor]

  const badgeTextColor = {
    blue: '#1d4ed8',
    green: '#047857',
    amber: '#b45309',
    purple: '#6b21a8',
    red: '#b91c1c'
  }[badgeColor]

  const fullCtaUrl = ctaUrl?.startsWith('http')
    ? ctaUrl
    : `${getBaseSiteUrl()}${ctaUrl?.startsWith('/') ? '' : '/'}${ctaUrl || ''}`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 32px; text-align: left; }
    .brand-title { color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 0; display: inline-block; }
    .brand-accent { color: #3b82f6; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 8px; }
    .body-content { padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; }
    .headline { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .greeting { font-size: 15px; color: #64748b; margin-bottom: 20px; }
    .card-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
    .cta-btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; }
    .footer { background-color: #f1f5f9; padding: 24px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer-secure { font-weight: 600; color: #475569; margin-bottom: 6px; }
  </style>
</head>
<body>
  <!-- Preheader preview text -->
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">
    ${preheader}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 20px 10px;">
    <tr>
      <td align="center">
        <div class="email-container">
          
          <!-- Header -->
          <div class="header">
            <h1 class="brand-title">Deal<span class="brand-accent">oura</span></h1>
            <br />
            <span class="badge" style="background-color: ${badgeBg}; color: ${badgeTextColor};">
              ${badgeText}
            </span>
          </div>

          <!-- Body Content -->
          <div class="body-content">
            <h2 class="headline">${headline}</h2>
            <p class="greeting">Hi ${recipientName || 'there'},</p>
            
            ${contentHtml}

            ${ctaText && ctaUrl ? `
            <div style="margin: 28px 0 10px 0; text-align: left;">
              <a href="${fullCtaUrl}" class="cta-btn" target="_blank">
                ${ctaText} &rarr;
              </a>
            </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-secure">Protected by Dealoura SafeTrade Escrow Protocol</p>
            <p style="margin: 0;">
              All accounts and payments are verified through neutral escrow agents. Never transfer login credentials or payment outside of Dealoura.
            </p>
            <p style="margin-top: 12px; font-size: 11px; color: #94a3b8;">
              Dealoura Inc. &bull; <a href="${getBaseSiteUrl()}" style="color: #64748b; text-decoration: underline;">dealoura.com</a>
            </p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// 1. New Offer Received Email (To Seller)
export function renderNewOfferEmail(params: {
  sellerName: string
  buyerUsername: string
  listingTitle: string
  offerAmount: number
  offerId?: string
}) {
  return wrapEmailLayout({
    title: `New Offer: $${params.offerAmount} on "${params.listingTitle}"`,
    headline: 'You Received a New Offer!',
    recipientName: params.sellerName,
    badgeText: 'New Offer Received',
    badgeColor: 'blue',
    contentHtml: `
      <p>A buyer has made an offer on your listed account.</p>
      <div class="card-box">
        <table width="100%" style="font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Account Listing:</td>
            <td align="right" style="font-weight: 700; color: #0f172a;">${params.listingTitle}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Prospective Buyer:</td>
            <td align="right" style="font-weight: 600; color: #2563eb;">@${params.buyerUsername}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Offer Amount:</td>
            <td align="right" style="font-weight: 800; font-size: 18px; color: #16a34a;">$${params.offerAmount}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        You can accept this offer to immediately begin the Dealoura Escrow process, or submit a counter-offer.
      </p>
    `,
    ctaText: 'Review Offer in Dashboard',
    ctaUrl: '/dashboard/offers'
  })
}

// 2. Offer Status Updated Email (To Buyer: Accepted, Countered, or Rejected)
export function renderOfferStatusEmail(params: {
  buyerName: string
  sellerUsername: string
  listingTitle: string
  status: 'accepted' | 'countered' | 'rejected'
  amount: number
  counterAmount?: number
  transactionId?: string
}) {
  const isAccepted = params.status === 'accepted'
  const isCountered = params.status === 'countered'

  let headline = 'Offer Accepted!'
  let badgeColor: 'green' | 'amber' | 'red' = 'green'
  let badgeText = 'Offer Accepted'
  let bodyText = `Good news! The seller has <strong>accepted</strong> your offer of <strong>$${params.amount}</strong> for <strong>${params.listingTitle}</strong>.`
  let ctaText = 'Complete Escrow Checkout'
  let ctaUrl = params.transactionId ? `/dashboard/transactions/${params.transactionId}` : '/dashboard/offers'

  if (isCountered) {
    headline = 'Counter-Offer Received'
    badgeColor = 'amber'
    badgeText = 'Counter-Offer'
    bodyText = `The seller has sent a counter-offer of <strong>$${params.counterAmount}</strong> for <strong>${params.listingTitle}</strong>.`
    ctaText = 'View Counter-Offer'
    ctaUrl = '/dashboard/offers'
  } else if (!isAccepted) {
    headline = 'Offer Declined'
    badgeColor = 'red'
    badgeText = 'Offer Declined'
    bodyText = `The seller has declined your offer on <strong>${params.listingTitle}</strong>. You may browse other verified channels or submit an updated offer.`
    ctaText = 'Browse Marketplace'
    ctaUrl = '/'
  }

  return wrapEmailLayout({
    title: `${headline}: "${params.listingTitle}"`,
    headline,
    recipientName: params.buyerName,
    badgeText,
    badgeColor,
    contentHtml: `
      <p>${bodyText}</p>
      <div class="card-box">
        <table width="100%" style="font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Listing:</td>
            <td align="right" style="font-weight: 700; color: #0f172a;">${params.listingTitle}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Seller:</td>
            <td align="right" style="font-weight: 600; color: #2563eb;">@${params.sellerUsername}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">${isCountered ? 'Counter Price:' : 'Final Price:'}</td>
            <td align="right" style="font-weight: 800; font-size: 18px; color: ${isAccepted ? '#16a34a' : '#0f172a'};">
              $${isCountered ? params.counterAmount : params.amount}
            </td>
          </tr>
        </table>
      </div>
      ${isAccepted ? `
      <p style="font-size: 13px; color: #059669; font-weight: 600;">
        &check; Your escrow vault is ready. Deposit your funds to begin credentials verification.
      </p>
      ` : ''}
    `,
    ctaText,
    ctaUrl
  })
}

// 3. Escrow Deposit Secured Email (To Seller)
export function renderEscrowDepositEmail(params: {
  sellerName: string
  buyerUsername: string
  listingTitle: string
  agreedPrice: number
  transactionId: string
}) {
  return wrapEmailLayout({
    title: `Payment Secured in Escrow: "${params.listingTitle}"`,
    headline: 'Buyer Payment Secured in Escrow!',
    recipientName: params.sellerName,
    badgeText: 'Escrow Vault Locked',
    badgeColor: 'blue',
    contentHtml: `
      <p>The buyer has deposited <strong>$${params.agreedPrice}</strong> into the Dealoura Escrow Vault for your listing.</p>
      <div class="card-box">
        <table width="100%" style="font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Listing:</td>
            <td align="right" style="font-weight: 700; color: #0f172a;">${params.listingTitle}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Buyer:</td>
            <td align="right" style="font-weight: 600; color: #2563eb;">@${params.buyerUsername}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Secured Funds:</td>
            <td align="right" style="font-weight: 800; font-size: 18px; color: #16a34a;">$${params.agreedPrice} USD</td>
          </tr>
        </table>
      </div>
      <p style="font-weight: 600; color: #0f172a;">Next Action Required:</p>
      <p style="font-size: 13px; color: #475569;">
        Please open the transaction tracker and securely submit the account transfer credentials. Our Escrow Agent will inspect the details before handover.
      </p>
    `,
    ctaText: 'Submit Account Credentials',
    ctaUrl: `/dashboard/transactions/${params.transactionId}`
  })
}

// 4. Credentials Submitted Email (To Buyer & Staff)
export function renderCredentialsSubmittedEmail(params: {
  recipientName: string
  listingTitle: string
  transactionId: string
}) {
  return wrapEmailLayout({
    title: `Credentials in Escrow Inspection: "${params.listingTitle}"`,
    headline: 'Account Credentials Handed Over',
    recipientName: params.recipientName,
    badgeText: 'Escrow Verification',
    badgeColor: 'purple',
    contentHtml: `
      <p>The seller has submitted the account login credentials to the Dealoura Escrow Agent for <strong>${params.listingTitle}</strong>.</p>
      <div class="card-box">
        <p style="margin: 0; font-size: 14px; color: #475569;">
          &bull; <strong>Inspection Phase:</strong> Our staff is checking credentials, 2FA status, and asset ownership.<br>
          &bull; <strong>Next:</strong> Once verified, your 7-day buyer evaluation countdown will begin.
        </p>
      </div>
    `,
    ctaText: 'Open Escrow Tracker',
    ctaUrl: `/dashboard/transactions/${params.transactionId}`
  })
}

// 5. 7-Day Inspection Countdown Started Email (To Buyer)
export function renderEvaluationCountdownStartedEmail(params: {
  buyerName: string
  listingTitle: string
  evaluationEndsAt: string
  transactionId: string
}) {
  const formattedDate = new Date(params.evaluationEndsAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return wrapEmailLayout({
    title: `Your 7-Day Inspection Window is Active: "${params.listingTitle}"`,
    headline: '7-Day Evaluation Period Active',
    recipientName: params.buyerName,
    badgeText: 'Inspection Active',
    badgeColor: 'amber',
    contentHtml: `
      <p>The Dealoura Escrow Agent has verified the account credentials for <strong>${params.listingTitle}</strong>.</p>
      <div class="card-box">
        <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #0f172a;">
          Evaluation Deadline: <span style="color: #d97706;">${formattedDate}</span>
        </p>
        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
          &check; Log in and update security email and passwords.<br>
          &check; Verify subscriber analytics, monetization standing, and organic metrics.<br>
          &check; Once satisfied, click "Confirm Account Received" to release funds to the seller.
        </p>
      </div>
    `,
    ctaText: 'View Countdown Ticker',
    ctaUrl: `/dashboard/transactions/${params.transactionId}`
  })
}

// 6. Escrow Completed Email (To Buyer or Seller)
export function renderEscrowCompletedEmail(params: {
  recipientName: string
  role: 'buyer' | 'seller'
  listingTitle: string
  agreedPrice: number
  transactionId: string
}) {
  const isSeller = params.role === 'seller'

  return wrapEmailLayout({
    title: `Deal Complete: "${params.listingTitle}"`,
    headline: isSeller ? 'Payout Released!' : 'Transaction Complete!',
    recipientName: params.recipientName,
    badgeText: 'Escrow Completed',
    badgeColor: 'green',
    contentHtml: `
      <p>
        ${isSeller
          ? `Congratulations! The escrow funds of <strong>$${params.agreedPrice}</strong> for <strong>${params.listingTitle}</strong> have been released to you.`
          : `Congratulations! The ownership transfer of <strong>${params.listingTitle}</strong> is officially finalized.`
        }
      </p>
      <div class="card-box">
        <table width="100%" style="font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Listing:</td>
            <td align="right" style="font-weight: 700; color: #0f172a;">${params.listingTitle}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px;">Total Amount:</td>
            <td align="right" style="font-weight: 800; color: #16a34a;">$${params.agreedPrice} USD</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Escrow Status:</td>
            <td align="right" style="font-weight: 700; color: #059669;">Completed & Verified &check;</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        Thank you for trading safely with Dealoura Escrow. Don't forget to leave feedback!
      </p>
    `,
    ctaText: 'View Transaction Receipt',
    ctaUrl: `/dashboard/transactions/${params.transactionId}`
  })
}

// 7. KYC Verification Status Email
export function renderKycStatusEmail(params: {
  recipientName: string
  status: 'verified' | 'rejected'
  notes?: string
}) {
  const isVerified = params.status === 'verified'

  return wrapEmailLayout({
    title: isVerified ? 'KYC Verification Approved!' : 'KYC Verification Update',
    headline: isVerified ? 'Identity Verified &check;' : 'Verification Incomplete',
    recipientName: params.recipientName,
    badgeText: isVerified ? 'Verified Seller' : 'Action Required',
    badgeColor: isVerified ? 'green' : 'red',
    contentHtml: `
      <p>
        ${isVerified
          ? 'Great news! Your government ID documents have been reviewed and approved by our compliance team. Your public profile now features the <strong>Verified Seller Badge</strong>.'
          : 'Our compliance team reviewed your submitted identification evidence, but could not approve it at this time.'
        }
      </p>
      ${params.notes ? `
      <div class="card-box">
        <p style="margin: 0; font-size: 13px; color: #475569;">
          <strong>Reviewer Notes:</strong> ${params.notes}
        </p>
      </div>
      ` : ''}
      ${!isVerified ? `
      <p style="font-size: 13px; color: #64748b;">
        Please re-submit a clear, unexpired government ID or supporting proof of ownership.
      </p>
      ` : ''}
    `,
    ctaText: isVerified ? 'View Public Profile' : 'Re-Submit Documents',
    ctaUrl: '/dashboard/profile'
  })
}

// 8. New Direct Chat Message Email
export function renderNewMessageEmail(params: {
  recipientName: string
  senderUsername: string
  snippet: string
  conversationId: string
}) {
  return wrapEmailLayout({
    title: `New message from @${params.senderUsername}`,
    headline: 'You Have a New Message',
    recipientName: params.recipientName,
    badgeText: 'Direct Message',
    badgeColor: 'blue',
    contentHtml: `
      <p><strong>@${params.senderUsername}</strong> sent you a message on Dealoura:</p>
      <div class="card-box" style="border-left: 4px solid #2563eb;">
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-style: italic;">
          "${params.snippet}"
        </p>
      </div>
      <p style="font-size: 12px; color: #64748b;">
        Reply promptly to maintain high response rates and build seller trust.
      </p>
    `,
    ctaText: 'Open Chat & Reply',
    ctaUrl: `/dashboard/messages/${params.conversationId}`
  })
}

// 9. Dispute Alert Email
export function renderDisputeEmail(params: {
  recipientName: string
  listingTitle: string
  reason: string
  isResolved?: boolean
  resolutionNotes?: string
  transactionId: string
}) {
  return wrapEmailLayout({
    title: params.isResolved ? `Dispute Resolved: "${params.listingTitle}"` : `Dispute Opened: "${params.listingTitle}"`,
    headline: params.isResolved ? 'Dispute Resolved' : 'Escrow Dispute Opened',
    recipientName: params.recipientName,
    badgeText: 'Escrow Mediation',
    badgeColor: params.isResolved ? 'green' : 'amber',
    contentHtml: `
      <p>
        ${params.isResolved
          ? `The dispute regarding <strong>${params.listingTitle}</strong> has been resolved by the Dealoura moderation staff.`
          : `A dispute has been initiated for transaction <strong>${params.listingTitle}</strong>.`
        }
      </p>
      <div class="card-box">
        <p style="margin: 0; font-size: 13px; color: #475569;">
          <strong>${params.isResolved ? 'Resolution Summary' : 'Reported Reason'}:</strong><br>
          ${params.isResolved ? params.resolutionNotes : params.reason}
        </p>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        Funds remain safely locked in the escrow vault until final resolution.
      </p>
    `,
    ctaText: 'View Transaction Dispute',
    ctaUrl: `/dashboard/transactions/${params.transactionId}`
  })
}

// 10. Admin Test Email
export function renderTestEmail(params: { adminEmail: string }) {
  return wrapEmailLayout({
    title: 'Dealoura Resend Test Notification',
    headline: 'Resend Connection Verified!',
    recipientName: 'Administrator',
    badgeText: 'System Diagnostic',
    badgeColor: 'green',
    contentHtml: `
      <p>This is a live test email confirming that your Resend API configuration is working properly.</p>
      <div class="card-box">
        <table width="100%" style="font-size: 13px;">
          <tr>
            <td style="color: #64748b;">Delivery Status:</td>
            <td align="right" style="font-weight: 700; color: #16a34a;">Operational &check;</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Recipient:</td>
            <td align="right" style="font-weight: 600; color: #0f172a;">${params.adminEmail}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Timestamp:</td>
            <td align="right" style="color: #64748b;">${new Date().toUTCString()}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        Transactional notifications for offers, escrow payouts, 7-day timers, and KYC will be delivered smoothly.
      </p>
    `,
    ctaText: 'Open Staff Command Center',
    ctaUrl: '/admin'
  })
}
