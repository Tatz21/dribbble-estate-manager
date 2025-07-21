-- Completely disable RLS on meetings table to allow anyone to schedule meetings
-- This makes the meetings table publicly accessible

ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on other tables that might be needed for the meeting form
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;