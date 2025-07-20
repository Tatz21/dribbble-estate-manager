-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'manager')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property types table
CREATE TABLE public.property_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  price DECIMAL(12,2) NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet DECIMAL(8,2),
  lot_size DECIMAL(8,2),
  year_built INTEGER,
  property_type_id UUID REFERENCES public.property_types(id),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold', 'off_market')),
  listing_date DATE DEFAULT CURRENT_DATE,
  agent_id UUID REFERENCES public.profiles(id),
  images TEXT[],
  features TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  client_type TEXT DEFAULT 'buyer' CHECK (client_type IN ('buyer', 'seller', 'both')),
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  preferred_locations TEXT[],
  notes TEXT,
  agent_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'referral', 'social_media', 'advertisement', 'cold_call', 'other')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  interest_type TEXT CHECK (interest_type IN ('buying', 'selling', 'renting')),
  budget DECIMAL(12,2),
  preferred_locations TEXT[],
  notes TEXT,
  assigned_agent_id UUID REFERENCES public.profiles(id),
  property_id UUID REFERENCES public.properties(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_type TEXT DEFAULT 'showing' CHECK (meeting_type IN ('showing', 'consultation', 'closing', 'inspection', 'other')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  agent_id UUID REFERENCES public.profiles(id),
  client_id UUID REFERENCES public.clients(id),
  property_id UUID REFERENCES public.properties(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT CHECK (document_type IN ('contract', 'listing_agreement', 'disclosure', 'inspection_report', 'appraisal', 'other')),
  file_url TEXT,
  property_id UUID REFERENCES public.properties(id),
  client_id UUID REFERENCES public.clients(id),
  agent_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for property_types (public read)
CREATE POLICY "Anyone can view property types" ON public.property_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage property types" ON public.property_types FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for properties
CREATE POLICY "Anyone can view properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Agents can manage their properties" ON public.properties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.id = properties.agent_id)
);
CREATE POLICY "Admins can manage all properties" ON public.properties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Create RLS policies for clients
CREATE POLICY "Agents can view their clients" ON public.clients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.id = clients.agent_id)
);
CREATE POLICY "Agents can manage their clients" ON public.clients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.id = clients.agent_id)
);

-- Create RLS policies for leads
CREATE POLICY "Agents can view their leads" ON public.leads FOR SELECT USING (
  assigned_agent_id IS NULL OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.id = leads.assigned_agent_id)
);
CREATE POLICY "Agents can manage their leads" ON public.leads FOR ALL USING (
  assigned_agent_id IS NULL OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.id = leads.assigned_agent_id)
);

-- Create RLS policies for meetings
CREATE POLICY "Agents can view their meetings" ON public.meetings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.id = meetings.agent_id)
);
CREATE POLICY "Agents can manage their meetings" ON public.meetings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.id = meetings.agent_id)
);

-- Create RLS policies for documents
CREATE POLICY "Agents can view their documents" ON public.documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.id = documents.agent_id)
);
CREATE POLICY "Agents can manage their documents" ON public.documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.id = documents.agent_id)
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample property types
INSERT INTO public.property_types (name, description) VALUES
('Single Family Home', 'Detached single-family residential property'),
('Condominium', 'Individual unit in a multi-unit building'),
('Townhouse', 'Multi-story home sharing walls with adjacent units'),
('Apartment', 'Rental unit in a multi-unit building'),
('Commercial', 'Property used for business purposes'),
('Land', 'Vacant land for development or investment');

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();