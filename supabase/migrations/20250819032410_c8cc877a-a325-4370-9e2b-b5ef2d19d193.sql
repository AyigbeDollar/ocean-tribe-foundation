-- Enable RLS on user_roles table that was missing it
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_roles table
-- Only admins can view user roles  
CREATE POLICY "Only admins can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() 
  AND ur.role = 'admin'
));

-- Only admins can insert user roles
CREATE POLICY "Only admins can create user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() 
  AND ur.role = 'admin'
));

-- Only admins can update user roles
CREATE POLICY "Only admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() 
  AND ur.role = 'admin'
));

-- Only admins can delete user roles
CREATE POLICY "Only admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() 
  AND ur.role = 'admin'
));