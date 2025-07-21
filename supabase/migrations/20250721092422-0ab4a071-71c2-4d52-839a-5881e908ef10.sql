-- Fix the status check constraint to allow the status values being used
-- First check what the current constraint allows
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'public.meetings'::regclass 
AND contype = 'c';

-- Drop the existing check constraint and create a new one with all valid statuses
ALTER TABLE public.meetings 
DROP CONSTRAINT IF EXISTS meetings_status_check;

-- Add a new check constraint with all the status values used in the app
ALTER TABLE public.meetings 
ADD CONSTRAINT meetings_status_check 
CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed'));