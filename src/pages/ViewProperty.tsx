import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MapPin, Home, Bed, Bath, Square, Calendar, DollarSign, Building, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ViewProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_types(name)
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
          <div className="text-lg">Loading property...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !property) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Property not found</div>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'sold': return 'bg-warning text-warning-foreground';
      case 'rented': return 'bg-destructive text-destructive-foreground';
      case 'under_construction': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
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
          <div className="flex items-center gap-4">
            <Link to="/inventory">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inventory
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <p className="text-muted-foreground mt-1">Property Details</p>
            </div>
          </div>
          <Button onClick={() => navigate(`/properties/edit/${property.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Property
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Property Information</CardTitle>
                  <Badge className={getStatusColor(property.status)}>
                    {formatStatus(property.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{property.address}</p>
                      <p className="text-sm text-muted-foreground">{property.city}, {property.state} {property.zip_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-medium">{property.property_types?.name || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <Bed className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-semibold">{property.bedrooms || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <Bath className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-semibold">{property.bathrooms || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <Square className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Square Feet</p>
                    <p className="font-semibold">{property.square_feet || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="font-semibold">{property.year_built || 'N/A'}</p>
                  </div>
                </div>

                {property.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{property.description}</p>
                  </div>
                )}

                {property.features && property.features.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-3xl font-bold text-success">{formatCurrency(property.price)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Agent Information - Placeholder for now */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">Agent Information</p>
                  <p className="text-sm text-muted-foreground">Contact details will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lot Size</span>
                  <span className="text-sm font-medium">{property.lot_size ? `${property.lot_size} sq ft` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Listed Date</span>
                  <span className="text-sm font-medium">
                    {new Date(property.listing_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">
                    {new Date(property.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}