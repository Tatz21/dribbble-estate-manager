-- Fix RLS issues for storage buckets and objects
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Update existing functions with secure search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_target_achievement(agent_uuid uuid, target_month date)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.calculate_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.commission_amount = (NEW.amount * NEW.commission_rate / 100);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-' || year_part || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.invoices
  WHERE invoice_number ~ ('^INV-' || year_part || '-\d+$');
  
  invoice_num := 'INV-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN invoice_num;
END;
$function$;