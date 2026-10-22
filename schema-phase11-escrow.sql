-- ===================================================
-- PHASE 11: ESCROW ENGINE ENHANCEMENTS
-- ===================================================

-- 1. Add evaluation timeline and credential fields to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS evaluation_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS evaluation_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS credentials_data TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS escrow_fee DECIMAL(10, 2) DEFAULT 0;

-- 2. Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions';
