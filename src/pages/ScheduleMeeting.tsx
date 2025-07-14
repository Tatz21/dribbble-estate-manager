import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function ScheduleMeeting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    client: '',
    agent: '',
    date: '',
    time: '',
    location: '',
    description: '',
    priority: 'Medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Meeting data:', formData);
    
    toast({
      title: "Meeting scheduled successfully",
      description: "The meeting has been added to your calendar.",
    });
    
    navigate('/meetings');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/meetings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meetings
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Schedule Meeting</h1>
            <p className="text-muted-foreground mt-1">
              Create a new meeting or appointment
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Details */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Meeting Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Site Visit - Bandra Apartment"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Meeting Type *</Label>
                  <select
                    id="type"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Video Call">Video Call</option>
                    <option value="Property Viewing">Property Viewing</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="client">Client *</Label>
                  <select
                    id="client"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                    required
                  >
                    <option value="">Select Client</option>
                    <option value="John Smith">John Smith</option>
                    <option value="Sarah Johnson">Sarah Johnson</option>
                    <option value="Tech Corp Ltd">Tech Corp Ltd</option>
                    <option value="Real Estate Builders">Real Estate Builders</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="agent">Assigned Agent *</Label>
                  <select
                    id="agent"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.agent}
                    onChange={(e) => setFormData({...formData, agent: e.target.value})}
                    required
                  >
                    <option value="">Select Agent</option>
                    <option value="Priya Sharma">Priya Sharma</option>
                    <option value="Raj Patel">Raj Patel</option>
                    <option value="Amit Kumar">Amit Kumar</option>
                    <option value="Neha Singh">Neha Singh</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="location">Meeting Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Office, Property Address, or Virtual"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional notes or agenda for the meeting"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Link to="/meetings">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="btn-gradient">
              Schedule Meeting
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}