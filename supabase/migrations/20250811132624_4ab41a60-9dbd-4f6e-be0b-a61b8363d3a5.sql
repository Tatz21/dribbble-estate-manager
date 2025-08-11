-- Add meeting notes and outcomes tracking
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS outcome text;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS meeting_notes text;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS follow_up_required boolean DEFAULT false;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS next_follow_up_date timestamp with time zone;

-- Create meeting reminders table
CREATE TABLE IF NOT EXISTS public.meeting_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES public.meetings(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('24_hours', '2_hours', '30_minutes', 'custom')),
  reminder_time timestamp with time zone NOT NULL,
  sent boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on meeting_reminders
ALTER TABLE public.meeting_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for meeting_reminders
CREATE POLICY "Agents can manage their meeting reminders" 
ON public.meeting_reminders 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.meetings m
    JOIN public.profiles p ON p.id = m.agent_id
    WHERE m.id = meeting_reminders.meeting_id 
    AND p.user_id = auth.uid()
  )
);

-- Add trigger for updated_at on meeting_reminders
CREATE TRIGGER update_meeting_reminders_updated_at
BEFORE UPDATE ON public.meeting_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_meeting_id ON public.meeting_reminders(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_time ON public.meeting_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_sent ON public.meeting_reminders(sent);
CREATE INDEX IF NOT EXISTS idx_meetings_follow_up ON public.meetings(next_follow_up_date) WHERE follow_up_required = true;