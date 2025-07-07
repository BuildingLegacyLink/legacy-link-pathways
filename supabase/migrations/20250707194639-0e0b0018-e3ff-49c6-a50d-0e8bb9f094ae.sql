-- Add spouse fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS spouse_name text,
ADD COLUMN IF NOT EXISTS spouse_dob date;

-- Update dependents structure - change dependents_ages to dependents_data to store name and age
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dependents_data text; -- JSON string for dependents with name and age