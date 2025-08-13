-- Fix function search paths for security best practices
CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT id FROM public.profiles WHERE user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_agent_for_client(client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.clients c
    JOIN public.profiles p ON p.id = c.agent_id
    WHERE c.id = client_id AND p.user_id = auth.uid()
  );
$function$;

-- Restrict property access to authenticated users for better security
DROP POLICY IF EXISTS "Anyone can view properties" ON public.properties;
CREATE POLICY "Authenticated users can view properties" 
ON public.properties 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Restrict property types to authenticated users
DROP POLICY IF EXISTS "Anyone can view property types" ON public.property_types;
CREATE POLICY "Authenticated users can view property types" 
ON public.property_types 
FOR SELECT 
USING (auth.role() = 'authenticated');