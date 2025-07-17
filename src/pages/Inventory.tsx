import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Package, TrendingUp, TrendingDown, Eye, Edit, Building, MapPin } from 'lucide-react';

// Mock data
const inventoryData = [
  {
    id: 1,
    project: "Skyline Residences",
    developer: "ABC Developers",
    location: "Bandra West, Mumbai",
    totalUnits: 120,
    availableUnits: 45,
    soldUnits: 65,
    rentedUnits: 10,
    priceRange: "₹2.5 - 4.2 Cr",
    type: "Residential",
    status: "Active",
    completionDate: "2024-12-31"
  },
  {
    id: 2,
    project: "Corporate Plaza",
    developer: "XYZ Infrastructure",
    location: "BKC, Mumbai",
    totalUnits: 80,
    availableUnits: 20,
    soldUnits: 50,
    rentedUnits: 10,
    priceRange: "₹3.0 - 8.5 Cr",
    type: "Commercial",
    status: "Active",
    completionDate: "2024-06-30"
  },
  {
    id: 3,
    project: "Green Valley Villas",
    developer: "Green Homes",
    location: "Lonavala, Maharashtra",
    totalUnits: 60,
    availableUnits: 35,
    soldUnits: 20,
    rentedUnits: 5,
    priceRange: "₹1.2 - 2.8 Cr",
    type: "Villa",
    status: "Under Construction",
    completionDate: "2025-03-31"
  }
];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.developer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || item.type === selectedType;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-success';
      case 'Under Construction': return 'bg-warning';
      case 'Completed': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">
              Track property inventory across all projects
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                  <p className="text-2xl font-bold text-foreground">260</p>
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
                  <p className="text-2xl font-bold text-success">100</p>
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
                  <p className="text-2xl font-bold text-warning">135</p>
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
                  <p className="text-2xl font-bold text-destructive">25</p>
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
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
              </select>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Completed">Completed</option>
              </select>
              
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
            <CardTitle>Project Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInventory.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{item.project}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Building className="h-4 w-4" />
                        <span>{item.developer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-semibold">{item.totalUnits}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Available</p>
                        <p className="font-semibold text-success">{item.availableUnits}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sold</p>
                        <p className="font-semibold text-warning">{item.soldUnits}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rented</p>
                        <p className="font-semibold text-destructive">{item.rentedUnits}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.type}</Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Price Range: <span className="font-semibold text-foreground">{item.priceRange}</span></span>
                      <span className="text-muted-foreground">Completion: <span className="font-semibold text-foreground">{item.completionDate}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}