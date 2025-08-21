import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Calendar, Clock, MapPin, User, Phone, Video, Edit, Trash2, Eye, FileText, Bell, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMeetings } from '@/hooks/useSupabaseQuery';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarView } from '@/components/CalendarView';
import { MeetingNotesDialog } from '@/components/meetings/MeetingNotesDialog';
import { RescheduleMeetingDialog } from '@/components/meetings/RescheduleMeetingDialog';
import { MeetingRemindersDialog } from '@/components/meetings/MeetingRemindersDialog';

export default function Meetings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showRemindersDialog, setShowRemindersDialog] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [selectedMeetingDate, setSelectedMeetingDate] = useState<string>('');
  const { data: meetings = [], isLoading, refetch } = useMeetings();
  const { toast } = useToast();
  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);

      if (error) throw error;

      toast({
        title: "Meeting deleted",
        description: "The meeting has been successfully removed.",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: "Error",
        description: "Failed to delete meeting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (meetingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', meetingId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Meeting status changed to ${newStatus}.`,
      });
      
      refetch();
    } catch (error) {
      console.error('Error updating meeting status:', error);
      toast({
        title: "Error",
        description: "Failed to update meeting status.",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (date: string) => {
    const meetingDate = new Date(date);
    return {
      date: meetingDate.toLocaleDateString(),
      time: meetingDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || meeting.meeting_type === selectedType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meetings & Appointments</h1>
            <p className="text-muted-foreground mt-1">Loading meetings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
                <option value="showing">Property Showing</option>
                <option value="consultation">Consultation</option>
                <option value="phone_call">Phone Call</option>
                <option value="video_call">Video Call</option>
                <option value="site_visit">Site Visit</option>
              </select>
              
              <Button variant="outline" onClick={() => setShowCalendar(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Meeting List */}
        <div className="space-y-4">
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No meetings found</p>
              <p className="text-muted-foreground mb-4">
                {meetings.length === 0 ? "Start by scheduling your first meeting" : "Try adjusting your search filters"}
              </p>
              <Link to="/meetings/schedule">
                <Button className="btn-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </Link>
            </div>
          ) : (
            filteredMeetings.map((meeting) => {
              const { date, time } = formatDateTime(meeting.meeting_date);
              return (
                <Card key={meeting.id} className="card-modern group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{meeting.title}</h3>
                          <Badge variant="outline" className="capitalize">
                            {meeting.meeting_type?.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            className={
                              meeting.status === 'completed' ? 'bg-success' :
                              meeting.status === 'confirmed' ? 'bg-primary' :
                              meeting.status === 'cancelled' ? 'bg-destructive' :
                              'bg-warning'
                            }
                          >
                            {meeting.status?.charAt(0).toUpperCase() + meeting.status?.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {date}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {meeting.location || 'No location'}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {meeting.client?.full_name || 'No client assigned'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <span>Agent:</span>
                          <span className="font-medium">
                            {(meeting.agent as any)?.full_name || 'No agent assigned'}
                          </span>
                        </div>

                        {meeting.description && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p className="line-clamp-2">{meeting.description}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedMeetingId(meeting.id);
                              setShowNotesDialog(true);
                            }}
                            title="Add Notes"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedMeetingId(meeting.id);
                              setSelectedMeetingDate(meeting.meeting_date);
                              setShowRemindersDialog(true);
                            }}
                            title="Set Reminders"
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedMeetingId(meeting.id);
                              setShowRescheduleDialog(true);
                            }}
                            title="Reschedule"
                          >
                            <CalendarDays className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusUpdate(meeting.id, 
                              meeting.status === 'scheduled' ? 'confirmed' : 
                              meeting.status === 'confirmed' ? 'completed' : 'scheduled'
                            )}
                          >
                            {meeting.status === 'scheduled' ? 'Confirm' : 
                             meeting.status === 'confirmed' ? 'Complete' : 'Reopen'}
                          </Button>
                          
                          {meeting.meeting_type === 'phone_call' && meeting.client?.phone && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(`tel:${meeting.client?.phone}`, '_self')}
                              title="Call Client"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                          {meeting.meeting_type === 'video_call' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open('https://meet.google.com/new', '_blank')}
                              title="Start Video Call"
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Link to={`/meetings/edit/${meeting.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Calendar View Modal */}
        {showCalendar && (
          <CalendarView 
            meetings={meetings as any} 
            onClose={() => setShowCalendar(false)} 
          />
        )}

        {/* Meeting Notes Dialog */}
        <MeetingNotesDialog
          meetingId={selectedMeetingId}
          open={showNotesDialog}
          onOpenChange={setShowNotesDialog}
          onSave={() => refetch()}
        />

        {/* Reschedule Meeting Dialog */}
        <RescheduleMeetingDialog
          meetingId={selectedMeetingId}
          open={showRescheduleDialog}
          onOpenChange={setShowRescheduleDialog}
          onReschedule={() => refetch()}
        />

        {/* Meeting Reminders Dialog */}
        <MeetingRemindersDialog
          meetingId={selectedMeetingId}
          meetingDate={selectedMeetingDate}
          open={showRemindersDialog}
          onOpenChange={setShowRemindersDialog}
          onSave={() => refetch()}
        />
      </div>
    </DashboardLayout>
  );
}