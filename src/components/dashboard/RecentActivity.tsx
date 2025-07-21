import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // Get recent properties, clients, and meetings for activity feed
      const [propertiesRes, clientsRes, meetingsRes] = await Promise.all([
        supabase
          .from('properties')
          .select('*, agent:agents(*)')
          .order('created_at', { ascending: false })
          .limit(2),
        supabase
          .from('clients')
          .select('*, agent:agents(*)')
          .order('created_at', { ascending: false })
          .limit(2),
        supabase
          .from('meetings')
          .select('*, agent:agents(*)')
          .order('created_at', { ascending: false })
          .limit(2)
      ]);

      const activities = [];
      
      if (propertiesRes.data) {
        activities.push(...propertiesRes.data.map(property => ({
          id: `property-${property.id}`,
          user: (property as any).agent?.full_name || 'Unknown Agent',
          action: 'added a new property',
          target: property.title,
          time: formatDistanceToNow(new Date(property.created_at), { addSuffix: true }),
          avatar: null
        })));
      }

      if (clientsRes.data) {
        activities.push(...clientsRes.data.map(client => ({
          id: `client-${client.id}`,
          user: (client as any).agent?.full_name || 'Unknown Agent',
          action: 'added a new client',
          target: client.full_name,
          time: formatDistanceToNow(new Date(client.created_at), { addSuffix: true }),
          avatar: null
        })));
      }

      if (meetingsRes.data) {
        activities.push(...meetingsRes.data.map(meeting => ({
          id: `meeting-${meeting.id}`,
          user: (meeting as any).agent?.full_name || 'Unknown Agent',
          action: 'scheduled a meeting',
          target: meeting.title,
          time: formatDistanceToNow(new Date(meeting.created_at), { addSuffix: true }),
          avatar: null
        })));
      }

      return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
    }
  });

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
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.avatar} />
                  <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}