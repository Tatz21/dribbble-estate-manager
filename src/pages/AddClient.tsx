import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateClient, useProfile } from '@/hooks/useSupabaseQuery';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AddClient = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const createClient = useCreateClient();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    client_type: '',
    budget_min: '',
    budget_max: '',
    address: '',
    notes: '',
    preferred_locations: []
  });

  const [locationInput, setLocationInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateBudget = (value: string): boolean => {
    if (!value) return true; // Empty is allowed
    const numValue = parseFloat(value);
    // Database limit is 10^10 (10 billion), so we limit to 9.99 billion for safety
    return numValue <= 9999999999;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to add a client.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate budget values
    if (formData.budget_min && !validateBudget(formData.budget_min)) {
      toast({
        title: "Invalid Budget",
        description: "Minimum budget cannot exceed ₹999 crores (9.99 billion).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.budget_max && !validateBudget(formData.budget_max)) {
      toast({
        title: "Invalid Budget",
        description: "Maximum budget cannot exceed ₹999 crores (9.99 billion).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate that min budget is less than max budget
    if (formData.budget_min && formData.budget_max) {
      const minBudget = parseFloat(formData.budget_min);
      const maxBudget = parseFloat(formData.budget_max);
      if (minBudget > maxBudget) {
        toast({
          title: "Invalid Budget Range",
          description: "Minimum budget cannot be greater than maximum budget.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      const clientData = {
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        client_type: formData.client_type,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        address: formData.address || null,
        notes: formData.notes || null,
        preferred_locations: formData.preferred_locations,
        agent_id: profile.id
      };

      await createClient.mutateAsync(clientData);
      
      toast({
        title: "Client added successfully",
        description: "The client has been added to your database.",
      });
      
      navigate('/clients');
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLocation = () => {
    if (locationInput.trim() && !formData.preferred_locations.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, locationInput.trim()]
      }));
      setLocationInput('');
    }
  };

  const removeLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/clients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add New Client</h1>
            <p className="text-muted-foreground">Create a new client profile</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Enter the client's details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Enter client's full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="client@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_type">Client Type *</Label>
                  <Select value={formData.client_type} onValueChange={(value) => setFormData({...formData, client_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="landlord">Landlord</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_min">Minimum Budget (₹)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({...formData, budget_min: e.target.value})}
                    placeholder="5000000"
                    max="9999999999"
                    step="1000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum limit: ₹999 crores (9.99 billion)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_max">Maximum Budget (₹)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({...formData, budget_max: e.target.value})}
                    placeholder="10000000"
                    max="9999999999"
                    step="1000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum limit: ₹999 crores (9.99 billion)
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Client's current address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferred_locations">Preferred Locations</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add location (e.g., Bandra, Worli)"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                  />
                  <Button type="button" onClick={addLocation}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.preferred_locations.map((location, index) => (
                    <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {location}
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional information about the client"
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Link to="/clients">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting || !formData.full_name || !formData.client_type}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Adding Client...' : 'Add Client'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddClient;