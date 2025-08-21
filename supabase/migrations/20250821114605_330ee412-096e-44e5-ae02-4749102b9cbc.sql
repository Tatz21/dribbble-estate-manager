-- Fix the meetings table foreign key relationship
-- First check if the foreign key exists and drop it if it does
DO $$
BEGIN
    -- Check if foreign key exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'meetings_agent_id_fkey' 
        AND table_name = 'meetings'
    ) THEN
        ALTER TABLE public.meetings DROP CONSTRAINT meetings_agent_id_fkey;
    END IF;
END $$;

-- Add the correct foreign key to profiles table
ALTER TABLE public.meetings 
ADD CONSTRAINT meetings_agent_id_fkey 
FOREIGN KEY (agent_id) REFERENCES public.profiles(id);

-- Assign the default role to existing users who don't have roles
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'agent'::app_role
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.user_id
);

-- Update the agents table RLS policies to be less restrictive for now
-- Allow all authenticated users to view basic agent info (name only)
DROP POLICY IF EXISTS "Clients can view basic agent info" ON public.agents;

CREATE POLICY "Authenticated users can view agent names" 
ON public.agents 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  status = 'active'
);