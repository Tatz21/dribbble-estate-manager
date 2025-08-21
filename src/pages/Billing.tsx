import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Filter, CreditCard, TrendingUp, DollarSign, Clock, Eye, Download, Edit, Trash2, Calendar, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useSupabaseQuery';

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const [invoiceForm, setInvoiceForm] = useState({
    property_id: '',
    client_id: '',
    amount: '',
    commission_rate: '10',
    due_date: '',
    description: '',
    notes: ''
  });

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          property:properties(title, address, city),
          client:clients(full_name, email, phone),
          agent:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery({
    queryKey: ['properties-for-billing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, address, city')
        .eq('status', 'available')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-for-billing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, email')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Generate invoice number
  const generateInvoiceNumber = async () => {
    const { data, error } = await supabase.rpc('generate_invoice_number');
    if (error) throw error;
    return data;
  };

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async (invoiceData: any) => {
      const invoiceNumber = await generateInvoiceNumber();
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
          agent_id: profile?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Invoice created",
        description: "The invoice has been successfully created.",
      });
    },
    onError: (error) => {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update invoice mutation
  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...invoiceData }: any) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setEditDialogOpen(false);
      setSelectedInvoice(null);
      resetForm();
      toast({
        title: "Invoice updated",
        description: "The invoice has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete invoice mutation
  const deleteInvoice = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice.",
        variant: "destructive",
      });
    }
  });

  // Mark as paid mutation
  const markAsPaid = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid', 
          paid_date: new Date().toISOString().split('T')[0] 
        })
        .eq('id', invoiceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Payment recorded",
        description: "The invoice has been marked as paid.",
      });
    }
  });

  const resetForm = () => {
    setInvoiceForm({
      property_id: '',
      client_id: '',
      amount: '',
      commission_rate: '10',
      due_date: '',
      description: '',
      notes: ''
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to create invoices.",
        variant: "destructive",
      });
      return;
    }
    
    await createInvoice.mutateAsync({
      property_id: invoiceForm.property_id || null,
      client_id: invoiceForm.client_id || null,
      amount: parseFloat(invoiceForm.amount),
      commission_rate: parseFloat(invoiceForm.commission_rate),
      due_date: invoiceForm.due_date,
      description: invoiceForm.description,
      notes: invoiceForm.notes
    });
  };

  const handleEdit = (invoice: any) => {
    setSelectedInvoice(invoice);
    setInvoiceForm({
      property_id: invoice.property_id || '',
      client_id: invoice.client_id || '',
      amount: invoice.amount.toString(),
      commission_rate: invoice.commission_rate.toString(),
      due_date: invoice.due_date,
      description: invoice.description || '',
      notes: invoice.notes || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    
    await updateInvoice.mutateAsync({
      id: selectedInvoice.id,
      property_id: invoiceForm.property_id || null,
      client_id: invoiceForm.client_id || null,
      amount: parseFloat(invoiceForm.amount),
      commission_rate: parseFloat(invoiceForm.commission_rate),
      due_date: invoiceForm.due_date,
      description: invoiceForm.description,
      notes: invoiceForm.notes
    });
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    await deleteInvoice.mutateAsync(invoiceId);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.property?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'overdue': return 'bg-destructive';
      case 'cancelled': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  // Calculate stats
  const totalAmount = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount?.toString() || '0'), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + parseFloat(invoice.amount?.toString() || '0'), 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, invoice) => sum + parseFloat(invoice.amount?.toString() || '0'), 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, invoice) => sum + parseFloat(invoice.amount?.toString() || '0'), 0);
  const totalCommission = invoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + parseFloat(invoice.commission_amount?.toString() || '0'), 0);

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
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="property_id">Property</Label>
                  <select
                    id="property_id"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={invoiceForm.property_id}
                    onChange={(e) => setInvoiceForm({...invoiceForm, property_id: e.target.value})}
                  >
                    <option value="">Select Property (Optional)</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title} - {property.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="client_id">Client</Label>
                  <select
                    id="client_id"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={invoiceForm.client_id}
                    onChange={(e) => setInvoiceForm({...invoiceForm, client_id: e.target.value})}
                  >
                    <option value="">Select Client (Optional)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.full_name} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="25000.00"
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission_rate">Commission Rate (%) *</Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      step="0.01"
                      placeholder="10.00"
                      value={invoiceForm.commission_rate}
                      onChange={(e) => setInvoiceForm({...invoiceForm, commission_rate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Property sale commission"
                    value={invoiceForm.description}
                    onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createInvoice.isPending} className="flex-1">
                    {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">₹{totalAmount.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-success">₹{paidAmount.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-warning">₹{pendingAmount.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-destructive">₹{overdueAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Commission Earned</p>
                  <p className="text-2xl font-bold text-primary">₹{totalCommission.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
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
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <Button variant="outline" onClick={() => toast({ title: "Coming Soon", description: "Advanced filters will be available soon." })}>
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
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-6 bg-muted rounded w-32"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Invoices Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || selectedStatus ? 'No invoices match your filters.' : 'Start by creating your first invoice.'}
                </p>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                          {invoice.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsPaid.mutate(invoice.id)}
                              disabled={markAsPaid.isPending}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {invoice.client && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{invoice.client.full_name}</span>
                            </div>
                          )}
                          {invoice.property && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-medium">Property:</span>
                              <span>{invoice.property.title}</span>
                            </div>
                          )}
                          {invoice.description && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Description:</span> {invoice.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-semibold text-lg">₹{parseFloat(invoice.amount?.toString() || '0').toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Commission</p>
                          <p className="font-semibold text-primary">₹{parseFloat(invoice.commission_amount?.toString() || '0').toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                        </div>
                        {invoice.paid_date && (
                          <div className="text-sm text-success">
                            Paid: {new Date(invoice.paid_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(invoice)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit_property_id">Property</Label>
                <select
                  id="edit_property_id"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  value={invoiceForm.property_id}
                  onChange={(e) => setInvoiceForm({...invoiceForm, property_id: e.target.value})}
                >
                  <option value="">Select Property (Optional)</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="edit_client_id">Client</Label>
                <select
                  id="edit_client_id"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  value={invoiceForm.client_id}
                  onChange={(e) => setInvoiceForm({...invoiceForm, client_id: e.target.value})}
                >
                  <option value="">Select Client (Optional)</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.full_name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_amount">Amount (₹) *</Label>
                  <Input
                    id="edit_amount"
                    type="number"
                    step="0.01"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_commission_rate">Commission Rate (%) *</Label>
                  <Input
                    id="edit_commission_rate"
                    type="number"
                    step="0.01"
                    value={invoiceForm.commission_rate}
                    onChange={(e) => setInvoiceForm({...invoiceForm, commission_rate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_due_date">Due Date *</Label>
                <Input
                  id="edit_due_date"
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Input
                  id="edit_description"
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateInvoice.isPending} className="flex-1">
                  {updateInvoice.isPending ? 'Updating...' : 'Update Invoice'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}