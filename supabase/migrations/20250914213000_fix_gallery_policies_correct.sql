-- Fix gallery bucket RLS policies with correct column names
-- This migration uses the proper storage.objects table structure

-- First, ensure storage extension is enabled
CREATE EXTENSION IF NOT EXISTS supabase_storage CASCADE;

-- Drop all existing policies on storage.objects
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

-- Create simple policies for gallery bucket
-- Note: The column name should be 'bucket_id' in storage.objects

-- Public read access for gallery bucket
CREATE POLICY "gallery_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Authenticated users can upload to gallery bucket
CREATE POLICY "gallery_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Authenticated users can update files in gallery bucket
CREATE POLICY "gallery_authenticated_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Authenticated users can delete files in gallery bucket
CREATE POLICY "gallery_authenticated_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' 
  AND auth.uid() IS NOT NULL
);

-- Ensure the gallery bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
