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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save, Calendar } from "lucide-react";

interface MeetingNotesDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export const MeetingNotesDialog = ({ 
  meetingId, 
  open, 
  onOpenChange, 
  onSave 
}: MeetingNotesDialogProps) => {
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && meetingId) {
      fetchMeetingNotes();
    }
  }, [open, meetingId]);

  const fetchMeetingNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('meeting_notes, outcome, follow_up_required, next_follow_up_date')
        .eq('id', meetingId)
        .single();

      if (error) throw error;

      setNotes(data.meeting_notes || "");
      setOutcome(data.outcome || "");
      setFollowUpRequired(data.follow_up_required || false);
      setNextFollowUpDate(
        data.next_follow_up_date 
          ? new Date(data.next_follow_up_date).toISOString().slice(0, 16)
          : ""
      );
    } catch (error) {
      console.error('Error fetching meeting notes:', error);
      toast({
        title: "Error",
        description: "Failed to load meeting notes",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('meetings')
        .update({
          meeting_notes: notes,
          outcome,
          follow_up_required: followUpRequired,
          next_follow_up_date: followUpRequired && nextFollowUpDate 
            ? new Date(nextFollowUpDate).toISOString() 
            : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId);

      if (error) throw error;

      toast({
        title: "Notes saved successfully",
        description: "Meeting notes and outcome have been updated",
      });

      onSave?.();
    } catch (error) {
      console.error('Error saving meeting notes:', error);
      toast({
        title: "Error",
        description: "Failed to save meeting notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Meeting Notes & Outcome
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="notes">Meeting Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add detailed notes about what was discussed..."
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="outcome">Meeting Outcome</Label>
            <select
              id="outcome"
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            >
              <option value="">Select Outcome</option>
              <option value="successful">Successful</option>
              <option value="needs_follow_up">Needs Follow-up</option>
              <option value="client_interested">Client Interested</option>
              <option value="client_not_interested">Client Not Interested</option>
              <option value="property_sold">Property Sold</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="follow_up"
              checked={followUpRequired}
              onCheckedChange={(checked) => setFollowUpRequired(checked as boolean)}
            />
            <Label htmlFor="follow_up">Follow-up required</Label>
          </div>

          {followUpRequired && (
            <div>
              <Label htmlFor="follow_up_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Next Follow-up Date
              </Label>
              <Input
                id="follow_up_date"
                type="datetime-local"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};