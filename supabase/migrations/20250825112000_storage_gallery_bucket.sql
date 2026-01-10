-- Create storage bucket for gallery images if it doesn't exist
insert into storage.buckets (id, name, public)
select 'gallery', 'gallery', true
where not exists (
  select 1 from storage.buckets where id = 'gallery'
);

-- Enable RLS (storage uses policies via storage.objects)
-- Public can read objects
create policy if not exists "Public can read gallery images"
on storage.objects for select
using (
  bucket_id = 'gallery'
);

-- Only admins can upload (insert) objects
create policy if not exists "Admins can upload gallery images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'gallery' and (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Only admins can delete objects
create policy if not exists "Admins can delete gallery images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'gallery' and (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);



