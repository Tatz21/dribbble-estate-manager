import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, MapPin, Bed, Bath, Square, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const properties = [
  {
    id: 1,
    title: "Luxury 3BHK in Bandra West",
    type: "Apartment",
    price: "₹2.5 Cr",
    location: "Bandra West, Mumbai",
    bedrooms: 3,
    bathrooms: 2,
    area: "1200 sq ft",
    status: "Available",
    image: "/placeholder.svg",
    tags: ["Hot Deal", "RERA Approved"]
  },
  {
    id: 2,
    title: "Commercial Space in BKC",
    type: "Commercial",
    price: "₹5.0 Cr",
    location: "BKC, Mumbai",
    bedrooms: 0,
    bathrooms: 1,
    area: "2000 sq ft",
    status: "Under Negotiation",
    image: "/placeholder.svg",
    tags: ["Prime Location"]
  },
  {
    id: 3,
    title: "2BHK Sea View Apartment",
    type: "Apartment",
    price: "₹1.8 Cr",
    location: "Worli, Mumbai",
    bedrooms: 2,
    bathrooms: 2,
    area: "950 sq ft",
    status: "Sold",
    image: "/placeholder.svg",
    tags: ["Sea View", "Recently Sold"]
  },
];

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || property.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Properties</h1>
            <p className="text-muted-foreground mt-1">
              Manage your property listings and inventory
            </p>
          </div>
          
          <Link to="/properties/add">
            <Button className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
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
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
              </select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="card-modern overflow-hidden group">
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 space-y-1">
                  {property.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Badge 
                  className={`absolute top-3 right-3 ${
                    property.status === 'Available' ? 'bg-success' :
                    property.status === 'Sold' ? 'bg-destructive' :
                    'bg-warning'
                  }`}
                >
                  {property.status}
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{property.title}</CardTitle>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">{property.price}</span>
                  <span className="text-sm text-muted-foreground">{property.type}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </div>
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    {property.area}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}