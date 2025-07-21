import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, DollarSign, Target, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLeadSources } from '@/hooks/useLeadsData';

export default function LeadSources() {
  const { data: sources = [], isLoading, error } = useLeadSources();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading lead sources...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Error loading lead sources</div>
        </div>
      </DashboardLayout>
    );
  }

  const getSourceIcon = (sourceName: string) => {
    const name = sourceName.toLowerCase();
    if (name.includes('website')) return '🌐';
    if (name.includes('whatsapp')) return '💬';
    if (name.includes('social')) return '📱';
    if (name.includes('referral')) return '👥';
    if (name.includes('call')) return '📞';
    if (name.includes('email')) return '📧';
    return '📊';
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/leads">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lead Sources</h1>
            <p className="text-muted-foreground mt-1">
              Analyze performance by lead source
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sources</p>
                  <p className="text-2xl font-bold text-foreground">{sources.length}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold text-foreground">
                    {sources.reduce((sum, s) => sum + s.totalLeads, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Conversion</p>
                  <p className="text-2xl font-bold text-foreground">
                    {sources.length > 0 
                      ? Math.round(sources.reduce((sum, s) => sum + s.conversionRate, 0) / sources.length)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(sources.reduce((sum, s) => sum + s.totalValue, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sources List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sources.map((source, index) => (
            <Card key={source.name} className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">{getSourceIcon(source.name)}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{source.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {source.totalLeads} total leads
                    </p>
                  </div>
                  <Badge 
                    variant={source.conversionRate >= 20 ? "default" : source.conversionRate >= 10 ? "secondary" : "outline"}
                  >
                    {source.conversionRate}% conversion
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">New Leads</span>
                      </div>
                      <p className="font-semibold text-lg">{source.newLeads}</p>
                    </div>
                    
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-success" />
                        <span className="text-muted-foreground">Converted</span>
                      </div>
                      <p className="font-semibold text-lg">{source.convertedLeads}</p>
                    </div>
                    
                    <div className="p-3 bg-muted/30 rounded-lg col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-warning" />
                        <span className="text-muted-foreground">Total Value</span>
                      </div>
                      <p className="font-semibold text-lg">{formatCurrency(source.totalValue)}</p>
                    </div>
                  </div>

                  {/* Conversion Rate Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Conversion Rate</span>
                      <span className="font-medium">{source.conversionRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(source.conversionRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Average Lead Value */}
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                    <span className="text-sm text-muted-foreground">Avg Lead Value</span>
                    <span className="font-semibold">{formatCurrency(source.avgLeadValue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sources.length === 0 && (
          <Card className="card-modern">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">No Lead Sources Found</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your leads to see source analytics here.
              </p>
              <Link to="/leads">
                <Button className="btn-gradient">
                  View All Leads
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}