import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Phone, Mail, MapPin, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const clients = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+91 9876543210",
    type: "Buyer",
    status: "Hot",
    location: "Mumbai",
    budget: "₹2-3 Cr",
    preferences: "3BHK, Bandra/Worli",
    agent: "Priya Sharma",
    lastContact: "2024-01-10",
    properties: 5
  },
  {
    id: 2,
    name: "Tech Corp Ltd",
    email: "contact@techcorp.com",
    phone: "+91 9876543211",
    type: "Commercial Buyer",
    status: "Warm",
    location: "BKC, Mumbai",
    budget: "₹5-10 Cr",
    preferences: "Office Space, IT Park",
    agent: "Raj Patel",
    lastContact: "2024-01-08",
    properties: 3
  },
  {
    id: 3,
    name: "Sarah Johnson",
    email: "sarah@email.com",
    phone: "+91 9876543212",
    type: "Tenant",
    status: "Cold",
    location: "Pune",
    budget: "₹50K-80K/month",
    preferences: "2BHK, Furnished",
    agent: "Amit Kumar",
    lastContact: "2024-01-05",
    properties: 2
  },
];

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || client.type === selectedType;
    const matchesStatus = !selectedStatus || client.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
          
          <Link to="/clients/add">
            <Button className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
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
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
                <option value="Tenant">Tenant</option>
                <option value="Landlord">Landlord</option>
                <option value="Commercial Buyer">Commercial Buyer</option>
              </select>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="card-modern">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{client.type}</p>
                  </div>
                  <Badge 
                    className={
                      client.status === 'Hot' ? 'bg-destructive' :
                      client.status === 'Warm' ? 'bg-warning' :
                      'bg-muted'
                    }
                  >
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {client.location}
                  </div>
                </div>
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">{client.budget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Agent:</span>
                    <span className="font-medium">{client.agent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Properties:</span>
                    <span className="font-medium">{client.properties} shown</span>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-1">Preferences:</p>
                  <p className="text-sm">{client.preferences}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Last contact: {client.lastContact}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}