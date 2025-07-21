-- Drop the existing check constraint
ALTER TABLE public.clients DROP CONSTRAINT clients_client_type_check;

-- Add a new check constraint with all the client types we're using
ALTER TABLE public.clients ADD CONSTRAINT clients_client_type_check 
CHECK (client_type IN ('buyer', 'seller', 'tenant', 'landlord', 'investor', 'both'));