-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the send-meeting-reminders function to run every 15 minutes
SELECT cron.schedule(
  'send-meeting-reminders-job',
  '*/15 * * * *', -- every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://ghbmjmheidfdszxvcrkq.supabase.co/functions/v1/send-meeting-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoYm1qbWhlaWRmZHN6eHZjcmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDIyMTUsImV4cCI6MjA2ODQxODIxNX0.mXpVroAzGVDhy7-fiG_dchFpReKynKnpnghVD5kULuk"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);