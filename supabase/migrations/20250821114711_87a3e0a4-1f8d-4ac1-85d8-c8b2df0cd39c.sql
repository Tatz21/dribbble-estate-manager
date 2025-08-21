-- Remove all existing foreign key constraints from meetings table
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'meetings' 
        AND constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE public.meetings DROP CONSTRAINT ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Update invalid agent_ids to use valid profile ids
UPDATE public.meetings 
SET agent_id = (
  SELECT id FROM public.profiles LIMIT 1
)
WHERE agent_id IS NOT NULL 
AND agent_id NOT IN (
  SELECT id FROM public.profiles
);

-- Add proper foreign key to profiles table
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
)
ON CONFLICT (user_id, role) DO NOTHING;