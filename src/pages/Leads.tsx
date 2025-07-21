import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Phone, Mail, User, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLeadsWithDetails, useUpdateLeadStatus } from '@/hooks/useLeadsData';
import { format } from 'date-fns';

const stages = ["new", "contacted", "qualified", "negotiation", "closed"];

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedSource, setSelectedSource] = useState('');

  const { data: leads = [], isLoading, error } = useLeadsWithDetails();
  const updateLeadStatus = useUpdateLeadStatus();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading leads...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Error loading leads</div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !selectedStage || lead.status === selectedStage;
    const matchesSource = !selectedSource || lead.source === selectedSource;
    return matchesSearch && matchesStage && matchesSource;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-yellow-500';
      case 'qualified': return 'bg-orange-500';
      case 'negotiation': return 'bg-purple-500';
      case 'closed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStageMove = async (leadId: string, currentStatus: string) => {
    const currentIndex = stages.indexOf(currentStatus);
    const nextStatus = stages[currentIndex + 1];
    if (nextStatus) {
      try {
        await updateLeadStatus.mutateAsync({ leadId, status: nextStatus });
      } catch (error) {
        console.error('Failed to update lead status:', error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your sales pipeline
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/leads/pipeline">
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Pipeline View
              </Button>
            </Link>
            <Link to="/leads/add">
              <Button className="btn-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
              >
                <option value="">All Stages</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage.charAt(0).toUpperCase() + stage.slice(1)}</option>
                ))}
              </select>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="website">Website</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="social_media">Social Media</option>
                <option value="referral">Referral</option>
                <option value="cold_call">Cold Call</option>
              </select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lead List */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <Card className="card-modern">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">No Leads Found</h3>
                <p className="text-muted-foreground mb-4">
                  {leads.length === 0 
                    ? "Start adding leads to see them here." 
                    : "Try adjusting your filters to see more results."}
                </p>
                <Link to="/leads/add">
                  <Button className="btn-gradient">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Lead
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredLeads.map((lead: any) => (
              <Card key={lead.id} className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{lead.full_name}</h3>
                        <Badge className={getStageColor(lead.status || 'new')}>
                          {(lead.status || 'new').charAt(0).toUpperCase() + (lead.status || 'new').slice(1)}
                        </Badge>
                        <Badge variant="outline">{lead.source || 'Unknown'}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {lead.email || 'No email'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {lead.phone || 'No phone'}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {lead.assigned_agent?.full_name || 'Unassigned'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Interest:</span>
                          <p className="font-medium">{lead.interest_type || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Budget:</span>
                          <p className="font-medium">
                            {lead.budget ? `₹${(lead.budget / 10000000).toFixed(1)} Cr` : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Property:</span>
                          <p className="font-medium">{lead.property?.title || 'No property linked'}</p>
                        </div>
                      </div>
                      
                      {lead.notes && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground">Notes: </span>
                          <span className="text-sm">{lead.notes}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="btn-gradient">
                        Contact
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {lead.status !== 'closed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStageMove(lead.id, lead.status || 'new')}
                          disabled={updateLeadStatus.isPending}
                        >
                          Move Stage
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}