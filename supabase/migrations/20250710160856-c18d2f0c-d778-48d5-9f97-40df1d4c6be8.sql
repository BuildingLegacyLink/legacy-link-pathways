-- Add withdrawal_account_id column to goals table
ALTER TABLE public.goals 
ADD COLUMN withdrawal_account_id uuid REFERENCES public.assets(id);

-- Add comment for clarity
COMMENT ON COLUMN public.goals.withdrawal_account_id IS 'Reference to the asset/account to withdraw from for this goal';