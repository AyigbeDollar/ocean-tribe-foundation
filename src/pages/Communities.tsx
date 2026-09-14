import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Calendar, Loader2 } from 'lucide-react';
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

interface UserCommunity {
  community_id: string;
}

const Communities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<UserCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunities();
    if (user) {
      fetchUserCommunities();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const fetchUserCommunities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_communities')
        .select('community_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserCommunities(data || []);
    } catch (error) {
      console.error('Error fetching user communities:', error);
    }
  };

  const isUserJoined = (communityId: string) => {
    return userCommunities.some(uc => uc.community_id === communityId);
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_communities')
        .insert({
          user_id: user.id,
          community_id: communityId
        });

      if (error) throw error;

      await fetchUserCommunities();
      await fetchCommunities(); // Refresh to update member count
      toast.success('Successfully joined community!');
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('Failed to join community');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_communities')
        .delete()
        .eq('user_id', user.id)
        .eq('community_id', communityId);

      if (error) throw error;

      await fetchUserCommunities();
      await fetchCommunities(); // Refresh to update member count
      toast.success('Successfully left community');
    } catch (error) {
      console.error('Error leaving community:', error);
      toast.error('Failed to leave community');
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Cleanup Communities
          </h1>
          <p className="text-muted-foreground text-lg">
            Join local communities and participate in ocean cleanup events together
          </p>
        </div>

        {communities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Communities Yet</h3>
              <p className="text-muted-foreground text-center">
                Communities will appear here once they are created by administrators.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    Created {new Date(community.created_at).toLocaleDateString()}
                  </div>
                  
                  {user ? (
                    isUserJoined(community.id) ? (
                      <Button 
                        variant="outline" 
                        onClick={() => handleLeaveCommunity(community.id)}
                        className="w-full"
                      >
                        Leave Community
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleJoinCommunity(community.id)}
                        className="w-full"
                      >
                        Join Community
                      </Button>
                    )
                  ) : (
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="w-full"
                    >
                      Sign In to Join
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Communities;