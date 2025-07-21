-- Check if there are any profiles and create a test user if needed
-- Also make sure RLS is completely off for debugging

-- Temporarily disable RLS on meetings table to test
ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;

-- Check if we have any profiles
SELECT count(*) as profile_count FROM public.profiles;

-- Insert a test profile if none exists (using a dummy UUID for testing)
INSERT INTO public.profiles (user_id, full_name, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Test User',
  'test@example.com',
  'agent'
) ON CONFLICT (user_id) DO NOTHING;