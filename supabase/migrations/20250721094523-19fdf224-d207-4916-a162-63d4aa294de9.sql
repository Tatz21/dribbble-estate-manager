-- Add foreign key constraint from leads to agents if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'leads_assigned_agent_id_fkey' 
        AND table_name = 'leads'
    ) THEN
        ALTER TABLE public.leads 
        ADD CONSTRAINT leads_assigned_agent_id_fkey 
        FOREIGN KEY (assigned_agent_id) 
        REFERENCES public.agents(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraint from leads to properties if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'leads_property_id_fkey' 
        AND table_name = 'leads'
    ) THEN
        ALTER TABLE public.leads 
        ADD CONSTRAINT leads_property_id_fkey 
        FOREIGN KEY (property_id) 
        REFERENCES public.properties(id) 
        ON DELETE SET NULL;
    END IF;
END $$;