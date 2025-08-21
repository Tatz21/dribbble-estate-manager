-- Fix security issue: Restrict agent_performance table access
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage agent performance" ON public.agent_performance;
DROP POLICY IF EXISTS "Authenticated users can view agent performance" ON public.agent_performance;

-- Create secure policies for agent_performance table
-- 1. Admins can manage all agent performance data
CREATE POLICY "Admins can manage all agent performance" 
ON public.agent_performance 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Agents can only view their own performance data (read-only)
CREATE POLICY "Agents can view own performance data" 
ON public.agent_performance 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = agent_performance.agent_id
  )
);

-- 3. Only admins can insert new performance records
CREATE POLICY "Only admins can create performance records" 
ON public.agent_performance 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 4. Only admins can update performance records
CREATE POLICY "Only admins can update performance records" 
ON public.agent_performance 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);