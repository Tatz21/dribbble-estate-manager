import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  square_feet: z.number().optional(),
  lot_size: z.number().optional(),
  year_built: z.number().optional(),
  property_type_id: z.string().optional(),
  status: z.string(),
  description: z.string().optional(),
  listing_date: z.string(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      status: 'available',
      listing_date: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch property data
  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch property types
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

  // Populate form with property data
  useEffect(() => {
    if (property) {
      form.reset({
        title: property.title,
        address: property.address,
        city: property.city,
        state: property.state,
        zip_code: property.zip_code || '',
        price: property.price,
        bedrooms: property.bedrooms || undefined,
        bathrooms: property.bathrooms || undefined,
        square_feet: property.square_feet || undefined,
        lot_size: property.lot_size || undefined,
        year_built: property.year_built || undefined,
        property_type_id: property.property_type_id || '',
        status: property.status,
        description: property.description || '',
        listing_date: property.listing_date,
      });
    }
  }, [property, form]);

  const updateProperty = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const { error } = await supabase
        .from('properties')
        .update({
          title: data.title,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code || null,
          price: data.price,
          bedrooms: data.bedrooms || null,
          bathrooms: data.bathrooms || null,
          square_feet: data.square_feet || null,
          lot_size: data.lot_size || null,
          year_built: data.year_built || null,
          property_type_id: data.property_type_id || null,
          status: data.status,
          description: data.description || null,
          listing_date: data.listing_date,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      navigate(`/properties/${id}`);
    },
    onError: (error) => {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    updateProperty.mutate(data);
  };

  if (propertyLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading property...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Property not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={`/properties/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Property
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Property</h1>
            <p className="text-muted-foreground mt-1">Update property information</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter property title"
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"
                    {...form.register('price', { valueAsNumber: true })}
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type_id">Property Type</Label>
                  <Select
                    value={form.watch('property_type_id')}
                    onValueChange={(value) => form.setValue('property_type_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value) => form.setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="under_construction">Under Construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="listing_date">Listing Date</Label>
                  <Input
                    id="listing_date"
                    type="date"
                    {...form.register('listing_date')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Enter property address"
                    {...form.register('address')}
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      {...form.register('city')}
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      {...form.register('state')}
                    />
                    {form.formState.errors.state && (
                      <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    placeholder="Enter ZIP code"
                    {...form.register('zip_code')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      placeholder="Number of bedrooms"
                      {...form.register('bedrooms', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      step="0.5"
                      placeholder="Number of bathrooms"
                      {...form.register('bathrooms', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="square_feet">Square Feet</Label>
                    <Input
                      id="square_feet"
                      type="number"
                      placeholder="Property size in sq ft"
                      {...form.register('square_feet', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lot_size">Lot Size</Label>
                    <Input
                      id="lot_size"
                      type="number"
                      placeholder="Lot size in sq ft"
                      {...form.register('lot_size', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year_built">Year Built</Label>
                  <Input
                    id="year_built"
                    type="number"
                    placeholder="Year the property was built"
                    {...form.register('year_built', { valueAsNumber: true })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="description">Property Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter property description"
                    className="min-h-32"
                    {...form.register('description')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={updateProperty.isPending}
            >
              {updateProperty.isPending ? 'Updating...' : 'Update Property'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/properties/${id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}