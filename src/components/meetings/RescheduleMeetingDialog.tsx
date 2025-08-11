import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Save } from "lucide-react";

interface RescheduleMeetingDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule?: () => void;
}

export const RescheduleMeetingDialog = ({ 
  meetingId, 
  open, 
  onOpenChange, 
  onReschedule 
}: RescheduleMeetingDialogProps) => {
  const [meeting, setMeeting] = useState<any>(null);
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && meetingId) {
      fetchMeeting();
    }
  }, [open, meetingId]);

  const fetchMeeting = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          client:clients(full_name, email),
          agent:profiles(full_name, email)
        `)
        .eq('id', meetingId)
        .single();

      if (error) throw error;

      setMeeting(data);
      setNewDate(new Date(data.meeting_date).toISOString().slice(0, 16));
      setNewLocation(data.location || "");
    } catch (error) {
      console.error('Error fetching meeting:', error);
      toast({
        title: "Error",
        description: "Failed to load meeting details",
        variant: "destructive",
      });
    }
  };

  const handleReschedule = async () => {
    if (!newDate.trim()) {
      toast({
        title: "Error",
        description: "Please select a new date and time",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update the meeting
      const { error: updateError } = await supabase
        .from('meetings')
        .update({
          meeting_date: new Date(newDate).toISOString(),
          location: newLocation,
          status: 'scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId);

      if (updateError) throw updateError;

      // Send reschedule notification if client has email
      if (meeting?.client?.email) {
        try {
          await supabase.functions.invoke('send-communication-email', {
            body: {
              clientId: meeting.client_id,
              subject: `Meeting Rescheduled: ${meeting.title}`,
              content: `
                <h2>Meeting Rescheduled</h2>
                <p>Dear ${meeting.client.full_name},</p>
                <p>Your meeting "${meeting.title}" has been rescheduled to:</p>
                <ul>
                  <li><strong>New Date:</strong> ${new Date(newDate).toLocaleDateString()} at ${new Date(newDate).toLocaleTimeString()}</li>
                  <li><strong>Location:</strong> ${newLocation || 'TBD'}</li>
                  ${rescheduleReason ? `<li><strong>Reason:</strong> ${rescheduleReason}</li>` : ''}
                </ul>
                <p>Please confirm your availability for the new time.</p>
                <p>Best regards,<br/>${meeting.agent?.full_name}</p>
              `,
              communicationType: 'email'
            }
          });
        } catch (emailError) {
          console.error('Error sending reschedule notification:', emailError);
          // Don't fail the reschedule if email fails
        }
      }

      toast({
        title: "Meeting rescheduled successfully",
        description: meeting?.client?.email 
          ? "Meeting updated and notification sent to client"
          : "Meeting updated successfully",
      });

      onReschedule?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error rescheduling meeting:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule meeting",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!meeting) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reschedule Meeting: {meeting.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Current Meeting Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Date:</span>{" "}
                {new Date(meeting.meeting_date).toLocaleDateString()}
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>{" "}
                {new Date(meeting.meeting_date).toLocaleTimeString()}
              </div>
              <div>
                <span className="text-muted-foreground">Client:</span>{" "}
                {meeting.client?.full_name || 'No client'}
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>{" "}
                {meeting.location || 'No location'}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="new_date" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              New Date & Time *
            </Label>
            <Input
              id="new_date"
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="new_location">New Location</Label>
            <Input
              id="new_location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Enter new meeting location"
            />
          </div>

          <div>
            <Label htmlFor="reschedule_reason">Reason for Rescheduling (Optional)</Label>
            <Textarea
              id="reschedule_reason"
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="Explain why the meeting is being rescheduled..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={isLoading}>
              {isLoading ? "Rescheduling..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Reschedule Meeting
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};