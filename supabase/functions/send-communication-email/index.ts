import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend("re_dZDj9sfd_KYRJvoVJN37DVqreZWQdNvTi");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  clientId: string;
  subject: string;
  content: string;
  templateId?: string;
  communicationType: 'email' | 'followup' | 'reminder';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { clientId, subject, content, templateId, communicationType }: SendEmailRequest = await req.json();

    // Get client information
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('full_name, email, agent_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Get agent information
    const { data: agent, error: agentError } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', client.agent_id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found');
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: `${agent.full_name} <onboarding@resend.dev>`,
      to: [client.email],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${client.full_name},</h2>
          <div style="line-height: 1.6; color: #555;">
            ${content}
          </div>
          <br>
          <p style="color: #666;">
            Best regards,<br>
            ${agent.full_name}<br>
            Your Real Estate Agent
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      throw new Error(emailResponse.error.message);
    }

    // Log communication in database
    const { error: logError } = await supabaseClient
      .from('communications')
      .insert({
        client_id: clientId,
        agent_id: client.agent_id,
        type: communicationType,
        subject: subject,
        content: content,
        method: 'email',
        status: 'sent',
        template_id: templateId,
        external_id: emailResponse.data?.id
      });

    if (logError) {
      console.error('Failed to log communication:', logError);
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-communication-email function:", error);
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