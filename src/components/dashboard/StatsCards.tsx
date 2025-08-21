import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Calendar, TrendingUp } from "lucide-react";
import { useStats } from "@/hooks/useSupabaseQuery";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function StatsCards() {
  const { data: stats, isLoading } = useStats();
  const queryClient = useQueryClient();

  // Set up real-time subscriptions for stats updates
  useEffect(() => {
    const channels = [];

    // Listen for changes to all tables that affect stats
    const tables = ['properties', 'clients', 'leads', 'meetings'];
    
    tables.forEach(table => {
      const channel = supabase
        .channel(`${table}-stats-realtime`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table }, 
          (payload) => {
            console.log(`${table} changed:`, payload);
            // Invalidate stats to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['stats'] });
          }
        )
        .subscribe();
      
      channels.push(channel);
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  const statsConfig = [
    {
      title: "Total Properties",
      value: stats?.totalProperties || 0,
      icon: Building2,
      description: "Listed properties",
      change: "+2 this week"
    },
    {
      title: "Active Clients",
      value: stats?.totalClients || 0,
      icon: Users,
      description: "Registered clients",
      change: "+5 this month"
    },
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: TrendingUp,
      description: "Potential clients",
      change: "+12 this week"
    },
    {
      title: "Scheduled Meetings",
      value: stats?.totalMeetings || 0,
      icon: Calendar,
      description: "Upcoming meetings",
      change: "+3 today"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="transition-all duration-300 hover:shadow-lg border-primary/20 hover:border-primary/40"
            style={{ 
              background: index % 2 === 0 
                ? 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary) / 0.05))' 
                : 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary) / 0.05))'
            }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold transition-all duration-500 ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}`}>
                {stat.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <span className="text-xs text-success">
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}