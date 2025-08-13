import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export function RecentActivity() {
  const queryClient = useQueryClient();
  const [newActivities, setNewActivities] = useState<string[]>([]);
  const [lastSeenTime, setLastSeenTime] = useState<Date>(new Date());

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // Get recent properties, clients, and meetings for activity feed
      const [propertiesRes, clientsRes, meetingsRes] = await Promise.all([
        supabase
          .from('properties')
          .select('*, agent:profiles(*)')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('clients')
          .select('*, agent:profiles(*)')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('meetings')
          .select('*, agent:profiles(*)')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const activities = [];
      
      if (propertiesRes.data) {
        activities.push(...propertiesRes.data.map(property => ({
          id: `property-${property.id}`,
          user: (property as any).agent?.full_name || 'Unknown Agent',
          action: 'added a new property',
          target: property.title,
          time: property.created_at,
          timeFormatted: formatDistanceToNow(new Date(property.created_at), { addSuffix: true }),
          avatar: (property as any).agent?.avatar_url || null,
          type: 'property'
        })));
      }

      if (clientsRes.data) {
        activities.push(...clientsRes.data.map(client => ({
          id: `client-${client.id}`,
          user: (client as any).agent?.full_name || 'Unknown Agent',
          action: 'added a new client',
          target: client.full_name,
          time: client.created_at,
          timeFormatted: formatDistanceToNow(new Date(client.created_at), { addSuffix: true }),
          avatar: (client as any).agent?.avatar_url || null,
          type: 'client'
        })));
      }

      if (meetingsRes.data) {
        activities.push(...meetingsRes.data.map(meeting => ({
          id: `meeting-${meeting.id}`,
          user: (meeting as any).agent?.full_name || 'Unknown Agent',
          action: 'scheduled a meeting',
          target: meeting.title,
          time: meeting.created_at,
          timeFormatted: formatDistanceToNow(new Date(meeting.created_at), { addSuffix: true }),
          avatar: (meeting as any).agent?.avatar_url || null,
          type: 'meeting'
        })));
      }

      return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);
    }
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const channels = [];

    // Properties subscription
    const propertiesChannel = supabase
      .channel('properties-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'properties' }, 
        (payload) => {
          console.log('New property added:', payload);
          setNewActivities(prev => [...prev, `property-${payload.new.id}`]);
          queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
      )
      .subscribe();

    // Clients subscription
    const clientsChannel = supabase
      .channel('clients-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'clients' }, 
        (payload) => {
          console.log('New client added:', payload);
          setNewActivities(prev => [...prev, `client-${payload.new.id}`]);
          queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['clients'] });
        }
      )
      .subscribe();

    // Meetings subscription
    const meetingsChannel = supabase
      .channel('meetings-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'meetings' }, 
        (payload) => {
          console.log('New meeting scheduled:', payload);
          setNewActivities(prev => [...prev, `meeting-${payload.new.id}`]);
          queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['meetings'] });
        }
      )
      .subscribe();

    channels.push(propertiesChannel, clientsChannel, meetingsChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  const markAsRead = () => {
    setNewActivities([]);
    setLastSeenTime(new Date());
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property': return '🏠';
      case 'client': return '👤';
      case 'meeting': return '📅';
      default: return '📌';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          Recent Activity
          {newActivities.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {newActivities.length} new
            </Badge>
          )}
        </CardTitle>
        {newActivities.length > 0 && (
          <button
            onClick={markAsRead}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Mark as read
          </button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => {
              const isNew = newActivities.includes(activity.id);
              return (
                <div 
                  key={activity.id} 
                  className={`flex items-center space-x-4 p-2 rounded-lg transition-all duration-300 ${
                    isNew ? 'bg-primary/5 border border-primary/20 animate-pulse' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {isNew && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse">
                        <span className="sr-only">New activity</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getActivityIcon(activity.type)}</span>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      {isNew && (
                        <Badge variant="outline" className="text-xs bg-primary/10">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.timeFormatted}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}