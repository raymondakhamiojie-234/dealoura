-- 1. Add social media metrics columns to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS platform VARCHAR(50) DEFAULT 'YouTube';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS followers_count BIGINT DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS monetized BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS niche VARCHAR(100) DEFAULT 'General';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS account_handle VARCHAR(100);

-- 2. Create public storage bucket for listing screenshots/proof
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS Policies
-- Allow anyone to view listing images publicly
CREATE POLICY "Public Access listing-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Allow authenticated users to upload listing images
CREATE POLICY "Authenticated users can upload listing-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' AND
  auth.role() = 'authenticated'
);

-- 4. Policies for listing_media table
CREATE POLICY "Public listing media viewable by everyone" 
ON listing_media FOR SELECT 
USING (true);

CREATE POLICY "Sellers can insert listing media" 
ON listing_media FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_id AND listings.seller_id = auth.uid())
);

CREATE POLICY "Sellers can delete listing media" 
ON listing_media FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_id AND listings.seller_id = auth.uid())
);
