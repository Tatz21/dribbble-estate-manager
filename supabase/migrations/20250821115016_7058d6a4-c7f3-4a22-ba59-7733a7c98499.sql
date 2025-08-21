-- Enable real-time for meetings table
ALTER TABLE public.meetings REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.meetings;