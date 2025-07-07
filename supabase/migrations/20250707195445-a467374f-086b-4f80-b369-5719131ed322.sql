-- Clean up old dependents columns that are no longer used
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS dependents_count,
DROP COLUMN IF EXISTS dependents_ages;