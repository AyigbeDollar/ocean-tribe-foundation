-- Simple, permissive policies for gallery bucket
-- This is a more aggressive approach to fix the RLS issue

-- Update the bucket to be public if it isn't already
UPDATE storage.buckets 
SET public = true 
WHERE id = 'gallery';

-- Drop all existing policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Create very simple policies for gallery bucket
-- Public read access
CREATE POLICY "gallery_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Allow any authenticated user to upload
CREATE POLICY "gallery_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Allow any authenticated user to update
CREATE POLICY "gallery_authenticated_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Allow any authenticated user to delete
CREATE POLICY "gallery_authenticated_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);
