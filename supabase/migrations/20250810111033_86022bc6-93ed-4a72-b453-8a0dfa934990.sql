-- Create communication history table
CREATE TABLE public.communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'call', 'meeting', 'note', 'automated_email')),
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('welcome', 'follow_up', 'appointment_reminder', 'property_match', 'meeting_confirmation', 'thank_you')),
  variables JSONB DEFAULT '{}', -- Available variables for the template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automated follow-ups table
CREATE TABLE public.automated_followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('days_after_creation', 'days_after_meeting', 'days_without_activity', 'property_match')),
  trigger_value INTEGER, -- Days or other numeric value
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_followups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communications
CREATE POLICY "Agents can manage their client communications" 
ON public.communications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.clients c 
    JOIN public.profiles p ON p.id = c.agent_id 
    WHERE c.id = communications.client_id 
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for email templates
CREATE POLICY "Authenticated users can view email templates" 
ON public.email_templates 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (auth.role() = 'authenticated');

-- RLS Policies for automated followups
CREATE POLICY "Agents can manage their client followups" 
ON public.automated_followups 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.clients c 
    JOIN public.profiles p ON p.id = c.agent_id 
    WHERE c.id = automated_followups.client_id 
    AND p.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_communications_updated_at
BEFORE UPDATE ON public.communications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automated_followups_updated_at
BEFORE UPDATE ON public.automated_followups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, body, template_type, variables) VALUES
('Welcome Email', 'Welcome to {{agent_name}}''s Real Estate Services', 
'Dear {{client_name}},

Welcome! I''m {{agent_name}}, and I''m excited to help you with your real estate needs.

I''ve received your information and will be in touch shortly to discuss your requirements in detail. In the meantime, feel free to browse our latest properties that match your preferences.

Best regards,
{{agent_name}}
{{agent_phone}}
{{agent_email}}', 
'welcome', 
'{"client_name": "Client full name", "agent_name": "Agent full name", "agent_phone": "Agent phone", "agent_email": "Agent email"}'),

('Follow-up Email', 'Following up on your real estate inquiry', 
'Hi {{client_name}},

I wanted to follow up on your recent inquiry about {{property_type}} in {{preferred_locations}}. 

I have some exciting new properties that match your criteria and budget range of {{budget_range}}. Would you like to schedule a viewing this week?

Please let me know what works best for your schedule.

Best regards,
{{agent_name}}
{{agent_phone}}', 
'follow_up', 
'{"client_name": "Client name", "agent_name": "Agent name", "agent_phone": "Agent phone", "property_type": "Property type", "preferred_locations": "Preferred locations", "budget_range": "Budget range"}'),

('Appointment Reminder', 'Appointment Reminder - {{meeting_date}}', 
'Hi {{client_name}},

This is a friendly reminder about our scheduled {{meeting_type}} on {{meeting_date}} at {{meeting_time}}.

Location: {{meeting_location}}

If you need to reschedule or have any questions, please don''t hesitate to reach out.

Looking forward to meeting with you!

Best regards,
{{agent_name}}
{{agent_phone}}', 
'appointment_reminder', 
'{"client_name": "Client name", "agent_name": "Agent name", "agent_phone": "Agent phone", "meeting_type": "Meeting type", "meeting_date": "Meeting date", "meeting_time": "Meeting time", "meeting_location": "Meeting location"}');

-- Create indexes for better performance
CREATE INDEX idx_communications_client_id ON public.communications(client_id);
CREATE INDEX idx_communications_agent_id ON public.communications(agent_id);
CREATE INDEX idx_communications_type ON public.communications(type);
CREATE INDEX idx_communications_sent_at ON public.communications(sent_at);
CREATE INDEX idx_automated_followups_client_id ON public.automated_followups(client_id);
CREATE INDEX idx_automated_followups_scheduled_for ON public.automated_followups(scheduled_for);
CREATE INDEX idx_automated_followups_status ON public.automated_followups(status);