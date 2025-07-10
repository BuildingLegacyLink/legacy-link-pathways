-- Update goals table to support flexible timing system
ALTER TABLE public.goals 
DROP COLUMN start_date,
DROP COLUMN end_date,
ADD COLUMN start_timing_type text, -- 'calendar_year', 'age', 'retirement', 'death'
ADD COLUMN start_timing_value integer, -- year or age value
ADD COLUMN end_timing_type text,
ADD COLUMN end_timing_value integer;