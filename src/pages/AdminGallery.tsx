import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
  updated_at: string;
};

const AdminGallery = () => {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) {
      setFile(f);
      setImageUrl("");
    } else {
      toast.error('Please drop an image file');
    }
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  async function compressImage(inputFile: File, maxWidth = 1600, maxHeight = 1600, quality = 0.8): Promise<File> {
    const img = document.createElement('img');
    const reader = new FileReader();
    const dataUrl: string = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(inputFile);
    });
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });
    let { width, height } = img;
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return inputFile;
    ctx.drawImage(img, 0, 0, width, height);
    const mime = inputFile.type.includes('png') ? 'image/png' : 'image/jpeg';
    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), mime, mime === 'image/jpeg' ? quality : undefined));
    return new File([blob], inputFile.name.replace(/\.(png|jpg|jpeg|webp)$/i, mime === 'image/png' ? '.png' : '.jpg'), { type: mime });
  }
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    fetchGallery();
    // Ensure storage bucket exists
    ensureStorageBucket();
  }, []);

  const ensureStorageBucket = async () => {
    try {
      // Try to list the bucket to see if it exists
      const { error } = await supabase.storage.from('gallery').list('', { limit: 1 });
      if (error && error.message.includes('not found')) {
        console.warn('Gallery storage bucket not found. Please create it in Supabase dashboard.');
        toast.error('Gallery storage bucket not found. Please create a bucket named "gallery" in your Supabase Storage dashboard.');
      }
    } catch (error) {
      console.error('Error checking storage bucket:', error);
    }
  };

  // Auto-clean legacy images once for admin
  const [autoCleaned, setAutoCleaned] = useState<boolean>(false);
  useEffect(() => {
    if (isAdmin && !autoCleaned && items.length > 0) {
      (async () => {
        await handleClearAll();
        setAutoCleaned(true);
        await fetchGallery();
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, autoCleaned, items.length]);

  // Test function to diagnose bucket access
  const testBucketAccess = async () => {
    try {
      // Test 1: List bucket
      const { data: files, error: listError } = await supabase.storage
        .from('gallery')
        .list('', { limit: 1 });
      
      if (listError) {
        console.error('List error:', listError);
        toast.error(`Bucket access failed: ${listError.message}`);
        return;
      }
      
      // Test 2: Try to upload a tiny test file
      const testContent = 'test';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFileName = `test-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(testFileName, testBlob);
      
      if (uploadError) {
        console.error('Upload test error:', uploadError);
        toast.error(`Upload test failed: ${uploadError.message}`);
        return;
      }
      
      // Clean up test file
      await supabase.storage.from('gallery').remove([testFileName]);
      
      toast.success('Bucket access test successful!');
      
    } catch (error) {
      console.error('Test error:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fetchGallery = async () => {
    try {
      setLoading(true);
      // Use safe function that respects RLS
      const { data, error } = await supabase.rpc("get_gallery_safe");
      if (error) throw error;
      setItems((data || []) as unknown as GalleryItem[]);
    } catch (error) {
      console.error("Failed to load gallery:", error);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !user) {
      toast.error("Only admins can add images");
      return;
    }
    if (!title.trim() || (!imageUrl.trim() && !file)) {
      toast.error("Title and an image (file or URL) are required");
      return;
    }
    try {
      setSubmitting(true);
      let finalUrl = imageUrl.trim();

      // If a file is provided, upload it to storage and get public URL
      if (file) {
        const processed = await compressImage(file, 1600, 1600, 0.82);
        const ext = processed.name.split('.').pop()?.toLowerCase() || 'jpg';
        const objectPath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        
        // First, test bucket access
        const { data: testList, error: testError } = await supabase.storage
          .from('gallery')
          .list('', { limit: 1 });
        
        if (testError) {
          console.error('Bucket access test failed:', testError);
          throw new Error(`Cannot access gallery bucket: ${testError.message}`);
        }
        
        // Try to upload to storage with better error handling
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(objectPath, processed, {
            cacheControl: '3600',
            upsert: false,
          });
        
        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          console.error('Upload error details:', {
            message: uploadError.message,
            statusCode: uploadError.statusCode,
            error: uploadError.error
          });
          
          // Check if it's a bucket not found error
          if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket not found')) {
            toast.error('Gallery storage bucket not found. Please create a bucket named "gallery" in your Supabase Storage dashboard.');
            throw new Error('Gallery storage bucket not found. Please create the bucket first.');
          }
          
          // Check for permission errors
          if (uploadError.message.includes('permission') || uploadError.message.includes('unauthorized') || uploadError.message.includes('forbidden')) {
            toast.error('Permission denied. Please check that you have admin privileges and the bucket permissions are set correctly.');
            throw new Error(`Permission denied: ${uploadError.message}`);
          }
          
          // Check for file size errors
          if (uploadError.message.includes('size') || uploadError.message.includes('too large')) {
            toast.error('File too large. Please choose a smaller image.');
            throw new Error(`File too large: ${uploadError.message}`);
          }
          
          // If storage fails, try to use the image URL instead
          if (imageUrl.trim()) {
            finalUrl = imageUrl.trim();
            toast.warning("File upload failed, using provided URL instead");
          } else {
            throw new Error(`Storage upload failed: ${uploadError.message}`);
          }
        } else {
          finalUrl = supabase.storage.from('gallery').getPublicUrl(objectPath).data.publicUrl;
        }
      }

      const { error } = await supabase.from("gallery").insert({
        title: title.trim(),
        image_url: finalUrl,
        description: description.trim() || null,
        uploaded_by: user.id,
      });
      if (error) throw error;
      toast.success("Image added to gallery");
      setTitle("");
      setImageUrl("");
      setDescription("");
      setFile(null);
      await fetchGallery();
    } catch (error) {
      console.error("Failed to add image:", error);
      
      // Show more specific error information
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Show user-friendly error message
      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        toast.error('Permission denied. Please check that you have admin access.');
      } else if (errorMessage.includes('size') || errorMessage.includes('large')) {
        toast.error('File too large. Please choose a smaller image.');
      } else if (errorMessage.includes('bucket') || errorMessage.includes('not found')) {
        toast.error('Storage bucket issue. Please contact administrator.');
      } else {
        toast.error(`Upload failed: ${errorMessage}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast.error("Only admins can delete images");
      return;
    }
    try {
      // Try to infer storage path from public URL and delete object if belongs to our bucket
      const item = items.find((i) => i.id === id);
      if (item && item.image_url.includes("/storage/v1/object/public/gallery/")) {
        const objectPath = item.image_url.split("/storage/v1/object/public/gallery/")[1];
        if (objectPath) {
          await supabase.storage.from('gallery').remove([objectPath]);
        }
      }

      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      toast.success("Image deleted");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleClearAll = async () => {
    if (!isAdmin) {
      toast.error("Only admins can clear the gallery");
      return;
    }
    if (!confirm("Are you sure you want to delete all gallery images? This cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      const current = [...items];
      // Remove storage objects first for those in our bucket
      const pathsToRemove: string[] = [];
      current.forEach((i) => {
        const marker = "/storage/v1/object/public/gallery/";
        if (i.image_url.includes(marker)) {
          const p = i.image_url.split(marker)[1];
          if (p) pathsToRemove.push(p);
        }
      });
      if (pathsToRemove.length) {
        await supabase.storage.from('gallery').remove(pathsToRemove);
      }
      const { error } = await supabase.from('gallery').delete().neq('id', '');
      if (error) throw error;
      toast.success("All gallery images deleted");
      setItems([]);
    } catch (err) {
      console.error('Failed to clear gallery', err);
      toast.error("Failed to clear gallery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground">Add or remove images from the public gallery</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add Image</CardTitle>
              <CardDescription>Only admins can add images</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAdd}>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Beach Cleanup" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Upload Image (preferred)</Label>
                  <div
                    id="file-dropzone"
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-muted'}`}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <div className="text-sm text-muted-foreground">
                      Drag & drop an image here, or click to select
                    </div>
                    {file ? (
                      <div className="mt-2 text-sm">Selected: {file.name}</div>
                    ) : null}
                  </div>
                  <Input id="file-input" className="hidden" type="file" accept="image/*" onChange={(e) => { setFile(e.target.files?.[0] || null); setImageUrl(''); }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Or Image URL</Label>
                  <Input id="image_url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
                </div>
                <Button type="submit" disabled={submitting || !isAdmin} className="w-full">
                  {submitting ? "Adding..." : "Add Image"}
                </Button>
                
                {isAdmin && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={testBucketAccess}
                    className="w-full mt-2"
                  >
                    Test Bucket Access
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Gallery Items</CardTitle>
                <CardDescription>{loading ? "Loading..." : `${items.length} images`}</CardDescription>
              </div>
              
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="group relative overflow-hidden rounded-lg border">
                    <img src={item.image_url} alt={item.title} className="h-40 w-full object-cover" />
                    <div className="p-3">
                      <div className="font-medium truncate">{item.title}</div>
                      {item.description ? (
                        <div className="text-sm text-muted-foreground line-clamp-2">{item.description}</div>
                      ) : null}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                      <Button variant="secondary" size="sm" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {!loading && items.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground">No images yet</div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;


