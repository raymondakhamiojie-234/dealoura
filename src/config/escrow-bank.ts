/**
 * Official Dealoura Escrow Bank Account Configuration
 * 
 * You can update your bank details here directly or set them via environment variables in .env.local:
 * - NEXT_PUBLIC_ESCROW_BANK_NAME
 * - NEXT_PUBLIC_ESCROW_ACCOUNT_NAME
 * - NEXT_PUBLIC_ESCROW_ACCOUNT_NUMBER
 * - NEXT_PUBLIC_ESCROW_ROUTING_CODE
 */

export const ESCROW_BANK_CONFIG = {
  bankName: process.env.NEXT_PUBLIC_ESCROW_BANK_NAME || 'Mercury Bank / Evolve Bank & Trust',
  accountName: process.env.NEXT_PUBLIC_ESCROW_ACCOUNT_NAME || 'Dealoura Escrow Holdings Ltd',
  accountNumber: process.env.NEXT_PUBLIC_ESCROW_ACCOUNT_NUMBER || '0834 9182 7461',
  routingOrSwiftCode: process.env.NEXT_PUBLIC_ESCROW_ROUTING_CODE || '021000021 / EVBLUS33',
  supportEmail: 'escrow@dealoura.com',
  instructions: 'Please transfer the exact amount via Online Banking, Wire, or Transfer. Include the Payment Reference in your transfer narration/memo so our desk can match and verify your deposit promptly.',
}
