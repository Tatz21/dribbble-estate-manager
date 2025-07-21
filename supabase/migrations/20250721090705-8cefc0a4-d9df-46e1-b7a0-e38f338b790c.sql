-- Simplify the meetings RLS policy to allow authenticated users to create and manage meetings
-- This ensures users can create meetings without complex checks

DROP POLICY IF EXISTS "Users can manage meetings they are assigned to or unassigned meetings" ON public.meetings;

-- Create a simple policy that allows authenticated users to manage all meetings
CREATE POLICY "Authenticated users can manage meetings" 
ON public.meetings 
FOR ALL 
USING (auth.role() = 'authenticated'::text)
WITH CHECK (auth.role() = 'authenticated'::text);

-- Also ensure we have a trigger to create profiles for new users if it doesn't exist
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
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();