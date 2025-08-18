-- Create comprehensive admin system tables and update RLS policies

-- 1. Blog Posts Table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published BOOLEAN NOT NULL DEFAULT false,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Content Management Table
CREATE TABLE public.content_management (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE, -- 'hero', 'about', 'mission', etc.
  title TEXT,
  content TEXT,
  image_url TEXT,
  metadata JSONB,
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Partnership Requests Table
CREATE TABLE public.partnership_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  partnership_type TEXT NOT NULL, -- 'sponsorship', 'collaboration', 'vendor', etc.
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Donation Settings Table
CREATE TABLE public.donation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_processor TEXT NOT NULL, -- 'stripe', 'paypal', etc.
  api_key_encrypted TEXT, -- Store encrypted API keys
  webhook_url TEXT,
  default_amounts INTEGER[] DEFAULT '{5,10,25,50,100}', -- Default donation amounts in cents
  currency TEXT NOT NULL DEFAULT 'USD',
  goal_amount INTEGER, -- Monthly/annual goal in cents
  goal_period TEXT DEFAULT 'monthly', -- 'monthly', 'annual'
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Enable RLS on all new tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_settings ENABLE ROW LEVEL SECURITY;

-- 6. Update RLS policies to restrict events and gallery to admins only
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON public.gallery;

CREATE POLICY "Only admins can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

CREATE POLICY "Only admins can upload gallery images" 
ON public.gallery 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by AND 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- 7. Create RLS policies for new tables (admin only)
-- Blog Posts Policies
CREATE POLICY "Everyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (published = true);

CREATE POLICY "Admins can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- Content Management Policies  
CREATE POLICY "Everyone can view content" 
ON public.content_management 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage content" 
ON public.content_management 
FOR ALL 
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- Partnership Requests Policies
CREATE POLICY "Anyone can create partnership requests" 
ON public.partnership_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all partnership requests" 
ON public.partnership_requests 
FOR SELECT 
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can update partnership requests" 
ON public.partnership_requests 
FOR UPDATE 
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- Donation Settings Policies
CREATE POLICY "Admins can manage donation settings" 
ON public.donation_settings 
FOR ALL 
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- 8. Create triggers for updated_at columns
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_management_updated_at
  BEFORE UPDATE ON public.content_management
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partnership_requests_updated_at
  BEFORE UPDATE ON public.partnership_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donation_settings_updated_at
  BEFORE UPDATE ON public.donation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Insert default content management sections
INSERT INTO public.content_management (section, title, content, updated_by) 
SELECT 
  'hero',
  'Protect Our Oceans',
  'Join us in our mission to preserve marine ecosystems and create a sustainable future for our planet.',
  auth.uid()
WHERE EXISTS (
  SELECT 1 FROM auth.users 
  WHERE id = auth.uid() AND (user_metadata ->> 'role') = 'admin'
);

-- 10. Create admin statistics function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_events INTEGER,
  total_gallery_images INTEGER,
  total_users INTEGER,
  total_partnerships INTEGER,
  total_blog_posts INTEGER,
  events_this_month INTEGER,
  gallery_this_month INTEGER,
  users_this_month INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.events) as total_events,
    (SELECT COUNT(*)::INTEGER FROM public.gallery) as total_gallery_images,
    (SELECT COUNT(*)::INTEGER FROM auth.users) as total_users,
    (SELECT COUNT(*)::INTEGER FROM public.partnership_requests) as total_partnerships,
    (SELECT COUNT(*)::INTEGER FROM public.blog_posts WHERE published = true) as total_blog_posts,
    (SELECT COUNT(*)::INTEGER FROM public.events WHERE created_at >= date_trunc('month', now())) as events_this_month,
    (SELECT COUNT(*)::INTEGER FROM public.gallery WHERE created_at >= date_trunc('month', now())) as gallery_this_month,
    (SELECT COUNT(*)::INTEGER FROM auth.users WHERE created_at >= date_trunc('month', now())) as users_this_month;
$$;