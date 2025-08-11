import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ReminderData {
  id: string;
  meeting_id: string;
  reminder_type: string;
  reminder_time: string;
  meeting: {
    title: string;
    meeting_date: string;
    location: string;
    description: string;
    client: {
      full_name: string;
      email: string;
    } | null;
    agent: {
      full_name: string;
      email: string;
    } | null;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing meeting reminders...');

    // Get reminders that are due to be sent
    const now = new Date();
    const { data: reminders, error: fetchError } = await supabase
      .from('meeting_reminders')
      .select(`
        id,
        meeting_id,
        reminder_type,
        reminder_time,
        meeting:meetings(
          title,
          meeting_date,
          location,
          description,
          client:clients(full_name, email),
          agent:profiles(full_name, email)
        )
      `)
      .eq('sent', false)
      .lte('reminder_time', now.toISOString())
      .returns<ReminderData[]>();

    if (fetchError) {
      console.error('Error fetching reminders:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${reminders?.length || 0} reminders to process`);

    const processedReminders = [];

    for (const reminder of reminders || []) {
      try {
        const { meeting } = reminder;
        const meetingDate = new Date(meeting.meeting_date);
        
        // Send reminder to client if they have an email
        if (meeting.client?.email) {
          const clientEmailResult = await resend.emails.send({
            from: "Meetings <onboarding@resend.dev>",
            to: [meeting.client.email],
            subject: `Meeting Reminder: ${meeting.title}`,
            html: `
              <h2>Meeting Reminder</h2>
              <p>Dear ${meeting.client.full_name},</p>
              <p>This is a reminder for your upcoming meeting:</p>
              <ul>
                <li><strong>Meeting:</strong> ${meeting.title}</li>
                <li><strong>Date:</strong> ${meetingDate.toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${meetingDate.toLocaleTimeString()}</li>
                <li><strong>Location:</strong> ${meeting.location || 'TBD'}</li>
                ${meeting.description ? `<li><strong>Details:</strong> ${meeting.description}</li>` : ''}
              </ul>
              <p>Please be on time for your meeting.</p>
              <p>Best regards,<br/>${meeting.agent?.full_name || 'Your Agent'}</p>
            `,
          });

          console.log(`Sent client reminder for meeting ${meeting.title}:`, clientEmailResult);
        }

        // Send reminder to agent if they have an email
        if (meeting.agent?.email) {
          const agentEmailResult = await resend.emails.send({
            from: "Meetings <onboarding@resend.dev>",
            to: [meeting.agent.email],
            subject: `Meeting Reminder: ${meeting.title}`,
            html: `
              <h2>Meeting Reminder</h2>
              <p>Dear ${meeting.agent.full_name},</p>
              <p>You have an upcoming meeting:</p>
              <ul>
                <li><strong>Meeting:</strong> ${meeting.title}</li>
                <li><strong>Date:</strong> ${meetingDate.toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${meetingDate.toLocaleTimeString()}</li>
                <li><strong>Location:</strong> ${meeting.location || 'TBD'}</li>
                <li><strong>Client:</strong> ${meeting.client?.full_name || 'No client assigned'}</li>
                ${meeting.description ? `<li><strong>Details:</strong> ${meeting.description}</li>` : ''}
              </ul>
              <p>Please prepare for your meeting.</p>
            `,
          });

          console.log(`Sent agent reminder for meeting ${meeting.title}:`, agentEmailResult);
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('meeting_reminders')
          .update({ sent: true })
          .eq('id', reminder.id);

        if (updateError) {
          console.error(`Error marking reminder ${reminder.id} as sent:`, updateError);
        } else {
          processedReminders.push(reminder.id);
          console.log(`Marked reminder ${reminder.id} as sent`);
        }

      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
      }
    }

    console.log(`Successfully processed ${processedReminders.length} reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedReminders.length,
        reminder_ids: processedReminders 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-meeting-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);