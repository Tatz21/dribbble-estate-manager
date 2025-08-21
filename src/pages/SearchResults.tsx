import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Bed, Bath, Square, Eye, Edit, Users, Calendar, Phone, Mail } from 'lucide-react';
import { useProperties, useClients, useAgents } from '@/hooks/useSupabaseQuery';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: properties = [] } = useProperties();
  const { data: clients = [] } = useClients();
  const { data: agents = [] } = useAgents();

  // Get search query from URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Filter results based on search term
  const filteredProperties = properties.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAgents = agents.filter(agent =>
    agent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
    }
  };

  const totalResults = filteredProperties.length + filteredClients.length + filteredAgents.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
          <p className="text-muted-foreground mt-1">
            {searchTerm ? `Found ${totalResults} results for "${searchTerm}"` : 'Enter a search term to find properties, clients, or agents'}
          </p>
        </div>

        {/* Search Form */}
        <Card className="card-modern">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties, clients, or agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="btn-gradient">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchTerm && (
          <>
            {/* Properties Results */}
            {filteredProperties.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Properties ({filteredProperties.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.slice(0, 6).map((property) => (
                    <Card key={property.id} className="card-modern overflow-hidden group">
                      <div className="relative">
                        <img
                          src={property.images?.[0] || "/placeholder.svg"}
                          alt={property.title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge 
                          className={`absolute top-2 right-2 text-xs ${
                            property.status === 'available' ? 'bg-success' :
                            property.status === 'sold' ? 'bg-destructive' :
                            'bg-warning'
                          }`}
                        >
                          {property.status}
                        </Badge>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{property.title}</CardTitle>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.city}, {property.state}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-primary">₹{property.price.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          {property.bedrooms > 0 && (
                            <div className="flex items-center">
                              <Bed className="h-3 w-3 mr-1" />
                              {property.bedrooms}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Bath className="h-3 w-3 mr-1" />
                            {property.bathrooms}
                          </div>
                          <div className="flex items-center">
                            <Square className="h-3 w-3 mr-1" />
                            {property.square_feet} sq ft
                          </div>
                        </div>
                        
                        <Link to={`/properties/${property.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredProperties.length > 6 && (
                  <div className="text-center">
                    <Link to="/properties">
                      <Button variant="outline">View All Properties</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Clients Results */}
            {filteredClients.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Clients ({filteredClients.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClients.slice(0, 6).map((client) => (
                    <Card key={client.id} className="card-modern">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{client.full_name}</CardTitle>
                        <Badge variant="outline" className="w-fit text-xs">
                          {client.client_type}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {client.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 mr-2" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-2" />
                            {client.phone}
                          </div>
                        )}
                        {client.budget_min && client.budget_max && (
                          <div className="text-sm text-muted-foreground">
                            Budget: ₹{client.budget_min.toLocaleString()} - ₹{client.budget_max.toLocaleString()}
                          </div>
                        )}
                        <Link to={`/clients/edit/${client.id}`}>
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            <Eye className="h-3 w-3 mr-1" />
                            View Client
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredClients.length > 6 && (
                  <div className="text-center">
                    <Link to="/clients">
                      <Button variant="outline">View All Clients</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Agents Results */}
            {filteredAgents.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Agents ({filteredAgents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAgents.slice(0, 6).map((agent) => (
                    <Card key={agent.id} className="card-modern">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{agent.full_name}</CardTitle>
                        <Badge variant="outline" className="w-fit text-xs">
                          {agent.role}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-2" />
                          {agent.email}
                        </div>
                        {agent.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-2" />
                            {agent.phone}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          Role: {agent.role}
                        </div>
                        <Link to={`/agents/view/${agent.id}`}>
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            <Eye className="h-3 w-3 mr-1" />
                            View Agent
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredAgents.length > 6 && (
                  <div className="text-center">
                    <Link to="/agents">
                      <Button variant="outline">View All Agents</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {totalResults === 0 && (
              <Card className="card-modern">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    No properties, clients, or agents match your search for "{searchTerm}".
                    Try adjusting your search terms.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}