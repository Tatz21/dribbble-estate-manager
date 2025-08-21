-- First, let's create an enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'client');

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create a function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'agent' THEN 2
      WHEN 'client' THEN 3
    END
  LIMIT 1
$$;

-- Drop existing overly permissive agents table policies
DROP POLICY IF EXISTS "Authenticated users can view basic agent info" ON public.agents;
DROP POLICY IF EXISTS "Authenticated users can create agents" ON public.agents;
DROP POLICY IF EXISTS "Authenticated users can update agents" ON public.agents;
DROP POLICY IF EXISTS "Authenticated users can delete agents" ON public.agents;

-- Create secure RLS policies for agents table
-- Admins can see all agent data
CREATE POLICY "Admins can manage all agents" 
ON public.agents 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Agents can only see their own data
CREATE POLICY "Agents can view their own data" 
ON public.agents 
FOR SELECT 
USING (user_id = auth.uid());

-- Agents can update their own data
CREATE POLICY "Agents can update their own data" 
ON public.agents 
FOR UPDATE 
USING (user_id = auth.uid());

-- Clients can only see basic agent info (no personal details)
CREATE POLICY "Clients can view basic agent info" 
ON public.agents 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'client') AND 
  status = 'active'
);

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create a view for public agent information (without sensitive data)
CREATE OR REPLACE VIEW public.agents_public AS
SELECT 
  id,
  full_name,
  role,
  specialization,
  qualifications,
  status,
  created_at
FROM public.agents
WHERE status = 'active';

-- Enable RLS on the view
ALTER VIEW public.agents_public SET (security_barrier = true);

-- Allow authenticated users to view the public agent information
CREATE POLICY "Public agent info viewable by authenticated users" 
ON public.agents_public 
FOR SELECT 
TO authenticated 
USING (true);