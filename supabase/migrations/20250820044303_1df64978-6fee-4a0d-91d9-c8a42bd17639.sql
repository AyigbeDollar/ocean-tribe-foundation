-- Critical Security Fixes

-- 1. Fix user_roles table - restrict access to user roles
-- Drop the overly permissive policy that allows all authenticated users to view all user roles
DROP POLICY IF EXISTS "Authenticated users can view user roles" ON public.user_roles;

-- Create restrictive policies for user_roles
-- Users can only view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all roles for management purposes
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 2. Update is_admin function to work with new restricted policies
-- The current function should still work, but let's make it more explicit
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = COALESCE(is_admin.user_id, auth.uid())
    AND role = 'admin'
  );
$function$;

-- 3. Create a function for admins to view user roles safely
CREATE OR REPLACE FUNCTION public.get_user_roles_for_admin()
RETURNS TABLE (
  id uuid,
  user_id uuid, 
  role text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT ur.id, ur.user_id, ur.role, ur.created_at, ur.updated_at
  FROM public.user_roles ur
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles admin_check 
    WHERE admin_check.user_id = auth.uid() 
    AND admin_check.role = 'admin'
  );
$function$;

-- 4. Create public views for events and gallery that don't expose user IDs
-- Create a safe events view without exposing created_by
CREATE VIEW public.events_public AS
SELECT 
  id,
  title,
  description,
  location,
  event_date,
  participant_count,
  recycling_impact_kg,
  image_url,
  created_at,
  updated_at
FROM public.events;

-- Create a safe gallery view without exposing uploaded_by
CREATE VIEW public.gallery_public AS
SELECT 
  id,
  title,
  description,
  image_url,
  event_id,
  created_at,
  updated_at
FROM public.gallery;

-- Enable RLS on the views (views inherit RLS from base tables, but let's be explicit)
-- Note: Views don't need separate RLS policies as they inherit from base tables

-- 5. Add a function to check if user owns an event (for use in components)
CREATE OR REPLACE FUNCTION public.user_owns_event(event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND created_by = auth.uid()
  );
$function$;

-- 6. Add a function to check if user owns a gallery item
CREATE OR REPLACE FUNCTION public.user_owns_gallery_item(gallery_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.gallery 
    WHERE id = gallery_id AND uploaded_by = auth.uid()
  );
$function$;