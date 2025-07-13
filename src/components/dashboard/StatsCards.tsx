import React from 'react';
import { Building2, Users, Target, IndianRupee, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Properties",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Building2,
    color: "text-blue-600"
  },
  {
    title: "Active Clients",
    value: "856",
    change: "+8%",
    trend: "up", 
    icon: Users,
    color: "text-green-600"
  },
  {
    title: "Hot Leads",
    value: "143",
    change: "+23%",
    trend: "up",
    icon: Target,
    color: "text-orange-600"
  },
  {
    title: "Monthly Revenue",
    value: "₹24.5L",
    change: "+18%",
    trend: "up",
    icon: IndianRupee,
    color: "text-purple-600"
  },
  {
    title: "Properties Sold",
    value: "89",
    change: "+15%",
    trend: "up",
    icon: TrendingUp,
    color: "text-emerald-600"
  },
  {
    title: "Meetings Today",
    value: "12",
    change: "+3",
    trend: "up",
    icon: Calendar,
    color: "text-red-600"
  }
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat, index) => (
        <Card key={stat.title} className="card-modern hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={`${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'} font-medium`}>
                {stat.change}
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}