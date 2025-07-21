-- First, let's re-enable RLS but create a proper policy that works with authentication
-- Also ensure we have the proper profile creation function

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all authenticated users full access to meetings" ON public.meetings;

-- Create a simple policy that just checks if user is authenticated
CREATE POLICY "Authenticated users can manage meetings" 
ON public.meetings 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Update the profile creation function to handle user metadata properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    'agent'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', EXCLUDED.full_name),
    email = NEW.email;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();