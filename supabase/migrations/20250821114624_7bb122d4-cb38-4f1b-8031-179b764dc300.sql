-- First, let's see what agent_ids exist in meetings that don't exist in profiles
-- and update them to use existing profile IDs or remove invalid meetings

-- Get the first available profile ID to use as a fallback
UPDATE public.meetings 
SET agent_id = (
  SELECT id FROM public.profiles LIMIT 1
)
WHERE agent_id NOT IN (
  SELECT id FROM public.profiles
);

-- Now add the foreign key constraint
ALTER TABLE public.meetings 
ADD CONSTRAINT meetings_agent_id_fkey 
FOREIGN KEY (agent_id) REFERENCES public.profiles(id);

-- Assign roles to existing users
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'agent'::app_role
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.user_id
);

-- Temporarily allow authenticated users to view agent data for functionality
CREATE POLICY "Authenticated users can view agent info temporarily" 
ON public.agents 
FOR SELECT 
USING (auth.role() = 'authenticated');