-- Fix bootstrap problem: Allow users to make themselves admin if no admins exist yet
-- This allows the first admin to be created

-- Drop existing policies that prevent bootstrap
DROP POLICY IF EXISTS "Only admins can create user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete user roles" ON public.user_roles;

-- Create new policies that allow bootstrap
-- Allow viewing user roles for authenticated users
CREATE POLICY "Authenticated users can view user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);

-- Allow creating admin role if no admins exist, or if user is already admin
CREATE POLICY "Bootstrap admin creation or admin management" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if no admins exist yet (bootstrap case)
  NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  OR 
  -- Or if the current user is already an admin
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Only admins can update user roles
CREATE POLICY "Only admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can delete user roles
CREATE POLICY "Only admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));