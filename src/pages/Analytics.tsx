import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Building, Target, DollarSign, Calendar, Star, ArrowUp, ArrowDown } from 'lucide-react';

// Mock data
const analyticsData = {
  overview: {
    totalRevenue: "₹45.2 Cr",
    revenueGrowth: "+12.5%",
    totalDeals: 156,
    dealsGrowth: "+8.2%",
    activeAgents: 12,
    agentsGrowth: "+2",
    avgDealValue: "₹2.8 Cr",
    avgGrowth: "+5.4%"
  },
  topPerformers: [
    { name: "Priya Sharma", deals: 24, revenue: "₹12.5 Cr", growth: "+15%" },
    { name: "Rajesh Kumar", deals: 20, revenue: "₹10.8 Cr", growth: "+10%" },
    { name: "Amit Singh", deals: 18, revenue: "₹9.2 Cr", growth: "+8%" },
    { name: "Sneha Patel", deals: 16, revenue: "₹8.5 Cr", growth: "+12%" },
    { name: "Vikram Gupta", deals: 14, revenue: "₹7.8 Cr", growth: "+6%" }
  ],
  propertyTypes: [
    { type: "Residential", count: 89, percentage: 57, revenue: "₹25.8 Cr" },
    { type: "Commercial", count: 45, percentage: 29, revenue: "₹15.2 Cr" },
    { type: "Luxury", count: 15, percentage: 10, revenue: "₹3.2 Cr" },
    { type: "Plots", count: 7, percentage: 4, revenue: "₹1.0 Cr" }
  ],
  leadPipeline: [
    { stage: "New Leads", count: 45, percentage: 35 },
    { stage: "Contacted", count: 32, percentage: 25 },
    { stage: "Qualified", count: 25, percentage: 20 },
    { stage: "Negotiation", count: 18, percentage: 14 },
    { stage: "Closed", count: 8, percentage: 6 }
  ],
  monthlyTrends: [
    { month: "Jan", deals: 12, revenue: 3.2 },
    { month: "Feb", deals: 18, revenue: 4.8 },
    { month: "Mar", deals: 15, revenue: 4.2 },
    { month: "Apr", deals: 22, revenue: 6.5 },
    { month: "May", deals: 28, revenue: 8.2 },
    { month: "Jun", deals: 25, revenue: 7.8 }
  ]
};

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track performance, trends, and business insights
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.overview.totalRevenue}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">{analyticsData.overview.revenueGrowth}</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Deals</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.overview.totalDeals}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">{analyticsData.overview.dealsGrowth}</span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.overview.activeAgents}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">{analyticsData.overview.agentsGrowth}</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Deal Value</p>
                  <p className="text-2xl font-bold text-foreground">{analyticsData.overview.avgDealValue}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">{analyticsData.overview.avgGrowth}</span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Performing Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPerformers.map((agent, index) => (
                  <div key={agent.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.deals} deals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{agent.revenue}</p>
                      <div className="flex items-center gap-1">
                        <ArrowUp className="h-3 w-3 text-success" />
                        <span className="text-sm text-success">{agent.growth}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Types Distribution */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property Types Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.propertyTypes.map((type) => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{type.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{type.count} properties</span>
                        <span className="font-semibold">{type.revenue}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">{type.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Pipeline */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Lead Pipeline Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {analyticsData.leadPipeline.map((stage, index) => (
                <div key={stage.stage} className="text-center">
                  <div className="bg-muted/50 rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-primary mb-1">{stage.count}</div>
                    <div className="text-sm text-muted-foreground">{stage.stage}</div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stage.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {analyticsData.monthlyTrends.map((month) => (
                <div key={month.month} className="text-center">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-2">{month.month}</div>
                    <div className="text-lg font-bold text-foreground">{month.deals}</div>
                    <div className="text-xs text-muted-foreground">deals</div>
                    <div className="text-sm font-semibold text-primary mt-2">₹{month.revenue}Cr</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}