import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Filter, FileText, Download, Eye, Edit, Trash2, Upload, Calendar, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useSupabaseQuery';

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const [uploadForm, setUploadForm] = useState({
    title: '',
    document_type: '',
    description: '',
    property_id: '',
    client_id: '',
    file: null as File | null
  });

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          property:properties(title),
          client:clients(full_name),
          agent:profiles(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Upload document mutation
  const uploadDocument = useMutation({
    mutationFn: async (documentData: any) => {
      let fileUrl = null;
      
      if (uploadForm.file) {
        const fileExt = uploadForm.file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, uploadForm.file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        fileUrl = data.publicUrl;
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...documentData,
          file_url: fileUrl
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setUploadDialogOpen(false);
      setUploadForm({
        title: '',
        document_type: '',
        description: '',
        property_id: '',
        client_id: '',
        file: null
      });
      toast({
        title: "Document uploaded",
        description: "The document has been successfully uploaded.",
      });
    },
    onError: (error) => {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete document mutation
  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    }
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to upload documents.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      await uploadDocument.mutateAsync({
        title: uploadForm.title,
        document_type: uploadForm.document_type,
        description: uploadForm.description,
        property_id: uploadForm.property_id || null,
        client_id: uploadForm.client_id || null,
        agent_id: profile.id // Use profile ID instead of user ID
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    await deleteDocument.mutateAsync(documentId);
  };

  const handleDownload = (fileUrl: string, title: string) => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || doc.document_type === selectedType;
    return matchesSearch && matchesType;
  });

  // Calculate stats
  const totalDocuments = documents.length;
  const approvedDocs = documents.filter(doc => doc.document_type?.includes('Agreement') || doc.document_type?.includes('Certificate')).length;
  const pendingDocs = documents.filter(doc => doc.document_type?.includes('NOC')).length;
  const rejectedDocs = 0; // This would depend on your status field if you have one

  const documentTypes = [...new Set(documents.map(doc => doc.document_type).filter(Boolean))];

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
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Sale Agreement - Property XYZ"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="document_type">Document Type *</Label>
                  <select
                    id="document_type"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={uploadForm.document_type}
                    onChange={(e) => setUploadForm({...uploadForm, document_type: e.target.value})}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Sale Agreement">Sale Agreement</option>
                    <option value="Lease Agreement">Lease Agreement</option>
                    <option value="Property Registration">Property Registration</option>
                    <option value="RERA Certificate">RERA Certificate</option>
                    <option value="NOC">NOC</option>
                    <option value="Legal Document">Legal Document</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="property_id">Related Property</Label>
                  <select
                    id="property_id"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={uploadForm.property_id}
                    onChange={(e) => setUploadForm({...uploadForm, property_id: e.target.value})}
                  >
                    <option value="">Select Property (Optional)</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>{property.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="client_id">Related Client</Label>
                  <select
                    id="client_id"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={uploadForm.client_id}
                    onChange={(e) => setUploadForm({...uploadForm, client_id: e.target.value})}
                  >
                    <option value="">Select Client (Optional)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the document"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="file">Document File *</Label>
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading} className="flex-1">
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold text-foreground">{totalDocuments}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Agreements</p>
                  <p className="text-2xl font-bold text-success">{approvedDocs}</p>
                </div>
                <div className="w-2 h-2 bg-success rounded-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Legal Docs</p>
                  <p className="text-2xl font-bold text-warning">{pendingDocs}</p>
                </div>
                <div className="w-2 h-2 bg-warning rounded-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Other</p>
                  <p className="text-2xl font-bold text-primary">{totalDocuments - approvedDocs - pendingDocs}</p>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full" />
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
                {documentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
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
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-5 w-5 bg-muted rounded"></div>
                      <div className="h-6 bg-muted rounded w-1/3"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Documents Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || selectedType ? 'No documents match your filters.' : 'Start by uploading your first document.'}
                </p>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-gradient">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">{doc.title}</h3>
                          <Badge variant="secondary">
                            {doc.document_type}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {doc.property && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-medium">Property:</span>
                              <span>{doc.property.title}</span>
                            </div>
                          )}
                          {doc.client && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{doc.client.full_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground mt-2">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {doc.file_url && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(doc.file_url, doc.title)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
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
      </div>
    </DashboardLayout>
  );
}