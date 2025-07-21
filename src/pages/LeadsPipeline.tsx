import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLeadsPipeline, useUpdateLeadStatus } from '@/hooks/useLeadsData';

const LeadsPipeline = () => {
  const { data: pipelineStages = [], isLoading, error } = useLeadsPipeline();
  const updateLeadStatus = useUpdateLeadStatus();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading pipeline...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Error loading pipeline</div>
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '₹0';
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  };

  const handleMoveStage = async (leadId: string, currentStatus: string, targetStatus: string) => {
    try {
      await updateLeadStatus.mutateAsync({ leadId, status: targetStatus });
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/leads">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Sales Pipeline</h1>
            <p className="text-muted-foreground">Track leads through your sales process</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <h3 className="font-semibold">{stage.name}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {stage.leads.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {stage.leads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                          <AvatarFallback>{getInitials(lead.full_name || 'Unknown')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{lead.full_name || 'Unknown Lead'}</CardTitle>
                          <p className="text-xs text-muted-foreground">{lead.source || 'Unknown'}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3 text-success" />
                          <span className="font-semibold text-success">
                            {formatCurrency(lead.budget || 0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{lead.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone || 'No phone'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Meet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPipeline;