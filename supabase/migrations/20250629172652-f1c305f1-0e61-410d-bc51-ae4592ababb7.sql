
-- Create table for saved financial plans
CREATE TABLE public.financial_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'New Plan',
  monthly_income NUMERIC NOT NULL DEFAULT 0,
  monthly_expenses NUMERIC NOT NULL DEFAULT 0,
  monthly_savings NUMERIC NOT NULL DEFAULT 0,
  current_savings_rate NUMERIC NOT NULL DEFAULT 0,
  total_assets NUMERIC NOT NULL DEFAULT 0,
  target_retirement_age INTEGER NOT NULL DEFAULT 67,
  target_savings_rate NUMERIC NOT NULL DEFAULT 20,
  projected_retirement_savings NUMERIC NOT NULL DEFAULT 0,
  assets_last_until_age INTEGER NOT NULL DEFAULT 85,
  status TEXT NOT NULL DEFAULT 'needs_attention',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.financial_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for financial_plans
CREATE POLICY "Users can view their own plans" 
  ON public.financial_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans" 
  ON public.financial_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" 
  ON public.financial_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" 
  ON public.financial_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table for year-by-year projections
CREATE TABLE public.plan_projections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.financial_plans(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  age INTEGER NOT NULL,
  net_worth NUMERIC NOT NULL DEFAULT 0,
  portfolio_value NUMERIC NOT NULL DEFAULT 0,
  annual_expenses NUMERIC NOT NULL DEFAULT 0,
  cash_flow NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for plan_projections
ALTER TABLE public.plan_projections ENABLE ROW LEVEL SECURITY;

-- Create policies for plan_projections
CREATE POLICY "Users can view projections for their own plans" 
  ON public.plan_projections 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.financial_plans 
    WHERE financial_plans.id = plan_projections.plan_id 
    AND financial_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can create projections for their own plans" 
  ON public.plan_projections 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.financial_plans 
    WHERE financial_plans.id = plan_projections.plan_id 
    AND financial_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update projections for their own plans" 
  ON public.plan_projections 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.financial_plans 
    WHERE financial_plans.id = plan_projections.plan_id 
    AND financial_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete projections for their own plans" 
  ON public.plan_projections 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.financial_plans 
    WHERE financial_plans.id = plan_projections.plan_id 
    AND financial_plans.user_id = auth.uid()
  ));
