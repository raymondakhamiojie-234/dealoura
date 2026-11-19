-- ====================================================================
-- DEALOURA: SUPABASE STORAGE BUCKET & OBJECTS POLICIES
-- Run this in your Supabase Dashboard -> SQL Editor
-- (ALTER TABLE lines removed to avoid 42501 ownership error)
-- ====================================================================

-- 1. Create the 'listing-images' public bucket if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  10485760, -- 10MB limit per image
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Create the 'verifications' bucket for KYC identity documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verifications',
  'verifications',
  false,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 3. OBJECTS POLICIES FOR listing-images (Safe drop-and-recreate)
DROP POLICY IF EXISTS "Public Access listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view listing-images" ON storage.objects;
CREATE POLICY "Public can view listing-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "Authenticated users can upload listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload listing-images" ON storage.objects;
CREATE POLICY "Authenticated users upload listing-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "Users can update their own listing-images" ON storage.objects;
CREATE POLICY "Users can update their own listing-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "Users can delete their own listing-images" ON storage.objects;
CREATE POLICY "Users can delete their own listing-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing-images');

-- 4. OBJECTS POLICIES FOR verifications (KYC)
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
  (auth.uid())::text = (storage.foldername(name))[1]
);
