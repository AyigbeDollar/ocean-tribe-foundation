-- Simplified approach: Remove complex RLS policies and use application-level admin checks

-- 1. Drop all existing problematic policies
DROP POLICY IF EXISTS "Only admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- 2. Drop the recursive function
DROP FUNCTION IF EXISTS public.check_user_admin_status(uuid);

-- 3. Create simple, non-recursive policies
-- Users can only see their own roles
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own roles (for initial setup)
CREATE POLICY "Users can insert own roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Simplify the is_admin function to be non-recursive
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = COALESCE(is_admin.user_id, auth.uid())
    AND role = 'admin'
  );
$$;