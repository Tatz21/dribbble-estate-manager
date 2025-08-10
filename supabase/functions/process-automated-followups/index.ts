import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing automated follow-ups...');

    // Get pending follow-ups that are due
    const { data: followups, error: followupsError } = await supabase
      .from('automated_followups')
      .select(`
        *,
        client:client_id(id, full_name, email, agent_id, client_type, preferred_locations, budget_min, budget_max),
        template:template_id(id, name, subject, body, variables)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());

    if (followupsError) {
      console.error('Error fetching follow-ups:', followupsError);
      throw new Error('Failed to fetch follow-ups');
    }

    console.log(`Found ${followups?.length || 0} pending follow-ups`);

    if (!followups || followups.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending follow-ups to process',
        processed: 0
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let processedCount = 0;
    let errors: string[] = [];

    for (const followup of followups) {
      try {
        const client = followup.client as any;
        const template = followup.template as any;

        if (!client || !template) {
          console.error('Missing client or template for followup:', followup.id);
          errors.push(`Missing client or template for followup ${followup.id}`);
          continue;
        }

        // Get agent details
        const { data: agent } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', client.agent_id)
          .single();

        if (!agent) {
          console.error('Agent not found for client:', client.id);
          errors.push(`Agent not found for client ${client.id}`);
          continue;
        }

        // Prepare template variables
        const variables = {
          client_name: client.full_name,
          agent_name: agent.full_name,
          agent_phone: agent.phone || '',
          agent_email: agent.email || '',
          property_type: client.client_type || 'property',
          preferred_locations: client.preferred_locations ? client.preferred_locations.join(', ') : '',
          budget_range: client.budget_min && client.budget_max 
            ? `₹${(client.budget_min / 10000000).toFixed(1)}Cr - ₹${(client.budget_max / 10000000).toFixed(1)}Cr`
            : 'Not specified'
        };

        // Replace template variables
        let subject = template.subject;
        let content = template.body;

        Object.entries(variables).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          subject = subject.replace(new RegExp(placeholder, 'g'), value || '');
          content = content.replace(new RegExp(placeholder, 'g'), value || '');
        });

        console.log(`Processing followup for client: ${client.full_name}`);

        // Call the email sending function
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-communication-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId: client.id,
            templateId: template.id,
            subject: subject,
            content: content,
            type: 'automated_email',
            metadata: {
              followup_id: followup.id,
              trigger_type: followup.trigger_type
            }
          }),
        });

        if (emailResponse.ok) {
          // Mark followup as sent
          await supabase
            .from('automated_followups')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', followup.id);

          processedCount++;
          console.log(`Successfully processed followup ${followup.id}`);
        } else {
          const errorText = await emailResponse.text();
          console.error('Failed to send email for followup:', followup.id, errorText);
          errors.push(`Failed to send email for followup ${followup.id}: ${errorText}`);
        }

      } catch (error) {
        console.error('Error processing followup:', followup.id, error);
        errors.push(`Error processing followup ${followup.id}: ${error.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${processedCount} follow-ups`,
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in process-automated-followups function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);