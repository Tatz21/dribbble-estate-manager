import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Calendar, Clock, MapPin, User, Phone, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const meetings = [
  {
    id: 1,
    title: "Site Visit - Bandra Apartment",
    type: "Site Visit",
    client: "John Smith",
    agent: "Priya Sharma",
    date: "2024-01-15",
    time: "10:00 AM",
    location: "Bandra West, Mumbai",
    status: "Scheduled",
    priority: "High"
  },
  {
    id: 2,
    title: "Project Discussion",
    type: "Meeting",
    client: "Tech Corp Ltd",
    agent: "Raj Patel",
    date: "2024-01-15",
    time: "2:00 PM",
    location: "Office",
    status: "Confirmed",
    priority: "Medium"
  },
  {
    id: 3,
    title: "Property Viewing Call",
    type: "Phone Call",
    client: "Sarah Johnson",
    agent: "Amit Kumar",
    date: "2024-01-16",
    time: "11:30 AM",
    location: "Virtual",
    status: "Pending",
    priority: "Low"
  },
];

export default function Meetings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || meeting.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meetings & Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Manage your meetings, site visits, and client appointments
            </p>
          </div>
          
          <Link to="/meetings/schedule">
            <Button className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search meetings..."
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
                <option value="Site Visit">Site Visit</option>
                <option value="Meeting">Meeting</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Video Call">Video Call</option>
              </select>
              
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Meeting List */}
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{meeting.title}</h3>
                      <Badge variant="outline">{meeting.type}</Badge>
                      <Badge 
                        className={
                          meeting.priority === 'High' ? 'bg-destructive' :
                          meeting.priority === 'Medium' ? 'bg-warning' :
                          'bg-muted'
                        }
                      >
                        {meeting.priority}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {meeting.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {meeting.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {meeting.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {meeting.client}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span>Agent:</span>
                      <span className="font-medium">{meeting.agent}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        meeting.status === 'Confirmed' ? 'bg-success' :
                        meeting.status === 'Scheduled' ? 'bg-primary' :
                        'bg-warning'
                      }
                    >
                      {meeting.status}
                    </Badge>
                    
                    <div className="flex gap-1">
                      {meeting.type === 'Phone Call' && (
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      {meeting.type === 'Video Call' && (
                        <Button size="sm" variant="outline">
                          <Video className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}