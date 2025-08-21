import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Phone, Mail, MapPin, User, Calendar, Edit, Trash2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClients } from '@/hooks/useSupabaseQuery';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const { toast } = useToast();
  const { data: clients = [], isLoading, error } = useClients();

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Client deleted",
        description: "The client has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || client.client_type === selectedType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground mt-1">Loading clients...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground mt-1">
              Manage your client relationships and preferences
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/clients/preferences">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Preferences
              </Button>
            </Link>
            <Link to="/clients/add">
              <Button className="btn-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
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
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
                <option value="investor">Investor</option>
              </select>
              
              <Button variant="outline" onClick={() => toast({ title: "Coming Soon", description: "Advanced filters will be available soon." })}>
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No clients found</p>
              <p className="text-muted-foreground mb-4">
                {clients.length === 0 ? "Start by adding your first client" : "Try adjusting your search filters"}
              </p>
              <Link to="/clients/add">
                <Button className="btn-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </Link>
            </div>
          ) : (
            filteredClients.map((client) => (
              <Card key={client.id} className="card-modern">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{client.full_name || 'Unnamed Client'}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">{client.client_type || 'No type'}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {client.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {client.address}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-3 space-y-2">
                    {client.budget_min && client.budget_max && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">₹{client.budget_min?.toLocaleString()} - ₹{client.budget_max?.toLocaleString()}</span>
                      </div>
                    )}
                    {client.agent && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Agent:</span>
                        <span className="font-medium">{client.agent.full_name || 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                  
                  {client.preferred_locations && client.preferred_locations.length > 0 && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground mb-1">Preferred Locations:</p>
                      <p className="text-sm">{client.preferred_locations.join(', ')}</p>
                    </div>
                  )}

                  {client.notes && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                      <p className="text-sm">{client.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Added: {new Date(client.created_at).toLocaleDateString()}
                    </div>
                    
                    <div className="flex gap-1">
                      <Link to={`/clients/edit/${client.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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