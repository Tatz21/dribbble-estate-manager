import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Phone, Mail, Calendar, DollarSign, Eye, MessageCircle, MoveRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLeadsPipeline, useUpdateLeadStatus } from '@/hooks/useLeadsData';
import { useToast } from '@/hooks/use-toast';

const LeadsPipeline = () => {
  const { data: pipelineStages = [], isLoading, error } = useLeadsPipeline();
  const updateLeadStatus = useUpdateLeadStatus();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');

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
      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });
    } catch (error) {
      console.error('Failed to update lead status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const handleCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      toast({
        title: "No phone number",
        description: "This lead doesn't have a phone number",
        variant: "destructive",
      });
    }
  };

  const handleContact = (email: string) => {
    if (email) {
      window.open(`mailto:${email}`, '_self');
    } else {
      toast({
        title: "No email address",
        description: "This lead doesn't have an email address",
        variant: "destructive",
      });
    }
  };

  const handleScheduleMeeting = (leadId: string) => {
    navigate(`/meetings/schedule?leadId=${leadId}`);
  };

  const handleViewDetails = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const getNextStage = (currentStage: string) => {
    const stages = ['new', 'contacted', 'qualified', 'converted'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  };

  // Filter leads based on search and source
  const filteredStages = pipelineStages.map(stage => ({
    ...stage,
    leads: stage.leads.filter(lead => {
      const matchesSearch = lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.phone?.includes(searchTerm);
      const matchesSource = selectedSource === 'all' || lead.source === selectedSource;
      return matchesSearch && matchesSource;
    })
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
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
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
              <SelectItem value="advertisement">Advertisement</SelectItem>
              <SelectItem value="cold_call">Cold Call</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {filteredStages.map((stage) => (
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
                  <Card key={lead.id} className="hover:shadow-md transition-shadow">
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(lead.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                      
                      <div className="flex gap-1 mt-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleCall(lead.phone || '')}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleScheduleMeeting(lead.id)}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Meet
                        </Button>
                      </div>
                      
                      <div className="flex gap-1 mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleContact(lead.email || '')}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        {getNextStage(lead.status || 'new') && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleMoveStage(lead.id, lead.status || 'new', getNextStage(lead.status || 'new')!)}
                          >
                            <MoveRight className="h-3 w-3 mr-1" />
                            Move
                          </Button>
                        )}
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