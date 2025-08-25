import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, MapPin, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

interface Community {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  image_url: string | null;
  member_count: number;
  created_at: string;
}

const AdminCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    fetchCommunities();
  }, [user, isAdmin, navigate]);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCommunity = async (communityId: string, communityName: string) => {
    try {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

      if (error) throw error;

      setCommunities(communities.filter(c => c.id !== communityId));
      toast.success(`Community "${communityName}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting community:', error);
      toast.error('Failed to delete community');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Community Management
            </h1>
            <p className="text-muted-foreground text-lg">
              Create and manage cleanup communities
            </p>
          </div>
          <Link to="/admin/communities/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Community
            </Button>
          </Link>
        </div>

        {communities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Communities Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create the first community to start organizing cleanup events.
              </p>
              <Link to="/admin/communities/create">
                <Button>Create First Community</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Card key={community.id} className="overflow-hidden">
                {community.image_url && (
                  <div className="h-48 bg-cover bg-center" 
                       style={{ backgroundImage: `url(${community.image_url})` }} />
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {community.name}
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {community.member_count}
                    </Badge>
                  </CardTitle>
                  {community.description && (
                    <CardDescription>{community.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {community.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      {community.location}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Link to={`/admin/communities/edit/${community.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Community</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{community.name}"? This action cannot be undone and will also delete all associated events.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCommunity(community.id, community.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCommunities;