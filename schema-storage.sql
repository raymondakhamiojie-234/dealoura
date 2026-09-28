-- 1. Create a new storage bucket called 'verifications'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verifications', 'verifications', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up Storage RLS policies for the 'verifications' bucket
-- Allow users to upload their own evidence files
CREATE POLICY "Users can upload their own verification evidence"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verifications' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow users to view their own evidence files
CREATE POLICY "Users can view their own verification evidence"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verifications' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Note: Admins would also need a policy to view these files. 
-- In a real app, you might use a service role key on the backend to fetch them for admins, 
-- or create a specific admin role policy here.
