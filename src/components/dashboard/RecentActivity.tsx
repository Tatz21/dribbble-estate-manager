import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Phone, Calendar } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: "property_inquiry",
    title: "New property inquiry",
    description: "John Smith inquired about 3BHK in Bandra",
    user: "John Smith",
    time: "5 minutes ago",
    icon: Building2,
    status: "new"
  },
  {
    id: 2,
    type: "client_added",
    title: "New client registered",
    description: "Sarah Johnson registered as a buyer",
    user: "Sarah Johnson",
    time: "15 minutes ago",
    icon: Users,
    status: "completed"
  },
  {
    id: 3,
    type: "call_completed",
    title: "Follow-up call completed",
    description: "Called Rahul Mehta for site visit confirmation",
    user: "Agent: Priya",
    time: "1 hour ago",
    icon: Phone,
    status: "completed"
  },
  {
    id: 4,
    type: "meeting_scheduled",
    title: "Site visit scheduled",
    description: "Meeting scheduled with the Kumar family",
    user: "Agent: Rajesh",
    time: "2 hours ago",
    icon: Calendar,
    status: "pending"
  },
  {
    id: 5,
    type: "property_sold",
    title: "Property sold",
    description: "2BHK apartment in Andheri sold successfully",
    user: "Agent: Amit",
    time: "3 hours ago",
    icon: Building2,
    status: "completed"
  }
];

export function RecentActivity() {
  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`p-2 rounded-full ${
              activity.status === 'new' ? 'bg-blue-500/10 text-blue-600' :
              activity.status === 'completed' ? 'bg-green-500/10 text-green-600' :
              'bg-yellow-500/10 text-yellow-600'
            }`}>
              <activity.icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{activity.title}</p>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    activity.status === 'new' ? 'border-blue-200 text-blue-600' :
                    activity.status === 'completed' ? 'border-green-200 text-green-600' :
                    'border-yellow-200 text-yellow-600'
                  }`}
                >
                  {activity.status}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground">{activity.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-xs">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{activity.user}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}