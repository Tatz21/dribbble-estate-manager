import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, FileText, Download, Eye, Edit, Trash2, Upload, Calendar, User } from 'lucide-react';

// Mock data
const documents = [
  {
    id: 1,
    name: "Sale Agreement - Skyline Residences",
    type: "Sale Agreement",
    property: "Skyline Residences - Unit 304",
    client: "Rajesh Kumar",
    uploadDate: "2024-01-15",
    status: "Approved",
    size: "2.4 MB",
    format: "PDF"
  },
  {
    id: 2,
    name: "RERA Certificate - Corporate Plaza",
    type: "RERA Certificate",
    property: "Corporate Plaza - Office 205",
    client: "ABC Corporation",
    uploadDate: "2024-01-14",
    status: "Pending Review",
    size: "1.8 MB",
    format: "PDF"
  },
  {
    id: 3,
    name: "Property Registration - Green Valley",
    type: "Property Registration",
    property: "Green Valley Villas - Villa 12",
    client: "Priya Sharma",
    uploadDate: "2024-01-13",
    status: "Approved",
    size: "3.2 MB",
    format: "PDF"
  },
  {
    id: 4,
    name: "NOC Document - Sunrise Apartments",
    type: "NOC",
    property: "Sunrise Apartments - Unit 101",
    client: "Amit Singh",
    uploadDate: "2024-01-12",
    status: "Rejected",
    size: "1.5 MB",
    format: "PDF"
  },
  {
    id: 5,
    name: "Lease Agreement - Metro Mall",
    type: "Lease Agreement",
    property: "Metro Mall - Shop 45",
    client: "Fashion Hub Pvt Ltd",
    uploadDate: "2024-01-11",
    status: "Approved",
    size: "2.1 MB",
    format: "PDF"
  }
];

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || doc.type === selectedType;
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success';
      case 'Pending Review': return 'bg-warning';
      case 'Rejected': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage all property-related documents and legal papers
            </p>
          </div>
          
          <Button className="btn-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold text-foreground">156</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-success">124</p>
                </div>
                <div className="w-2 h-2 bg-success rounded-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">28</p>
                </div>
                <div className="w-2 h-2 bg-warning rounded-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-destructive">4</p>
                </div>
                <div className="w-2 h-2 bg-destructive rounded-full" />
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
                  placeholder="Search documents..."
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
                <option value="Sale Agreement">Sale Agreement</option>
                <option value="RERA Certificate">RERA Certificate</option>
                <option value="Property Registration">Property Registration</option>
                <option value="NOC">NOC</option>
                <option value="Lease Agreement">Lease Agreement</option>
              </select>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Rejected">Rejected</option>
              </select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{doc.name}</h3>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Property:</span>
                          <span>{doc.property}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{doc.client}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <Badge variant="secondary">{doc.type}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{doc.size} • {doc.format}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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