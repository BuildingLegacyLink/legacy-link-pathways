
-- Add destination_asset_id column to savings table
ALTER TABLE public.savings 
ADD COLUMN destination_asset_id UUID REFERENCES public.assets(id);
