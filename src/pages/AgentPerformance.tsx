import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Search, Trophy, TrendingUp, Target, DollarSign, Calendar, Star, User, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAgents, useAgentPerformance } from '@/hooks/useSupabaseQuery';
import { PerformanceMetricsForm } from '@/components/agents/PerformanceMetricsForm';

export default function AgentPerformance() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: agents = [], isLoading } = useAgents();
  const { data: allPerformance = [] } = useAgentPerformance();
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  // Process agents with performance data
  const performanceAgents = React.useMemo(() => {
    return agents.map(agent => {
      const performance = allPerformance.filter(p => p.agent_id === agent.id).slice(0, 6);
      
      // Calculate aggregated metrics
      const totalDeals = performance.reduce((sum, p) => sum + (p.deals_completed || 0), 0);
      const totalRevenue = performance.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
      const totalTarget = performance.reduce((sum, p) => sum + (p.target_revenue || 0), 0);
      const avgSatisfaction = performance.length > 0 
        ? performance.reduce((sum, p) => sum + (p.client_satisfaction || 0), 0) / performance.length
        : 0;
      const avgResponseTime = performance.length > 0
        ? performance.reduce((sum, p) => sum + (p.response_time_hours || 0), 0) / performance.length
        : 0;
      const avgConversion = performance.length > 0
        ? performance.reduce((sum, p) => sum + (p.conversion_rate || 0), 0) / performance.length
        : 0;

      return {
        ...agent,
        performance,
        metrics: {
          dealsCompleted: totalDeals,
          totalRevenue: totalRevenue,
          targetAchievement: totalTarget > 0 ? Math.round((totalRevenue / totalTarget) * 100) : 0,
          avgDealValue: totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0,
          clientSatisfaction: Math.round(avgSatisfaction * 10) / 10,
          responseTime: `${Math.round(avgResponseTime * 10) / 10} hrs`,
          conversionRate: Math.round(avgConversion)
        },
        monthlyPerformance: performance.map(p => ({
          month: new Date(p.month).toLocaleDateString('en-US', { month: 'short' }),
          deals: p.deals_completed || 0,
          revenue: p.total_revenue || 0
        })),
        status: totalTarget > 0 && totalRevenue > totalTarget * 0.9 ? 'Above Target' :
               totalTarget > 0 && totalRevenue > totalTarget * 0.7 ? 'On Target' : 'Below Target'
      };
    });
  }, [agents, allPerformance]);

  // Set first agent as selected when data loads
  React.useEffect(() => {
    if (performanceAgents.length > 0 && !selectedAgent) {
      setSelectedAgent(performanceAgents[0]);
    }
  }, [performanceAgents.length, selectedAgent]);

  const quickRefetch = () => {
    // Force a fast re-computation of the memoized data
    setSelectedAgent(null);
    setTimeout(() => {
      if (performanceAgents.length > 0) {
        setSelectedAgent(performanceAgents[0]);
      }
    }, 100);
  };

  const filteredAgents = performanceAgents.filter(agent =>
    agent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set first agent as selected when data loads
  React.useEffect(() => {
    if (performanceAgents.length > 0 && !selectedAgent) {
      setSelectedAgent(performanceAgents[0]);
    }
  }, [performanceAgents.length, selectedAgent]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agent Performance</h1>
            <p className="text-muted-foreground mt-1">Loading performance data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (agents.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link to="/agents">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Agents
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Agent Performance</h1>
              <p className="text-muted-foreground mt-1">No agents found to analyze</p>
            </div>
          </div>
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No agents available</p>
            <p className="text-muted-foreground mb-4">Add agents first to view their performance metrics</p>
            <Link to="/agents/add">
              <Button className="btn-gradient">Add Your First Agent</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!selectedAgent) return null;

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
          
          {selectedAgent && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground px-2 py-1 bg-primary/5 rounded">
                ⚡ Live Updates
              </div>
              <PerformanceMetricsForm
                agentId={selectedAgent.id}
                agentName={selectedAgent.full_name || 'Unnamed Agent'}
                onSuccess={quickRefetch}
              />
            </div>
          )}
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
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{agent.full_name || 'Unnamed Agent'}</div>
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
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedAgent.full_name || 'Unnamed Agent'}</h2>
                      <p className="text-muted-foreground">{selectedAgent.role}</p>
                      <div className="flex gap-2 mt-2">
                        {selectedAgent.specialization && selectedAgent.specialization.length > 0 ? (
                          selectedAgent.specialization.map((spec: string) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            General
                          </Badge>
                        )}
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
              <Card className="card-modern group relative">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    Client Satisfaction
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <PerformanceMetricsForm
                        agentId={selectedAgent.id}
                        agentName={selectedAgent.full_name || 'Unnamed Agent'}
                        existingMetrics={selectedAgent.performance?.[0]}
                        onSuccess={quickRefetch}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold">{selectedAgent.metrics.clientSatisfaction}</span>
                    <span className="text-muted-foreground">/5</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-modern group relative">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    Response Time
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <PerformanceMetricsForm
                        agentId={selectedAgent.id}
                        agentName={selectedAgent.full_name || 'Unnamed Agent'}
                        existingMetrics={selectedAgent.performance?.[0]}
                        onSuccess={quickRefetch}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{selectedAgent.metrics.responseTime}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-modern group relative">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    Conversion Rate
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <PerformanceMetricsForm
                        agentId={selectedAgent.id}
                        agentName={selectedAgent.full_name || 'Unnamed Agent'}
                        existingMetrics={selectedAgent.performance?.[0]}
                        onSuccess={quickRefetch}
                      />
                    </div>
                  </CardTitle>
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
                {selectedAgent.monthlyPerformance && selectedAgent.monthlyPerformance.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {selectedAgent.monthlyPerformance.map((month, index) => {
                      const performanceRecord = selectedAgent.performance?.find((p: any) => 
                        new Date(p.month).toLocaleDateString('en-US', { month: 'short' }) === month.month
                      );
                      
                      return (
                        <div key={`${month.month}-${index}`} className="relative group">
                          <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors">
                            <div className="text-sm text-muted-foreground mb-2">{month.month}</div>
                            <div className="text-lg font-bold text-foreground">{month.deals}</div>
                            <div className="text-xs text-muted-foreground">deals</div>
                            <div className="text-sm font-semibold text-primary mt-2">{formatCurrency(month.revenue)}</div>
                          </div>
                          {performanceRecord && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <PerformanceMetricsForm
                                agentId={selectedAgent.id}
                                agentName={selectedAgent.full_name || 'Unnamed Agent'}
                                existingMetrics={performanceRecord}
                                onSuccess={quickRefetch}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No performance data available</p>
                    <p className="text-sm text-muted-foreground">Add monthly metrics to track performance trends</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}