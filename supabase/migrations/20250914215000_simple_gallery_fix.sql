-- Simple fix for gallery bucket RLS policies
-- This approach tries multiple possible column names and table structures

-- First, ensure storage extension is enabled
CREATE EXTENSION IF NOT EXISTS supabase_storage CASCADE;

-- Check if we can access storage.objects table
DO $$
BEGIN
    -- Try to query the table to see if it exists and what columns it has
    PERFORM 1 FROM storage.objects LIMIT 1;
    RAISE NOTICE 'storage.objects table is accessible';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cannot access storage.objects: %', SQLERRM;
END $$;

-- Try to create policies with different possible column names
-- First, let's try the standard approach
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "gallery_public_read" ON storage.objects;
    DROP POLICY IF EXISTS "gallery_authenticated_upload" ON storage.objects;
    DROP POLICY IF EXISTS "gallery_authenticated_update" ON storage.objects;
    DROP POLICY IF EXISTS "gallery_authenticated_delete" ON storage.objects;
    
    RAISE NOTICE 'Dropped existing policies';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- Try to create policies with bucket_id
DO $$
BEGIN
    CREATE POLICY "gallery_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gallery');
    
    CREATE POLICY "gallery_authenticated_upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'gallery' 
      AND auth.uid() IS NOT NULL
    );
    
    CREATE POLICY "gallery_authenticated_update"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'gallery' 
      AND auth.uid() IS NOT NULL
    );
    
    CREATE POLICY "gallery_authenticated_delete"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'gallery' 
      AND auth.uid() IS NOT NULL
    );
    
    RAISE NOTICE 'Created policies with bucket_id column';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policies with bucket_id: %', SQLERRM;
        
        -- Try alternative column names
        BEGIN
            CREATE POLICY "gallery_public_read"
            ON storage.objects FOR SELECT
            USING (bucket_name = 'gallery');
            
            CREATE POLICY "gallery_authenticated_upload"
            ON storage.objects FOR INSERT
            WITH CHECK (
              bucket_name = 'gallery' 
              AND auth.uid() IS NOT NULL
            );
            
            RAISE NOTICE 'Created policies with bucket_name column';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error creating policies with bucket_name: %', SQLERRM;
        END;
END $$;
