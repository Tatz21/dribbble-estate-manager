-- Check the foreign key constraints on meetings table
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'meetings';

-- Fix the foreign key constraint - agent_id should reference agents table, not profiles
ALTER TABLE public.meetings 
DROP CONSTRAINT IF EXISTS meetings_agent_id_fkey;

-- Add correct foreign key constraint to agents table
ALTER TABLE public.meetings 
ADD CONSTRAINT meetings_agent_id_fkey 
FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;

-- Also fix client_id if needed
ALTER TABLE public.meetings 
DROP CONSTRAINT IF EXISTS meetings_client_id_fkey;

ALTER TABLE public.meetings 
ADD CONSTRAINT meetings_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;