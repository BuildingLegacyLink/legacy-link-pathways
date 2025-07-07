-- Add additional profile fields to the existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS marital_status text,
ADD COLUMN IF NOT EXISTS dependents_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS dependents_ages text, -- JSON string for ages
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS citizenship_status text,
ADD COLUMN IF NOT EXISTS employment_status text,
ADD COLUMN IF NOT EXISTS occupation text;