import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Search, Trophy, TrendingUp, TrendingDown, Target, DollarSign, Calendar, Star, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock performance data
const performanceData = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Senior Agent",
    avatar: "RK",
    metrics: {
      dealsCompleted: 24,
      totalRevenue: 12500000,
      targetAchievement: 85,
      avgDealValue: 520833,
      clientSatisfaction: 4.8,
      responseTime: "2.5 hrs",
      conversionRate: 32
    },
    monthlyPerformance: [
      { month: "Jan", deals: 4, revenue: 2100000 },
      { month: "Feb", deals: 3, revenue: 1800000 },
      { month: "Mar", deals: 5, revenue: 2600000 },
      { month: "Apr", deals: 4, revenue: 2000000 },
      { month: "May", deals: 4, revenue: 2200000 },
      { month: "Jun", deals: 4, revenue: 1800000 }
    ],
    specialization: ["Residential", "Commercial"],
    status: "Above Target"
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Agent",
    avatar: "PS",
    metrics: {
      dealsCompleted: 18,
      totalRevenue: 8200000,
      targetAchievement: 72,
      avgDealValue: 455556,
      clientSatisfaction: 4.6,
      responseTime: "3.1 hrs",
      conversionRate: 28
    },
    monthlyPerformance: [
      { month: "Jan", deals: 3, revenue: 1400000 },
      { month: "Feb", deals: 3, revenue: 1350000 },
      { month: "Mar", deals: 3, revenue: 1400000 },
      { month: "Apr", deals: 3, revenue: 1300000 },
      { month: "May", deals: 3, revenue: 1375000 },
      { month: "Jun", deals: 3, revenue: 1375000 }
    ],
    specialization: ["Residential", "Luxury"],
    status: "On Target"
  },
  {
    id: 3,
    name: "Amit Singh",
    role: "Junior Agent",
    avatar: "AS",
    metrics: {
      dealsCompleted: 12,
      totalRevenue: 4800000,
      targetAchievement: 48,
      avgDealValue: 400000,
      clientSatisfaction: 4.3,
      responseTime: "4.2 hrs",
      conversionRate: 22
    },
    monthlyPerformance: [
      { month: "Jan", deals: 2, revenue: 800000 },
      { month: "Feb", deals: 2, revenue: 750000 },
      { month: "Mar", deals: 2, revenue: 850000 },
      { month: "Apr", deals: 2, revenue: 800000 },
      { month: "May", deals: 2, revenue: 800000 },
      { month: "Jun", deals: 2, revenue: 800000 }
    ],
    specialization: ["Commercial", "Plots"],
    status: "Below Target"
  }
];

export default function AgentPerformance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(performanceData[0]);

  const filteredAgents = performanceData.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Above Target': return 'bg-success text-success-foreground';
      case 'On Target': return 'bg-primary text-primary-foreground';
      case 'Below Target': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/agents">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Agents
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Agent Performance</h1>
              <p className="text-muted-foreground mt-1">
                Track and analyze individual agent performance metrics
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Selection */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Select Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAgent.id === agent.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">{agent.avatar}</span>
                      </div>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">{agent.role}</div>
                        <Badge className={`text-xs mt-1 ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Agent Header */}
            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-xl">{selectedAgent.avatar}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                      <p className="text-muted-foreground">{selectedAgent.role}</p>
                      <div className="flex gap-2 mt-2">
                        {selectedAgent.specialization.map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(selectedAgent.status)} text-sm px-4 py-2`}>
                    {selectedAgent.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Deals Completed</p>
                      <p className="text-2xl font-bold text-foreground">{selectedAgent.metrics.dealsCompleted}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(selectedAgent.metrics.totalRevenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Target Achievement</p>
                      <p className="text-2xl font-bold text-foreground">{selectedAgent.metrics.targetAchievement}%</p>
                    </div>
                    <Target className="h-8 w-8 text-warning" />
                  </div>
                  <Progress value={selectedAgent.metrics.targetAchievement} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Deal Value</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(selectedAgent.metrics.avgDealValue)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="text-sm">Client Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold">{selectedAgent.metrics.clientSatisfaction}</span>
                    <span className="text-muted-foreground">/5</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="text-sm">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{selectedAgent.metrics.responseTime}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="text-sm">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <span className="text-2xl font-bold">{selectedAgent.metrics.conversionRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Performance Chart */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {selectedAgent.monthlyPerformance.map((month) => (
                    <div key={month.month} className="text-center">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-2">{month.month}</div>
                        <div className="text-lg font-bold text-foreground">{month.deals}</div>
                        <div className="text-xs text-muted-foreground">deals</div>
                        <div className="text-sm font-semibold text-primary mt-2">{formatCurrency(month.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}