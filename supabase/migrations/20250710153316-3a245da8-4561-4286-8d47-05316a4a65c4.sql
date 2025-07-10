-- Add fields for recurring travel functionality to goals table
ALTER TABLE public.goals 
ADD COLUMN is_recurring boolean DEFAULT false,
ADD COLUMN start_date date,
ADD COLUMN frequency text,
ADD COLUMN end_date date;