-- Fix RLS policies for gallery bucket
-- This migration ensures proper permissions for the gallery bucket

-- First, ensure the bucket exists (in case it was created manually)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'gallery', 'gallery', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'gallery'
);

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can read gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any Gallery file" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;

-- Create new, simpler policies for gallery bucket
-- Allow public read access
CREATE POLICY "Gallery images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Allow authenticated users to upload (we'll check admin status in the app)
CREATE POLICY "Authenticated users can upload to gallery"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'gallery'
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own gallery files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'gallery' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own gallery files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'gallery' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
