import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Calendar, User, Plus } from "lucide-react";

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  uploaded_by: string;
  event_id: string | null;
  created_at: string;
  events?: {
    title: string;
  };
}

interface Event {
  id: string;
  title: string;
}

const Gallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_id: ''
  });

  useEffect(() => {
    fetchImages();
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select(`
          *,
          events (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedImage) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) throw new Error('Failed to upload image');

      const { error } = await supabase
        .from('gallery')
        .insert({
          title: formData.title,
          description: formData.description,
          image_url: imageUrl,
          event_id: formData.event_id || null,
          uploaded_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image uploaded to gallery!",
      });

      setIsUploadOpen(false);
      setFormData({ title: '', description: '', event_id: '' });
      setSelectedImage(null);
      setImagePreview(null);
      fetchImages();
    } catch (error) {
      console.error('Error uploading to gallery:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-wave animate-fade-in">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-pulse">Loading gallery...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-wave animate-fade-in">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8 animate-scale-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 animate-wave">
              Ocean Conservation Gallery
            </h1>
            <p className="text-lg text-muted-foreground">
              Photos from our community events and conservation efforts
            </p>
          </div>
          {user && (
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="ocean" size="lg" className="animate-float">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upload Photo</DialogTitle>
                  <DialogDescription>
                    Share a photo from an ocean conservation event
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Photo Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Beach cleanup success"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tell us about this photo..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_id">Related Event (Optional)</Label>
                    <select
                      id="event_id"
                      name="event_id"
                      value={formData.event_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No specific event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Photo *</Label>
                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Choose a photo to upload</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <Button
                          type="button"
                          variant="wave"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                          Choose Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUploadOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={uploading || !selectedImage}
                      variant="ocean"
                      className="flex-1"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-bounce-gentle" />
            <h3 className="text-lg font-medium text-foreground mb-2">No photos yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to share a photo from an ocean conservation event!</p>
            {user && (
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="shimmer" size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Photo
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {images.map((image, index) => (
              <Card 
                key={image.id} 
                className="overflow-hidden group cursor-pointer"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-1 text-foreground group-hover:text-primary transition-colors">{image.title}</h3>
                  {image.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{image.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(image.created_at).toLocaleDateString()}
                    </div>
                    {image.events && (
                      <div className="text-primary font-medium truncate ml-2">
                        {image.events.title}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;