import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, CreditCard, TrendingUp, DollarSign, Clock, Eye, Download, Edit, Trash2, Calendar, User } from 'lucide-react';

// Mock data
const invoices = [
  {
    id: 1,
    invoiceNumber: "INV-2024-001",
    client: "Rajesh Kumar",
    property: "Skyline Residences - Unit 304",
    amount: "₹2,50,000",
    commission: "₹25,000",
    status: "Paid",
    dueDate: "2024-01-15",
    paidDate: "2024-01-12",
    agent: "Priya Sharma"
  },
  {
    id: 2,
    invoiceNumber: "INV-2024-002",
    client: "ABC Corporation",
    property: "Corporate Plaza - Office 205",
    amount: "₹5,00,000",
    commission: "₹50,000",
    status: "Pending",
    dueDate: "2024-01-20",
    paidDate: null,
    agent: "Amit Singh"
  },
  {
    id: 3,
    invoiceNumber: "INV-2024-003",
    client: "Fashion Hub Pvt Ltd",
    property: "Metro Mall - Shop 45",
    amount: "₹3,00,000",
    commission: "₹30,000",
    status: "Overdue",
    dueDate: "2024-01-10",
    paidDate: null,
    agent: "Rajesh Kumar"
  },
  {
    id: 4,
    invoiceNumber: "INV-2024-004",
    client: "Green Homes Ltd",
    property: "Green Valley Villas - Villa 12",
    amount: "₹1,80,000",
    commission: "₹18,000",
    status: "Paid",
    dueDate: "2024-01-18",
    paidDate: "2024-01-16",
    agent: "Priya Sharma"
  }
];

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-success';
      case 'Pending': return 'bg-warning';
      case 'Overdue': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const totalAmount = invoices.reduce((sum, invoice) => sum + parseInt(invoice.amount.replace(/[₹,]/g, '')), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'Paid').reduce((sum, invoice) => sum + parseInt(invoice.amount.replace(/[₹,]/g, '')), 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'Pending').reduce((sum, invoice) => sum + parseInt(invoice.amount.replace(/[₹,]/g, '')), 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, invoice) => sum + parseInt(invoice.amount.replace(/[₹,]/g, '')), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing & Invoices</h1>
            <p className="text-muted-foreground mt-1">
              Manage invoices, commissions, and payment tracking
            </p>
          </div>
          
          <Button className="btn-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">₹{(totalAmount / 100000).toFixed(1)}L</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold text-success">₹{(paidAmount / 100000).toFixed(1)}L</p>
                </div>
                <CreditCard className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">₹{(pendingAmount / 100000).toFixed(1)}L</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-destructive">₹{(overdueAmount / 100000).toFixed(1)}L</p>
                </div>
                <DollarSign className="h-8 w-8 text-destructive" />
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
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{invoice.client}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Property:</span>
                          <span>{invoice.property}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">Agent:</span>
                          <span>{invoice.agent}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-semibold text-lg">{invoice.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Commission</p>
                        <p className="font-semibold text-primary">{invoice.commission}</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {invoice.dueDate}</span>
                      </div>
                      {invoice.paidDate && (
                        <div className="text-sm text-success">
                          Paid: {invoice.paidDate}
                        </div>
                      )}
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}