
-- Add start_date and end_date columns to the income table if they don't exist
-- Also add fields to track the date type (retirement, death, calendar_year, age) and the specific value
ALTER TABLE public.income 
ADD COLUMN IF NOT EXISTS start_date_type TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS start_date_value INTEGER,
ADD COLUMN IF NOT EXISTS end_date_type TEXT DEFAULT 'none', 
ADD COLUMN IF NOT EXISTS end_date_value INTEGER;

-- Add check constraints for the date types
ALTER TABLE public.income 
ADD CONSTRAINT income_start_date_type_check 
CHECK (start_date_type IN ('none', 'retirement', 'death', 'calendar_year', 'age'));

ALTER TABLE public.income 
ADD CONSTRAINT income_end_date_type_check 
CHECK (end_date_type IN ('none', 'retirement', 'death', 'calendar_year', 'age'));
