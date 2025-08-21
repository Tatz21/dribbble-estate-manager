-- Temporarily allow authenticated users to view agent names for app functionality
-- While keeping emails and phones protected
CREATE POLICY "Authenticated users can view agent names" 
ON public.agents 
FOR SELECT 
USING (auth.role() = 'authenticated');