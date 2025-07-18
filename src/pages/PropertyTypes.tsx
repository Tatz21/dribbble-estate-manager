import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Home, Building, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const PropertyTypes = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const propertyTypes = [
    { id: 1, name: 'Residential House', description: 'Single family homes, condos, townhouses', count: 125, icon: Home },
    { id: 2, name: 'Commercial Building', description: 'Office buildings, retail spaces, warehouses', count: 45, icon: Building },
    { id: 3, name: 'Land/Lot', description: 'Vacant land, building lots, agricultural land', count: 78, icon: MapPin },
    { id: 4, name: 'Multi-Family', description: 'Duplexes, apartment buildings, condominiums', count: 32, icon: Building },
    { id: 5, name: 'Industrial', description: 'Manufacturing facilities, storage units', count: 15, icon: Building },
    { id: 6, name: 'Mixed Use', description: 'Combined residential and commercial properties', count: 8, icon: Building },
  ];

  const filteredTypes = propertyTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Property Types</h1>
            <p className="text-muted-foreground">Manage and categorize your property types</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property Type
          </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTypes.map((type) => {
            const IconComponent = type.icon;
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
                          {type.count} properties
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
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