
-- Add payment_status column to donations to track pending vs paid
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';

-- Update existing donations to 'paid' since they were already counted
UPDATE public.donations SET payment_status = 'paid' WHERE payment_status = 'pending';
