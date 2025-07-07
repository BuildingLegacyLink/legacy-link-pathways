
-- Add growth_rate column to expenses table
ALTER TABLE public.expenses 
ADD COLUMN growth_rate numeric DEFAULT 3.0;

-- Add a comment to explain the column
COMMENT ON COLUMN public.expenses.growth_rate IS 'Annual growth rate as a percentage (e.g., 3.0 for 3%)';
