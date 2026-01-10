-- Fix RLS policies for Gallery bucket
-- This migration ensures proper permissions for the Gallery bucket

-- First, ensure the bucket exists (in case it was created manually)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'Gallery', 'Gallery', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'Gallery'
);

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can read gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;

-- Create new, simpler policies for Gallery bucket
-- Allow public read access
CREATE POLICY "Gallery images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'Gallery');

-- Allow authenticated users to upload (we'll check admin status in the app)
CREATE POLICY "Authenticated users can upload to Gallery"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Gallery' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own Gallery files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'Gallery' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own Gallery files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'Gallery' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Also allow admins to delete any file (for cleanup purposes)
CREATE POLICY "Admins can delete any Gallery file"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'Gallery' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);











