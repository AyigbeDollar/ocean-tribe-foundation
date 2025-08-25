import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, Recycle, Plus, Clock, Edit3 } from "lucide-react";
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  participant_count: number;
  recycling_impact_kg: number;
  image_url: string | null;
  created_by: string;
  community_id: string | null;
  communities?: {
    name: string;
  };
}

interface UserEvent {
  event_id: string;
}

const Events = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          communities (
            name
          )
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserEvents(data || []);
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  };

  const isUserJoined = (eventId: string) => {
    return userEvents.some(ue => ue.event_id === eventId);
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_events')
        .insert({ user_id: user.id, event_id: eventId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You've joined the event!",
      });
      
      fetchEvents();
      fetchUserEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: "Error",
        description: "Failed to join event",
        variant: "destructive",
      });
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_events')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You've left the event",
      });
      
      fetchEvents();
      fetchUserEvents();
    } catch (error) {
      console.error('Error leaving event:', error);
      toast({
        title: "Error",
        description: "Failed to leave event",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ocean Conservation Events
            </h1>
            <p className="text-lg text-gray-600">
              Join community events and make a difference for our oceans
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {event.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  {isUserJoined(event.id) && (
                    <Badge variant="secondary">Joined</Badge>
                  )}
                </div>
                {event.communities && (
                  <Badge variant="outline" className="w-fit mb-2">
                    {event.communities.name}
                  </Badge>
                )}
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(event.event_date)}
                  </div>
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4" />
                    {event.participant_count} participants
                  </div>
                  {event.recycling_impact_kg > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Recycle className="mr-2 h-4 w-4" />
                      {event.recycling_impact_kg}kg plastic prevented
                    </div>
                  )}
                </div>
                
                {user && (
                  <div className="pt-4 space-y-2">
                    {isUserJoined(event.id) ? (
                      <Button 
                        variant="outline" 
                        onClick={() => handleLeaveEvent(event.id)}
                        className="w-full"
                      >
                        Leave Event
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleJoinEvent(event.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Join Event
                      </Button>
                    )}
                  </div>
                )}
                
                {!user && (
                  <div className="pt-4">
                    <Link to="/auth">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Sign In to Join
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-4">Join communities first to see their upcoming cleanup events.</p>
            <Link to="/communities">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Browse Communities
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;