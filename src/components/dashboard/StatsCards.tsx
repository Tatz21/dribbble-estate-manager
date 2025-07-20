import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Calendar, TrendingUp } from "lucide-react";
import { useStats } from "@/hooks/useSupabaseQuery";

export function StatsCards() {
  const { data: stats, isLoading } = useStats();

  const statsConfig = [
    {
      title: "Total Properties",
      value: stats?.totalProperties || 0,
      icon: Building2,
      description: "Listed properties"
    },
    {
      title: "Active Clients",
      value: stats?.totalClients || 0,
      icon: Users,
      description: "Registered clients"
    },
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: TrendingUp,
      description: "Potential clients"
    },
    {
      title: "Scheduled Meetings",
      value: stats?.totalMeetings || 0,
      icon: Calendar,
      description: "Upcoming meetings"
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
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}