-- Remove the overly permissive policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Keep only the secure policy that allows users to view their own profile
-- The "Users can view own profile" policy already exists and is secure

-- If agents need to be visible to others, we can add a more specific policy later
-- But for now, prioritize privacy by only allowing self-access