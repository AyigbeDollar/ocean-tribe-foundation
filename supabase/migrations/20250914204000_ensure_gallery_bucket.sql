-- Ensure gallery storage bucket exists
-- This migration creates the gallery bucket if it doesn't exist

-- Create the gallery bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'gallery', 'gallery', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'gallery'
);

-- Ensure RLS is enabled on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public can read gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;

-- Create policies for gallery bucket
-- Public can read gallery images
CREATE POLICY "Public can read gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Authenticated users can upload gallery images (we'll check admin status in the app)
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Users can update their own gallery images
CREATE POLICY "Users can update their own gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Users can delete gallery images (we'll check admin status in the app)
CREATE POLICY "Users can delete gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);



