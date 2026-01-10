-- Create gallery storage bucket and policies
-- Run this in Supabase SQL Editor

-- 1. Create the bucket (if it doesn't exist)
insert into storage.buckets (id, name, public)
select 'gallery', 'gallery', true
where not exists (
  select 1 from storage.buckets where id = 'gallery'
);

-- 2. Set up storage policies for the gallery bucket

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Public can read gallery images" on storage.objects;
drop policy if exists "Authenticated users can upload gallery images" on storage.objects;
drop policy if exists "Admins can delete gallery images" on storage.objects;
drop policy if exists "Users can delete their own gallery images" on storage.objects;

-- Public read access (anyone can view gallery images)
create policy "Public can read gallery images"
on storage.objects for select
using (bucket_id = 'gallery');

-- Authenticated users can upload (we'll check admin status in the app)
create policy "Authenticated users can upload gallery images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'gallery');

-- Users can delete their own uploads OR admins can delete any
create policy "Users can delete their own gallery images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'gallery' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  )
);


