-- Check and fix storage schema
-- First, let's see what columns actually exist in storage.objects

-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS supabase_storage CASCADE;

-- Check the actual structure of storage.objects table
DO $$
BEGIN
    -- This will show us the actual column names
    RAISE NOTICE 'Checking storage.objects table structure...';
END $$;

-- Let's try to find the correct column name for bucket identification
-- The correct column is likely 'bucket_id' but let's verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'storage' 
AND table_name = 'objects'
ORDER BY ordinal_position;











