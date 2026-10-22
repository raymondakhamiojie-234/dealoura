-- ==============================================================================
-- PHASE 14: ESCROW BANK TRANSFER & PAYMENT CONFIRMATION MIGRATION
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pgpzxbtevjgsiwrllgra/sql
-- ==============================================================================

-- 1. Add payment proof data and URL columns to transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_proof_data TEXT;

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- 2. Add payment_verifying status to transaction_status enum if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'payment_verifying' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_status')
  ) THEN
    ALTER TYPE transaction_status ADD VALUE 'payment_verifying' AFTER 'pending_payment';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Verify columns on transactions table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name LIKE 'payment_%';
