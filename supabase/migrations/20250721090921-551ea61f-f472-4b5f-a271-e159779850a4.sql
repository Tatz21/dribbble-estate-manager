-- Create a more permissive RLS policy for meetings
-- Allow any authenticated user to manage all meetings
DROP POLICY IF EXISTS "Authenticated users can manage meetings" ON public.meetings;

CREATE POLICY "Allow all authenticated users full access to meetings" 
ON public.meetings 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);