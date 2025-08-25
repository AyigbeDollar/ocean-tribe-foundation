-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  image_url TEXT,
  admin_created_by UUID NOT NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on communities
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for communities
CREATE POLICY "Everyone can view communities" 
ON public.communities 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can create communities" 
ON public.communities 
FOR INSERT 
WITH CHECK (public.is_admin_user());

CREATE POLICY "Only admins can update communities" 
ON public.communities 
FOR UPDATE 
USING (public.is_admin_user());

CREATE POLICY "Only admins can delete communities" 
ON public.communities 
FOR DELETE 
USING (public.is_admin_user());

-- Create user_communities table for community memberships
CREATE TABLE public.user_communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, community_id)
);

-- Enable RLS on user_communities
ALTER TABLE public.user_communities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_communities
CREATE POLICY "Users can view their own community memberships" 
ON public.user_communities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can join communities" 
ON public.user_communities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" 
ON public.user_communities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add community_id to events table
ALTER TABLE public.events ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;

-- Update events RLS policies to only allow admins to create/edit/delete
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Event creators can update their events" ON public.events;
DROP POLICY IF EXISTS "Event creators can delete their events" ON public.events;

CREATE POLICY "Only admins can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (public.is_admin_user());

CREATE POLICY "Only admins can update events" 
ON public.events 
FOR UPDATE 
USING (public.is_admin_user());

CREATE POLICY "Only admins can delete events" 
ON public.events 
FOR DELETE 
USING (public.is_admin_user());

-- Create trigger to update community member count
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities
    SET member_count = (
      SELECT COUNT(*)
      FROM public.user_communities
      WHERE community_id = NEW.community_id
    )
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities
    SET member_count = (
      SELECT COUNT(*)
      FROM public.user_communities
      WHERE community_id = OLD.community_id
    )
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic member count updates
CREATE TRIGGER update_community_member_count_trigger
AFTER INSERT OR DELETE ON public.user_communities
FOR EACH ROW
EXECUTE FUNCTION public.update_community_member_count();

-- Create trigger for automatic updated_at updates on communities
CREATE TRIGGER update_communities_updated_at
BEFORE UPDATE ON public.communities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();