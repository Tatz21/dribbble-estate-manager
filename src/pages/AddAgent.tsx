import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AddAgent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    specialization: [],
    address: '',
    experience: '',
    qualifications: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Agent data:', formData);
    // Handle form submission
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/agents">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Agents
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Agent</h1>
            <p className="text-muted-foreground mt-1">Add a new team member to your organization</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <select
                    id="role"
                    name="role"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Senior Agent">Senior Agent</option>
                    <option value="Agent">Agent</option>
                    <option value="Junior Agent">Junior Agent</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    placeholder="Enter years of experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <select
                    id="specialization"
                    name="specialization"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.specialization}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Specialization</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Plots">Plots</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="qualifications">Qualifications</Label>
                <Textarea
                  id="qualifications"
                  name="qualifications"
                  placeholder="Enter qualifications and certifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link to="/agents">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" className="btn-gradient">
              <Save className="h-4 w-4 mr-2" />
              Save Agent
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}