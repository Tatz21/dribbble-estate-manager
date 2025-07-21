-- Create agent performance metrics table
CREATE TABLE public.agent_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  deals_completed INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  target_revenue NUMERIC DEFAULT 0,
  client_satisfaction NUMERIC DEFAULT 0 CHECK (client_satisfaction >= 0 AND client_satisfaction <= 5),
  response_time_hours NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0 CHECK (conversion_rate >= 0 AND conversion_rate <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, month)
);

-- Enable RLS
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for agent performance
CREATE POLICY "Authenticated users can view agent performance" 
ON public.agent_performance 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can manage agent performance" 
ON public.agent_performance 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agent_performance_updated_at
BEFORE UPDATE ON public.agent_performance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate target achievement percentage
CREATE OR REPLACE FUNCTION public.calculate_target_achievement(agent_uuid UUID, target_month DATE)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  total_revenue NUMERIC;
  target_revenue NUMERIC;
  achievement_percentage NUMERIC;
BEGIN
  SELECT ap.total_revenue, ap.target_revenue
  INTO total_revenue, target_revenue
  FROM public.agent_performance ap
  WHERE ap.agent_id = agent_uuid AND ap.month = target_month;
  
  IF target_revenue IS NULL OR target_revenue = 0 THEN
    RETURN 0;
  END IF;
  
  achievement_percentage := (total_revenue / target_revenue) * 100;
  RETURN ROUND(achievement_percentage, 2);
END;
$$;