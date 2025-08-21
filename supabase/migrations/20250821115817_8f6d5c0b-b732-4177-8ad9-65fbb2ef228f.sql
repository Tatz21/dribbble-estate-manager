-- First, check and drop all existing policies on agent_performance
DROP POLICY IF EXISTS "Admins can manage all agent performance" ON public.agent_performance;
DROP POLICY IF EXISTS "Authenticated users can manage agent performance" ON public.agent_performance;
DROP POLICY IF EXISTS "Authenticated users can view agent performance" ON public.agent_performance;

-- Create secure policies for agent_performance table
-- 1. Admins can manage all agent performance data
CREATE POLICY "Admin full access to agent performance" 
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
CREATE POLICY "Agent view own performance only" 
ON public.agent_performance 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = agent_performance.agent_id
  )
);