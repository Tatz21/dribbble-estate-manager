-- Update the meetings RLS policy to allow users to create meetings without requiring agent_id
-- This allows authenticated users to create meetings even when agent_id is null

DROP POLICY IF EXISTS "Agents can manage their meetings" ON public.meetings;
DROP POLICY IF EXISTS "Agents can view their meetings" ON public.meetings;

-- Create new policies that allow authenticated users to manage meetings
-- Either when they are the assigned agent OR when no agent is assigned
CREATE POLICY "Users can manage meetings they are assigned to or unassigned meetings" 
ON public.meetings 
FOR ALL 
USING (
  auth.role() = 'authenticated'::text AND (
    agent_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() AND profiles.id = meetings.agent_id
    )
  )
)
WITH CHECK (
  auth.role() = 'authenticated'::text AND (
    agent_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() AND profiles.id = meetings.agent_id
    )
  )
);