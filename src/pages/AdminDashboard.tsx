import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, FileText, Image, Users, CreditCard, Handshake, Plus, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,

    registeredUsers: 0,
    totalCommunities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch total events
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });



      // Fetch total users (using profiles table instead of auth admin)
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total communities
      const { count: communitiesCount } = await supabase
        .from('communities')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalEvents: eventsCount || 0,

        registeredUsers: usersCount || 0,
        totalCommunities: communitiesCount || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={fetchStats} 
              variant="outline" 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {loading ? "Refreshing..." : "Refresh Stats"}
            </Button>
            <Badge variant="secondary">Admin</Badge>
            <Button onClick={signOut} variant="outline">Sign Out</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/events">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
                  ) : (
                    stats.totalEvents
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Ocean conservation events</p>
              </CardContent>
            </Link>
          </Card>
          

          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
                ) : (
                  stats.registeredUsers
                )}
              </div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/admin/communities">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Communities</CardTitle>
                <Users className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
                  ) : (
                    stats.totalCommunities
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Active communities</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Event Management
              </CardTitle>
              <CardDescription>
                Create, edit, and manage ocean conservation events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/events/create">Create Event</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/events">View All Events</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-green-600" />
                Gallery Management
              </CardTitle>
              <CardDescription>
                Upload, organize, and manage gallery images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/gallery">Manage Gallery</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Community Management
              </CardTitle>
              <CardDescription>
                Create and manage cleanup communities and their events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/admin/communities">Manage Communities</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/communities/create">Create Community</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user roles, permissions, and admin access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Content & Settings
              </CardTitle>
              <CardDescription>
                Manage website content, contact information, and general settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/contact">Contact Settings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-teal-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Quick access to common admin tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild size="sm" className="w-full">
                <Link to="/events/create">New Event</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to="/admin/communities/create">New Community</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Quick Insights
              </CardTitle>
              <CardDescription>
                Recent activity and important metrics for your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Recent Activity</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">

                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Events: {stats.totalEvents} events created</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Communities: {stats.totalCommunities} active</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/events/create">Create Event</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/communities/create">Create Community</Link>
                    </Button>

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;