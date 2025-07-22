import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Mail, Calendar, DollarSign, MapPin, User, Building } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ViewLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      if (!id) throw new Error('Lead ID is required');
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_agent:assigned_agent_id(id, full_name, email, phone),
          property:property_id(id, title, address, price)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading lead details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lead) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Lead not found</div>
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

  const getStatusBadge = (status: string) => {
    const statusColors = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      qualified: 'bg-green-500',
      negotiation: 'bg-orange-500',
      converted: 'bg-emerald-500',
      closed: 'bg-red-500'
    };

    return (
      <Badge variant="secondary" className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const handleCall = () => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self');
    } else {
      toast({
        title: "No phone number",
        description: "This lead doesn't have a phone number",
        variant: "destructive",
      });
    }
  };

  const handleEmail = () => {
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_self');
    } else {
      toast({
        title: "No email address",
        description: "This lead doesn't have an email address",
        variant: "destructive",
      });
    }
  };

  const handleScheduleMeeting = () => {
    navigate(`/meetings/schedule?leadId=${lead.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Lead Details</h1>
              <p className="text-muted-foreground">View and manage lead information</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCall}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" onClick={handleEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button onClick={handleScheduleMeeting}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(lead.full_name || 'Unknown')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{lead.full_name || 'Unknown Lead'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(lead.status || 'new')}
                      <Badge variant="outline">{lead.source || 'Unknown'}</Badge>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{formatCurrency(lead.budget || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.interest_type || 'Not specified'}</span>
                  </div>
                </div>
                
                {lead.preferred_locations && lead.preferred_locations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Preferred Locations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {lead.preferred_locations.map((location, index) => (
                        <Badge key={index} variant="outline">{location}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {lead.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {lead.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Agent */}
            {lead.assigned_agent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Assigned Agent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials((lead.assigned_agent as any).full_name || 'Agent')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{(lead.assigned_agent as any).full_name}</p>
                      <p className="text-sm text-muted-foreground">{(lead.assigned_agent as any).email}</p>
                      {(lead.assigned_agent as any).phone && (
                        <p className="text-sm text-muted-foreground">{(lead.assigned_agent as any).phone}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Interest */}
            {lead.property && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Property Interest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">{(lead.property as any).title}</h4>
                    <p className="text-sm text-muted-foreground">{(lead.property as any).address}</p>
                    <p className="text-lg font-semibold text-success">
                      {formatCurrency((lead.property as any).price || 0)}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/properties/${(lead.property as any).id}`)}
                    >
                      View Property
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Lead Created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {lead.updated_at !== lead.created_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(lead.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewLead;