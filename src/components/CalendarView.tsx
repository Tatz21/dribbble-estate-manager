import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, User, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  duration_minutes: number;
  location: string;
  status: string;
  meeting_type: string;
  client?: { full_name: string };
  agent?: { full_name: string };
}

interface CalendarViewProps {
  meetings: Meeting[];
  onClose: () => void;
}

export function CalendarView({ meetings, onClose }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get meetings for the selected date
  const selectedDateMeetings = selectedDate 
    ? meetings.filter(meeting => 
        isSameDay(new Date(meeting.meeting_date), selectedDate)
      )
    : [];

  // Get dates that have meetings
  const meetingDates = meetings.map(meeting => new Date(meeting.meeting_date));

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Calendar View</CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
          {/* Calendar */}
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                hasMeeting: meetingDates
              }}
              modifiersStyles={{
                hasMeeting: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '50%'
                }
              }}
            />
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Days with meetings</span>
              </div>
            </div>
          </div>

          {/* Selected Date Meetings */}
          <div>
            <h3 className="font-semibold mb-4">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDateMeetings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No meetings scheduled for this day
                </p>
              ) : (
                selectedDateMeetings
                  .sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime())
                  .map((meeting) => (
                    <Card key={meeting.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{meeting.title}</h4>
                          <Badge 
                            className={
                              meeting.status === 'completed' ? 'bg-success' :
                              meeting.status === 'confirmed' ? 'bg-primary' :
                              meeting.status === 'cancelled' ? 'bg-destructive' :
                              'bg-warning'
                            }
                          >
                            {meeting.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(meeting.meeting_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {meeting.location || 'No location'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">Client:</span>
                            {meeting.client?.full_name || 'None'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">Agent:</span>
                            {meeting.agent?.full_name || 'None'}
                          </div>
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          {meeting.meeting_type?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}