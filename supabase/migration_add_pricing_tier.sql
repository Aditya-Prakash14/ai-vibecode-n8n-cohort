-- Migration: Add pricing_tier column to cohort_registrations table
-- Run this if you already have an existing cohort_registrations table

-- Add the pricing_tier column
ALTER TABLE cohort_registrations 
ADD COLUMN IF NOT EXISTS pricing_tier TEXT CHECK (pricing_tier IN ('basic', 'premium', 'plus'));

-- Update existing records to have 'plus' tier (since old registrations were for 1499)
UPDATE cohort_registrations 
SET pricing_tier = 'plus' 
WHERE pricing_tier IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE cohort_registrations 
ALTER COLUMN pricing_tier SET NOT NULL;

-- Remove the default value from amount column (since it varies by tier now)
ALTER TABLE cohort_registrations 
ALTER COLUMN amount DROP DEFAULT;

-- Add comment to the column
COMMENT ON COLUMN cohort_registrations.pricing_tier IS 'Pricing tier selected by user: basic (799), premium (1199), or plus (1499)';
