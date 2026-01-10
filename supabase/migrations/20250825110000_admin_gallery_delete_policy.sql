-- Allow only admins to delete gallery images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gallery'
      AND policyname = 'Only admins can delete gallery images'
  ) THEN
    CREATE POLICY "Only admins can delete gallery images"
    ON public.gallery
    FOR DELETE
    USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');
  END IF;
END $$;



