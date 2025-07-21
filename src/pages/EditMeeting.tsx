import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useClients, useAgents, useProperties } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export default function EditMeeting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: clients = [] } = useClients();
  const { data: agents = [] } = useAgents();
  const { data: properties = [] } = useProperties();
  
  const [loading, setLoading] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    meeting_type: '',
    client_id: '',
    agent_id: '',
    property_id: '',
    meeting_date: '',
    duration_minutes: 60,
    location: '',
    description: '',
    status: 'scheduled'
  });

  useEffect(() => {
    if (id) {
      fetchMeeting();
    }
  }, [id]);

  const fetchMeeting = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setMeeting(data);
      setFormData({
        title: data.title || '',
        meeting_type: data.meeting_type || '',
        client_id: data.client_id || '',
        agent_id: data.agent_id || '',
        property_id: data.property_id || '',
        meeting_date: data.meeting_date ? new Date(data.meeting_date).toISOString().slice(0, 16) : '',
        duration_minutes: data.duration_minutes || 60,
        location: data.location || '',
        description: data.description || '',
        status: data.status || 'scheduled'
      });
    } catch (error) {
      console.error('Error fetching meeting:', error);
      toast({
        title: "Error",
        description: "Failed to load meeting details.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const meetingDateTime = new Date(formData.meeting_date).toISOString();
      
      const { error } = await supabase
        .from('meetings')
        .update({
          title: formData.title,
          meeting_type: formData.meeting_type,
          client_id: formData.client_id || null,
          agent_id: formData.agent_id || null,
          property_id: formData.property_id || null,
          meeting_date: meetingDateTime,
          duration_minutes: formData.duration_minutes,
          location: formData.location,
          description: formData.description,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Meeting updated",
        description: "Meeting details have been successfully updated.",
      });

      navigate('/meetings');
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to update meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!meeting) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Meeting</h1>
            <p className="text-muted-foreground mt-1">Loading meeting details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="text-3xl font-bold text-foreground">Edit Meeting</h1>
            <p className="text-muted-foreground mt-1">
              Update meeting details and settings
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
                  <Label htmlFor="meeting_type">Meeting Type *</Label>
                  <select
                    id="meeting_type"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.meeting_type}
                    onChange={(e) => setFormData({...formData, meeting_type: e.target.value})}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="showing">Property Showing</option>
                    <option value="consultation">Consultation</option>
                    <option value="phone_call">Phone Call</option>
                    <option value="video_call">Video Call</option>
                    <option value="site_visit">Site Visit</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="client_id">Client</Label>
                  <select
                    id="client_id"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.client_id}
                    onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  >
                    <option value="">Select Client (Optional)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.full_name} {client.email ? `- ${client.email}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="agent_id">Assigned Agent</Label>
                  <select
                    id="agent_id"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.agent_id}
                    onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
                  >
                    <option value="">Select Agent (Optional)</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.full_name} {agent.role ? `- ${agent.role}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="property_id">Related Property (Optional)</Label>
                <select
                  id="property_id"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  value={formData.property_id}
                  onChange={(e) => setFormData({...formData, property_id: e.target.value})}
                >
                  <option value="">Select Property (Optional)</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.address}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Schedule & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="meeting_date">Date & Time *</Label>
                  <Input
                    id="meeting_date"
                    type="datetime-local"
                    value={formData.meeting_date}
                    onChange={(e) => setFormData({...formData, meeting_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 60})}
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Description */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Meeting Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Office, Property Address, or Virtual"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              
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
            <Button type="submit" disabled={loading} className="btn-gradient">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Update Meeting
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}