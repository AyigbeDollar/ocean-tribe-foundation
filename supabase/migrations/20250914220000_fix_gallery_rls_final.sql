-- Final fix for Gallery bucket RLS policies
-- This will clear all existing policies and create simple, working ones

-- First, drop ALL existing policies on storage.objects
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
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Create very simple, permissive policies for gallery bucket
-- Public read access
CREATE POLICY "gallery_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Allow any authenticated user to upload to gallery
CREATE POLICY "gallery_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Allow any authenticated user to update files in gallery
CREATE POLICY "gallery_authenticated_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Allow any authenticated user to delete files in gallery
CREATE POLICY "gallery_authenticated_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Ensure gallery bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Verify the policies were created
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
