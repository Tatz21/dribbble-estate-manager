import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  clientId: string;
  templateId?: string;
  subject: string;
  content: string;
  type: 'email' | 'automated_email';
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { clientId, subject, content, type, metadata = {} }: EmailRequest = await req.json();

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*, agent:agent_id(id, full_name, email, phone)')
      .eq('id', clientId)
      .single();

    if (clientError || !client || !client.email) {
      throw new Error('Client not found or email not available');
    }

    // Save communication record
    const { data: communication, error: commError } = await supabase
      .from('communications')
      .insert({
        client_id: clientId,
        agent_id: client.agent?.id,
        type: type,
        subject: subject,
        content: content,
        status: resendApiKey ? 'pending' : 'sent',
        metadata: metadata
      })
      .select()
      .single();

    if (commError) throw new Error('Failed to save communication record');

    let emailSent = true;

    // Send email if configured
    if (resendApiKey && client.email) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${client.agent?.full_name || 'Agent'} <noreply@resend.dev>`,
            to: [client.email],
            subject: subject,
            html: content.replace(/\n/g, '<br>')
          }),
        });

        emailSent = emailResponse.ok;
        
        await supabase
          .from('communications')
          .update({ 
            status: emailSent ? 'sent' : 'failed',
            sent_at: new Date().toISOString()
          })
          .eq('id', communication.id);
      } catch (error) {
        emailSent = false;
      }
    }

    return new Response(JSON.stringify({
      success: emailSent,
      communicationId: communication.id,
      message: emailSent ? 'Email sent successfully' : 'Email sending failed'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);