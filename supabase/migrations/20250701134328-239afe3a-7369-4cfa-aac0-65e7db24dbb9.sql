
-- Add is_main_plan column to financial_plans table
ALTER TABLE public.financial_plans 
ADD COLUMN is_main_plan BOOLEAN NOT NULL DEFAULT false;

-- Create an index on is_main_plan for better query performance
CREATE INDEX idx_financial_plans_is_main_plan ON public.financial_plans(user_id, is_main_plan);

-- Optional: Add a comment to document the column
COMMENT ON COLUMN public.financial_plans.is_main_plan IS 'Indicates if this is the users main financial plan';
