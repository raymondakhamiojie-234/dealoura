-- ====================================================================
-- DEALOURA: PHASE 16 - 3-TIER VERIFICATION SYSTEM SCHEMA
-- Run this in your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Extend user_profiles with verification tier columns
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 1;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_trusted BOOLEAN DEFAULT FALSE;

-- 2. Extend verifications table with multi-tier evidence columns
ALTER TABLE public.verifications 
ADD COLUMN IF NOT EXISTS verification_type VARCHAR(50) DEFAULT 'level_2_identity';

ALTER TABLE public.verifications 
ADD COLUMN IF NOT EXISTS id_document_url TEXT;

ALTER TABLE public.verifications 
ADD COLUMN IF NOT EXISTS selfie_url TEXT;

ALTER TABLE public.verifications 
ADD COLUMN IF NOT EXISTS account_url TEXT;

ALTER TABLE public.verifications 
ADD COLUMN IF NOT EXISTS bio_code VARCHAR(50);

-- 3. Storage RLS policies for verifications (allow owners to insert and read)
DROP POLICY IF EXISTS "Users can upload their own verification evidence" ON storage.objects;
CREATE POLICY "Users can upload their own verification evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verifications' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view their own verification evidence" ON storage.objects;
CREATE POLICY "Users can view their own verification evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verifications' AND 
  ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin())
);

-- 4. Update existing verified users to Level 2
UPDATE public.user_profiles 
SET verification_level = 2 
WHERE is_verified = TRUE AND (verification_level IS NULL OR verification_level < 2);
