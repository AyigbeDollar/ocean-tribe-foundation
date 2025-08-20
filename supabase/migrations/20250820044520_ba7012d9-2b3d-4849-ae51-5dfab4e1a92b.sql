-- Fix Function Search Path Issues

-- Update the helper functions to have proper search_path settings
CREATE OR REPLACE FUNCTION public.get_events_safe()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  location text,
  event_date timestamp with time zone,
  participant_count integer,
  recycling_impact_kg numeric,
  image_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_can_edit boolean
)
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $function$
  SELECT 
    e.id,
    e.title,
    e.description,
    e.location,
    e.event_date,
    e.participant_count,
    e.recycling_impact_kg,
    e.image_url,
    e.created_at,
    e.updated_at,
    -- Only show edit capability if user owns the event
    (e.created_by = auth.uid()) as user_can_edit
  FROM public.events e;
$function$;

-- Update gallery function with proper search_path
CREATE OR REPLACE FUNCTION public.get_gallery_safe()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  image_url text,
  event_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_can_edit boolean
)
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $function$
  SELECT 
    g.id,
    g.title,
    g.description,
    g.image_url,
    g.event_id,
    g.created_at,
    g.updated_at,
    -- Only show edit capability if user owns the gallery item
    (g.uploaded_by = auth.uid()) as user_can_edit
  FROM public.gallery g;
$function$;