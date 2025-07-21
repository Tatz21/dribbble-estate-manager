import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Briefcase, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateAgent } from '@/hooks/useSupabaseQuery';
import { useToast } from '@/hooks/use-toast';

export default function AddAgent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createAgent = useCreateAgent();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    specialization: [],
    address: '',
    experience: '',
    qualifications: '',
    notes: ''
  });

  const [specializationInput, setSpecializationInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const agentData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role,
        specialization: formData.specialization,
        address: formData.address || null,
        experience: formData.experience ? parseInt(formData.experience) : null,
        qualifications: formData.qualifications || null,
        notes: formData.notes || null,
        status: 'active'
      };

      await createAgent.mutateAsync(agentData);
      
      toast({
        title: "Agent added successfully",
        description: "The new team member has been added to your organization.",
      });
      
      navigate('/agents');
    } catch (error) {
      console.error('Error adding agent:', error);
      toast({
        title: "Error",
        description: "Failed to add agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSpecialization = () => {
    if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, specializationInput.trim()]
      }));
      setSpecializationInput('');
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter((_, i) => i !== index)
    }));
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
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="Enter full name"
                    value={formData.full_name}
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
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add specialization (e.g., Residential, Commercial)"
                      value={specializationInput}
                      onChange={(e) => setSpecializationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                    />
                    <Button type="button" onClick={addSpecialization}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specialization.map((spec, index) => (
                      <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {spec}
                        <button
                          type="button"
                          onClick={() => removeSpecialization(index)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
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
            <Button type="submit" className="btn-gradient" disabled={isSubmitting || !formData.full_name || !formData.email || !formData.role}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Adding Agent...' : 'Save Agent'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}