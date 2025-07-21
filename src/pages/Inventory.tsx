import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Package, TrendingUp, TrendingDown, Eye, Edit, Building, MapPin, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch properties data
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_types(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch property types for filter
  const { data: propertyTypes = [] } = useQuery({
    queryKey: ['property-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_types')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading inventory...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Error loading inventory</div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredInventory = properties.filter(property => {
    const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || property.property_types?.name === selectedType;
    const matchesStatus = selectedStatus === 'all' || property.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === 'available').length;
  const soldProperties = properties.filter(p => p.status === 'sold').length;
  const rentedProperties = properties.filter(p => p.status === 'rented').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'sold': return 'bg-warning text-warning-foreground';
      case 'rented': return 'bg-destructive text-destructive-foreground';
      case 'under_construction': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
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

  const formatStatus = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'sold': return 'Sold';
      case 'rented': return 'Rented';
      case 'under_construction': return 'Under Construction';
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Property Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your properties
            </p>
          </div>
          <Link to="/properties/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-bold text-foreground">{totalProperties}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-success">{availableProperties}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sold</p>
                  <p className="text-2xl font-bold text-warning">{soldProperties}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rented</p>
                  <p className="text-2xl font-bold text-destructive">{rentedProperties}</p>
                </div>
                <Building className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="under_construction">Under Construction</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Property Inventory ({filteredInventory.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInventory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No properties found matching your criteria.</p>
                  <Link to="/properties/add">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Property
                    </Button>
                  </Link>
                </div>
              ) : (
                filteredInventory.map((property) => (
                  <div key={property.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{property.title}</h3>
                          <Badge className={getStatusColor(property.status)}>
                            {formatStatus(property.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Building className="h-4 w-4" />
                          <span>Property Agent</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{property.address}, {property.city}, {property.state}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-semibold text-success">{formatCurrency(property.price)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-semibold">{property.property_types?.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Size</p>
                          <p className="font-semibold">{property.square_feet ? `${property.square_feet} sq ft` : 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/properties/${property.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/properties/edit/${property.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Bedrooms: <span className="font-semibold text-foreground">{property.bedrooms || 'N/A'}</span>
                          {property.bathrooms && (
                            <> | Bathrooms: <span className="font-semibold text-foreground">{property.bathrooms}</span></>
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          Listed: <span className="font-semibold text-foreground">
                            {new Date(property.listing_date).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}