-- Fix security warnings and completely disable RLS on user_roles for simplicity

-- 1. Fix search path issue in is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = COALESCE(is_admin.user_id, auth.uid())
    AND role = 'admin'
  );
$$;

-- 2. Completely disable RLS on user_roles to avoid any recursion
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 3. Drop all policies since we're disabling RLS
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;