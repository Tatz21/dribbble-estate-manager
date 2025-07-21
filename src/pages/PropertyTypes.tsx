import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Home, Building, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePropertyTypes } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const PropertyTypes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  const { data: propertyTypes = [], isLoading } = usePropertyTypes();
  const { toast } = useToast();

  // Fetch property counts for each type
  const { data: propertyCounts = {} } = useQuery({
    queryKey: ['property-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('property_type_id')
        .not('property_type_id', 'is', null);
      
      if (error) throw error;
      
      // Count properties by type
      const counts = {};
      data.forEach(property => {
        if (property.property_type_id) {
          counts[property.property_type_id] = (counts[property.property_type_id] || 0) + 1;
        }
      });
      
      return counts;
    }
  });

  const iconMap = {
    'Residential': Home,
    'Commercial': Building,
    'Land': MapPin,
    'Industrial': Building,
    'Mixed Use': Building,
  };

  const getIcon = (typeName) => {
    const key = Object.keys(iconMap).find(k => typeName.toLowerCase().includes(k.toLowerCase()));
    return iconMap[key] || Building;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingType) {
        const { error } = await supabase
          .from('property_types')
          .update(formData)
          .eq('id', editingType.id);
        
        if (error) throw error;
        
        toast({
          title: "Property type updated",
          description: "The property type has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from('property_types')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Property type added",
          description: "The property type has been successfully added.",
        });
      }
      
      setFormData({ name: '', description: '' });
      setEditingType(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingType ? 'update' : 'add'} property type.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (typeId) => {
    if (!confirm('Are you sure you want to delete this property type?')) return;
    
    try {
      const { error } = await supabase
        .from('property_types')
        .delete()
        .eq('id', typeId);
      
      if (error) throw error;
      
      toast({
        title: "Property type deleted",
        description: "The property type has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property type.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({ name: type.name, description: type.description });
    setIsAddDialogOpen(true);
  };

  const filteredTypes = propertyTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Property Types</h1>
            <p className="text-muted-foreground">Manage and categorize your property types</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingType(null);
                setFormData({ name: '', description: '' });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingType ? 'Edit Property Type' : 'Add New Property Type'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingType ? 'Update' : 'Add'} Property Type
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Property Types</CardTitle>
            <CardDescription>Find and manage your property categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search property types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTypes.map((type) => {
              const IconComponent = getIcon(type.name);
              const propertyCount = propertyCounts[type.id] || 0;
              return (
                <Card key={type.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{type.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(type)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(type.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <Link to="/properties">
            <Button variant="outline">Back to Properties</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PropertyTypes;