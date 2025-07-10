-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);

-- Create policies for event images bucket
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own event images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete event images"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);

-- Add image_url column to events table
ALTER TABLE public.events 
ADD COLUMN image_url TEXT;

-- Create gallery table for additional images
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gallery table
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery
CREATE POLICY "Everyone can view gallery images"
ON public.gallery FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can upload gallery images"
ON public.gallery FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own gallery images"
ON public.gallery FOR UPDATE
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own gallery images"
ON public.gallery FOR DELETE
USING (auth.uid() = uploaded_by);

-- Add trigger for gallery updated_at
CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();