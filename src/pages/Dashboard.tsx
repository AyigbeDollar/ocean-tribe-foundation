import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves, Users, Recycle, Heart, TrendingUp, Calendar } from "lucide-react";

interface UserEvent {
  events: {
    id: string;
    title: string;
    event_date: string;
    participant_count: number;
    recycling_impact_kg: number;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [totalImpact, setTotalImpact] = useState({ events: 0, recycling: 0 });

  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const fetchUserEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select(`
          events (
            id,
            title,
            event_date,
            participant_count,
            recycling_impact_kg
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const eventsData = data || [];
      setUserEvents(eventsData);
      
      // Calculate total impact
      const totalRecycling = eventsData.reduce((sum, ue) => 
        sum + (ue.events?.recycling_impact_kg || 0), 0
      );
      
      setTotalImpact({
        events: eventsData.length,
        recycling: totalRecycling
      });
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'Ocean Guardian'}!
          </h1>
          <p className="text-lg text-gray-600">
            Here's your Ocean Tribe Foundation dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Events Joined
              </CardTitle>
              <Waves className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpact.events}</div>
              <p className="text-xs text-muted-foreground">
                Ocean conservation events attended
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Community
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">
                Fellow ocean guardians connected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recycling Impact
              </CardTitle>
              <Recycle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpact.recycling.toFixed(1)}kg</div>
              <p className="text-xs text-muted-foreground">
                Plastic waste prevented from ocean
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Your latest contributions to ocean conservation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userEvents.length > 0 ? (
                userEvents.slice(0, 3).map((userEvent, index) => (
                  <div key={userEvent.events?.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Joined {userEvent.events?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(userEvent.events?.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No events joined yet</p>
                  <p className="text-xs text-muted-foreground">Join your first ocean conservation event!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Upcoming Events
              </CardTitle>
              <CardDescription>
                Ocean conservation events near you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Coastal Cleanup - Cape Coast</p>
                  <p className="text-xs text-muted-foreground">This Saturday, 8:00 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Marine Life Photography Workshop</p>
                  <p className="text-xs text-muted-foreground">Next Monday, 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Ocean Conservation Webinar</p>
                  <p className="text-xs text-muted-foreground">Next Friday, 6:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;