import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddClient = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    budget: '',
    preferences: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend
    console.log('Form submitted:', formData);
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter client's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Client Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
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
                  <Label htmlFor="budget">Budget Range</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    placeholder="$500,000 - $750,000"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferences">Preferences</Label>
                <Textarea
                  id="preferences"
                  value={formData.preferences}
                  onChange={(e) => handleChange('preferences', e.target.value)}
                  placeholder="Location preferences, property type, amenities, etc."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional information about the client"
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Link to="/clients">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Add Client
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