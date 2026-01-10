-- Permanently clear all gallery rows
DELETE FROM public.gallery;

-- Update gallery delete policy to use is_admin() check
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'gallery' AND policyname = 'Only admins can delete gallery images'
  ) THEN
    DROP POLICY "Only admins can delete gallery images" ON public.gallery;
  END IF;

  CREATE POLICY "Only admins can delete gallery images"
  ON public.gallery
  FOR DELETE
  USING (public.is_admin());
END $$;

-- Update storage policies to check admin via user_roles instead of user_metadata
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload gallery images'
  ) THEN
    DROP POLICY "Admins can upload gallery images" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete gallery images'
  ) THEN
    DROP POLICY "Admins can delete gallery images" ON storage.objects;
  END IF;

  CREATE POLICY "Admins can upload gallery images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'gallery' AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

  CREATE POLICY "Admins can delete gallery images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'gallery' AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );
END $$;






