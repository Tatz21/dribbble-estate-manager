-- Create invoices table for billing management
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  property_id UUID REFERENCES public.properties(id),
  client_id UUID REFERENCES public.clients(id),
  agent_id UUID REFERENCES public.profiles(id),
  amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) DEFAULT 10.00,
  commission_amount NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_date DATE,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for invoices
CREATE POLICY "Agents can view their invoices" 
ON public.invoices 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.id = invoices.agent_id
));

CREATE POLICY "Agents can create invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.id = invoices.agent_id
));

CREATE POLICY "Agents can update their invoices" 
ON public.invoices 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.id = invoices.agent_id
));

CREATE POLICY "Agents can delete their invoices" 
ON public.invoices 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.id = invoices.agent_id
));

-- Create function to auto-calculate commission amount
CREATE OR REPLACE FUNCTION public.calculate_commission()
RETURNS TRIGGER AS $$
BEGIN
  NEW.commission_amount = (NEW.amount * NEW.commission_rate / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate commission
CREATE TRIGGER calculate_commission_trigger
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_commission();

-- Create trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Generate invoice number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;