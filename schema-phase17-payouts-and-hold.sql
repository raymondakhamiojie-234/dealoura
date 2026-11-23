-- ====================================================================
-- DEALOURA: PHASE 17 - SELLER PAYOUTS & PLATFORM-SPECIFIC HOLD SCHEMA
-- Run this in your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Seller Payout Destination & Disbursement Tracking
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS seller_payout_method VARCHAR(50); -- 'crypto_usdt' or 'bank_wire'

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS seller_payout_details JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payout_status VARCHAR(50) DEFAULT 'unrequested'; -- 'unrequested', 'pending', 'completed'

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payout_tx_hash TEXT;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payout_receipt_url TEXT;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payout_sent_at TIMESTAMP WITH TIME ZONE;

-- 2. Platform-Specific Hold Duration Tracking
-- YouTube: 10080 minutes (7 days)
-- All other social platforms (TikTok, Instagram, X, Facebook, Discord, etc.): 15 minutes
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS hold_duration_minutes INTEGER DEFAULT 15;

-- 3. Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND column_name IN (
    'seller_payout_method', 
    'seller_payout_details', 
    'payout_status', 
    'payout_tx_hash', 
    'payout_sent_at', 
    'hold_duration_minutes'
  );
