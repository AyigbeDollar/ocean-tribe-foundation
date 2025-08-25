-- Create a security definer function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = COALESCE(is_admin_user.user_id, auth.uid())
    AND role = 'admin'
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Bootstrap admin creation or admin management" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update user roles" ON public.user_roles;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin_user());

CREATE POLICY "Bootstrap admin creation or admin management" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  -- Allow first admin creation (no admins exist) OR current user is admin
  (NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')) OR 
  public.is_admin_user()
);

CREATE POLICY "Only admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (public.is_admin_user());

CREATE POLICY "Only admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.is_admin_user());