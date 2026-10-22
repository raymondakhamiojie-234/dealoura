-- ==============================================================================
-- PHASE 12: SELLER TRUST & PUBLIC PROFILE MIGRATION
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pgpzxbtevjgsiwrllgra/sql
-- ==============================================================================

-- 1. Add is_verified column to user_profiles if not already present
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Backfill existing verified sellers who have approved KYC documents
UPDATE user_profiles
SET is_verified = TRUE
WHERE id IN (
  SELECT user_id 
  FROM verifications 
  WHERE status = 'verified'
);

-- 3. Ensure public can read verified status on verifications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'verifications' AND policyname = 'Public can view verified badge'
  ) THEN
    CREATE POLICY "Public can view verified badge" 
    ON verifications FOR SELECT 
    USING (status = 'verified');
  END IF;
END $$;

-- 4. PostgreSQL RPC Function to safely return public seller trust statistics
-- Bypasses RLS using SECURITY DEFINER to aggregate counts without exposing sensitive data
CREATE OR REPLACE FUNCTION get_seller_public_stats(target_seller_id UUID)
RETURNS JSON AS $$
DECLARE
  completed_deals_count INT;
  is_seller_verified BOOLEAN;
  avg_rating NUMERIC;
  total_reviews_count INT;
BEGIN
  -- Count completed escrow transactions
  SELECT COUNT(*) INTO completed_deals_count
  FROM transactions
  WHERE seller_id = target_seller_id AND status = 'completed';

  -- Check if seller is verified in either user_profiles or verifications
  SELECT (
    COALESCE((SELECT is_verified FROM user_profiles WHERE id = target_seller_id), FALSE)
    OR
    EXISTS(SELECT 1 FROM verifications WHERE user_id = target_seller_id AND status = 'verified')
  ) INTO is_seller_verified;

  -- Calculate reviews count and average rating
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0),
    COUNT(*)
  INTO avg_rating, total_reviews_count
  FROM reviews
  WHERE reviewee_id = target_seller_id;

  RETURN json_build_object(
    'completed_deals', completed_deals_count,
    'is_verified', is_seller_verified,
    'average_rating', avg_rating,
    'total_reviews', total_reviews_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
