import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Home, 
  Calendar,
  MessageCircle,
  Settings,
  ArrowLeft,
  Building,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CommunicationHistory from '@/components/communications/CommunicationHistory';

const ClientPortal = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: client, isLoading } = useQuery({
    queryKey: ['client-portal', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID is required');
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          agent:agent_id(id, full_name, email, phone)
        `)
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });

  const { data: recentMeetings = [] } = useQuery({
    queryKey: ['client-meetings', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('client_id', clientId)
        .order('meeting_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId
  });

  const { data: matchedProperties = [] } = useQuery({
    queryKey: ['client-matched-properties', clientId],
    queryFn: async () => {
      if (!client) return [];
      
      // Basic property matching based on budget and locations
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'available');

      if (client.budget_min) {
        query = query.gte('price', client.budget_min);
      }
      if (client.budget_max) {
        query = query.lte('price', client.budget_max);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: !!client
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading client portal...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested client portal could not be found.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (!amount) return '₹0';
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">
                  {getInitials(client.full_name || 'Client')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{client.full_name}</h1>
                <p className="text-muted-foreground capitalize">{client.client_type} Client</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Client Portal
            </Badge>
          </div>
          
          {/* Navigation */}
          <div className="flex gap-4 mt-6 border-b">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'meetings', label: 'Meetings', icon: Calendar },
              { id: 'communications', label: 'Messages', icon: MessageCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.address}</span>
                      </div>
                    )}
                    {client.budget_min && client.budget_max && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatCurrency(client.budget_min)} - {formatCurrency(client.budget_max)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {client.preferred_locations && client.preferred_locations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Preferred Locations
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {client.preferred_locations.map((location, index) => (
                          <Badge key={index} variant="outline">{location}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {client.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {client.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Agent Information */}
            <div className="space-y-6">
              {client.agent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Your Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials((client.agent as any).full_name || 'Agent')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{(client.agent as any).full_name}</p>
                        <p className="text-sm text-muted-foreground">{(client.agent as any).email}</p>
                      </div>
                    </div>
                    {(client.agent as any).phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {(client.agent as any).phone}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Meetings</span>
                    <span className="font-medium">{recentMeetings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Matched Properties</span>
                    <span className="font-medium">{matchedProperties.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Client Since</span>
                    <span className="font-medium">
                      {new Date(client.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Properties for You</h2>
              <Badge variant="outline">{matchedProperties.length} matches</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedProperties.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No properties found</p>
                  <p className="text-muted-foreground">
                    We're working to find properties that match your preferences.
                  </p>
                </div>
              ) : (
                matchedProperties.map((property) => (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <Building className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {property.address}, {property.city}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(property.price)}
                        </span>
                        <Badge variant="outline">{property.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Meetings</h2>
            
            <div className="space-y-4">
              {recentMeetings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">No meetings scheduled</p>
                    <p className="text-muted-foreground">
                      Your agent will schedule meetings with you as needed.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                recentMeetings.map((meeting) => (
                  <Card key={meeting.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{meeting.title}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(meeting.meeting_date).toLocaleDateString()} at{' '}
                              {new Date(meeting.meeting_date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                            {meeting.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {meeting.location}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {meeting.duration_minutes || 60} minutes
                            </div>
                          </div>
                          {meeting.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {meeting.description}
                            </p>
                          )}
                        </div>
                        <Badge 
                          className={
                            meeting.status === 'completed' ? 'bg-success' :
                            meeting.status === 'confirmed' ? 'bg-primary' :
                            meeting.status === 'cancelled' ? 'bg-destructive' :
                            'bg-warning'
                          }
                        >
                          {meeting.status?.charAt(0).toUpperCase() + meeting.status?.slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'communications' && clientId && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Communication History</h2>
            <CommunicationHistory clientId={clientId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;