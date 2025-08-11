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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2, Save } from "lucide-react";

interface Reminder {
  id?: string;
  reminder_type: string;
  reminder_time: string;
  sent?: boolean;
}

interface MeetingRemindersDialogProps {
  meetingId: string;
  meetingDate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export const MeetingRemindersDialog = ({ 
  meetingId, 
  meetingDate,
  open, 
  onOpenChange, 
  onSave 
}: MeetingRemindersDialogProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && meetingId) {
      fetchReminders();
    }
  }, [open, meetingId]);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_reminders')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('reminder_time');

      if (error) throw error;

      const formattedReminders = data.map(reminder => ({
        id: reminder.id,
        reminder_type: reminder.reminder_type,
        reminder_time: new Date(reminder.reminder_time).toISOString().slice(0, 16),
        sent: reminder.sent
      }));

      setReminders(formattedReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load meeting reminders",
        variant: "destructive",
      });
    }
  };

  const addDefaultReminders = () => {
    const meetingDateTime = new Date(meetingDate);
    const defaultReminders = [
      {
        reminder_type: '24_hours',
        reminder_time: new Date(meetingDateTime.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      },
      {
        reminder_type: '2_hours',
        reminder_time: new Date(meetingDateTime.getTime() - 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
      },
      {
        reminder_type: '30_minutes',
        reminder_time: new Date(meetingDateTime.getTime() - 30 * 60 * 1000).toISOString().slice(0, 16)
      }
    ];

    setReminders(prev => [...prev, ...defaultReminders]);
  };

  const addCustomReminder = () => {
    const meetingDateTime = new Date(meetingDate);
    const oneHourBefore = new Date(meetingDateTime.getTime() - 60 * 60 * 1000);
    
    setReminders(prev => [...prev, {
      reminder_type: 'custom',
      reminder_time: oneHourBefore.toISOString().slice(0, 16)
    }]);
  };

  const removeReminder = (index: number) => {
    setReminders(prev => prev.filter((_, i) => i !== index));
  };

  const updateReminderTime = (index: number, time: string) => {
    setReminders(prev => prev.map((reminder, i) => 
      i === index ? { ...reminder, reminder_time: time } : reminder
    ));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Delete existing reminders that aren't sent yet
      const { error: deleteError } = await supabase
        .from('meeting_reminders')
        .delete()
        .eq('meeting_id', meetingId)
        .eq('sent', false);

      if (deleteError) throw deleteError;

      // Insert new reminders
      if (reminders.length > 0) {
        const remindersToInsert = reminders
          .filter(reminder => !reminder.sent) // Only insert non-sent reminders
          .map(reminder => ({
            meeting_id: meetingId,
            reminder_type: reminder.reminder_type,
            reminder_time: new Date(reminder.reminder_time).toISOString(),
            sent: false
          }));

        if (remindersToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('meeting_reminders')
            .insert(remindersToInsert);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: "Reminders saved successfully",
        description: `${reminders.filter(r => !r.sent).length} reminders set for this meeting`,
      });

      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving reminders:', error);
      toast({
        title: "Error",
        description: "Failed to save meeting reminders",
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
            <Bell className="h-5 w-5" />
            Meeting Reminders
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="text-center py-6">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No reminders set for this meeting</p>
              <Button onClick={addDefaultReminders} variant="outline">
                Add Default Reminders
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">
                      {reminder.reminder_type === 'custom' ? 'Custom Reminder' : 
                       reminder.reminder_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Input
                      type="datetime-local"
                      value={reminder.reminder_time}
                      onChange={(e) => updateReminderTime(index, e.target.value)}
                      className="mt-1"
                      disabled={reminder.sent}
                    />
                  </div>
                  {reminder.sent && (
                    <div className="text-xs text-success bg-success/10 px-2 py-1 rounded">
                      Sent
                    </div>
                  )}
                  {!reminder.sent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReminder(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={addCustomReminder} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Reminder
            </Button>
            {reminders.length === 0 && (
              <Button onClick={addDefaultReminders} variant="outline" size="sm">
                Add Default Reminders
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Reminders
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};