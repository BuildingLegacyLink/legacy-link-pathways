
-- Create tax_assumptions table to store user tax configuration
CREATE TABLE public.tax_assumptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  federal_tax_method TEXT NOT NULL DEFAULT '1040' CHECK (federal_tax_method IN ('1040', 'flat')),
  flat_federal_rate NUMERIC CHECK (flat_federal_rate >= 0 AND flat_federal_rate <= 100),
  state_tax_method TEXT NOT NULL DEFAULT 'stateRules' CHECK (state_tax_method IN ('none', 'stateRules', 'flat')),
  state TEXT,
  flat_state_rate NUMERIC CHECK (flat_state_rate >= 0 AND flat_state_rate <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.tax_assumptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own tax assumptions" 
  ON public.tax_assumptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tax assumptions" 
  ON public.tax_assumptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax assumptions" 
  ON public.tax_assumptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax assumptions" 
  ON public.tax_assumptions 
  FOR DELETE 
  USING (auth.uid() = user_id);
