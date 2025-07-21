import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateLead } from '@/hooks/useSupabaseQuery';
import { useToast } from '@/hooks/use-toast';
import { useAgents } from '@/hooks/useSupabaseQuery';
import { useProperties } from '@/hooks/useSupabaseQuery';

const addLeadSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
  status: z.string().min(1, 'Status is required'),
  interest_type: z.string().optional(),
  budget: z.number().optional(),
  notes: z.string().optional(),
  assigned_agent_id: z.string().optional(),
  property_id: z.string().optional(),
});

type AddLeadFormData = z.infer<typeof addLeadSchema>;

export default function AddLead() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createLead = useCreateLead();
  const { data: agents = [] } = useAgents();
  const { data: properties = [] } = useProperties();

  const form = useForm<AddLeadFormData>({
    resolver: zodResolver(addLeadSchema),
    defaultValues: {
      source: 'website',
      status: 'new',
    },
  });

  const onSubmit = async (data: AddLeadFormData) => {
    try {
      // Convert budget to number if provided
      const leadData = {
        ...data,
        budget: data.budget ? Number(data.budget) : null,
        email: data.email || null,
        phone: data.phone || null,
        interest_type: data.interest_type || null,
        notes: data.notes || null,
        assigned_agent_id: data.assigned_agent_id || null,
        property_id: data.property_id || null,
      };

      await createLead.mutateAsync(leadData);
      
      toast({
        title: "Success!",
        description: "Lead created successfully.",
      });
      
      navigate('/leads');
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/leads">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Lead</h1>
            <p className="text-muted-foreground mt-1">
              Create a new lead in your pipeline
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2">
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Lead Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        placeholder="Enter full name"
                        {...form.register('full_name')}
                      />
                      {form.formState.errors.full_name && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        {...form.register('email')}
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="Enter phone number"
                        {...form.register('phone')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source">Source *</Label>
                      <Select 
                        onValueChange={(value) => form.setValue('source', value)}
                        defaultValue="website"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="advertisement">Advertisement</SelectItem>
                          <SelectItem value="cold_call">Cold Call</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select 
                        onValueChange={(value) => form.setValue('status', value)}
                        defaultValue="new"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interest_type">Interest Type</Label>
                      <Select onValueChange={(value) => form.setValue('interest_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interest type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buying">Buying</SelectItem>
                          <SelectItem value="selling">Selling</SelectItem>
                          <SelectItem value="renting">Renting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (₹)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="Enter budget amount"
                        {...form.register('budget', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional information about the lead..."
                      rows={3}
                      {...form.register('notes')}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assignment & Property */}
            <div className="space-y-6">
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle>Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assigned_agent_id">Assign to Agent</Label>
                    <Select onValueChange={(value) => form.setValue('assigned_agent_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property_id">Link to Property</Label>
                    <Select onValueChange={(value) => form.setValue('property_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.title} - ₹{(property.price / 10000000).toFixed(1)} Cr
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="btn-gradient"
                  disabled={createLead.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createLead.isPending ? 'Creating...' : 'Create Lead'}
                </Button>
                <Link to="/leads">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}