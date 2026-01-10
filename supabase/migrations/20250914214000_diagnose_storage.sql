-- Diagnose storage.objects table structure
-- This will help us understand what columns actually exist

-- First, check if storage extension is enabled
DO $$
BEGIN
    -- Try to enable storage extension
    CREATE EXTENSION IF NOT EXISTS supabase_storage CASCADE;
    RAISE NOTICE 'Storage extension enabled/checked';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error enabling storage extension: %', SQLERRM;
END $$;

-- Check if storage.objects table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'storage' AND table_name = 'objects'
    ) THEN
        RAISE NOTICE 'storage.objects table exists';
    ELSE
        RAISE NOTICE 'storage.objects table does NOT exist';
    END IF;
END $$;

-- If table exists, show its structure
DO $$
DECLARE
    col RECORD;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'storage' AND table_name = 'objects'
    ) THEN
        RAISE NOTICE 'Columns in storage.objects:';
        FOR col IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'storage' AND table_name = 'objects'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: %', col.column_name, col.data_type;
        END LOOP;
    END IF;
END $$;

-- Check if buckets table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'storage' AND table_name = 'buckets'
    ) THEN
        RAISE NOTICE 'storage.buckets table exists';
    ELSE
        RAISE NOTICE 'storage.buckets table does NOT exist';
    END IF;
END $$;











