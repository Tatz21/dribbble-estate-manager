-- Enable real-time for all major tables
ALTER TABLE public.properties REPLICA IDENTITY FULL;
ALTER TABLE public.clients REPLICA IDENTITY FULL; 
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD TABLE public.properties;
ALTER publication supabase_realtime ADD TABLE public.clients;
ALTER publication supabase_realtime ADD TABLE public.leads;
ALTER publication supabase_realtime ADD TABLE public.profiles;