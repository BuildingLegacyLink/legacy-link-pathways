-- Add new columns to goals table to support goal types and withdrawal order
ALTER TABLE public.goals 
ADD COLUMN goal_type TEXT DEFAULT 'custom',
ADD COLUMN withdrawal_order JSONB DEFAULT '[]'::jsonb;

-- Update existing goals to have a default goal type
UPDATE public.goals 
SET goal_type = 'custom' 
WHERE goal_type IS NULL;

-- Add comment to explain the new columns
COMMENT ON COLUMN public.goals.goal_type IS 'Type of goal: retirement, travel, wedding, home, education, celebration, heirs, custom';
COMMENT ON COLUMN public.goals.withdrawal_order IS 'Array of asset IDs in withdrawal order for retirement goals';