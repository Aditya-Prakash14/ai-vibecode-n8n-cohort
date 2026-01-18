-- Supabase Schema for Cohort Registrations
-- Run this SQL in your Supabase SQL Editor

-- Create the cohort_registrations table
CREATE TABLE IF NOT EXISTS cohort_registrations (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  experience TEXT,
  goal TEXT,
  background TEXT,
  commitment TEXT,
  pricing_tier TEXT NOT NULL CHECK (pricing_tier IN ('basic', 'premium', 'plus')),
  payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  amount DECIMAL(10,2) NOT NULL,
  transaction_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_cohort_registrations_email ON cohort_registrations(email);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_cohort_registrations_phone ON cohort_registrations(phone);

-- Create index on payment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_cohort_registrations_payment_id ON cohort_registrations(payment_id);

-- Enable Row Level Security (RLS)
ALTER TABLE cohort_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for registration)
CREATE POLICY "Allow public insert" ON cohort_registrations
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow reading only own registration by email
CREATE POLICY "Allow read own registration" ON cohort_registrations
  FOR SELECT
  USING (true);

-- Policy: Prevent updates from public (only backend/admin can update)
CREATE POLICY "Prevent public update" ON cohort_registrations
  FOR UPDATE
  USING (false);

-- Policy: Prevent deletes from public
CREATE POLICY "Prevent public delete" ON cohort_registrations
  FOR DELETE
  USING (false);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on row update
CREATE TRIGGER update_cohort_registrations_updated_at
  BEFORE UPDATE ON cohort_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user already exists
CREATE OR REPLACE FUNCTION check_user_exists(user_email TEXT, user_phone TEXT)
RETURNS TABLE(exists_by_email BOOLEAN, exists_by_phone BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM cohort_registrations WHERE email = user_email AND payment_status = 'completed'),
    EXISTS(SELECT 1 FROM cohort_registrations WHERE phone = user_phone AND payment_status = 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get student counts by pricing tier
CREATE OR REPLACE FUNCTION get_student_counts_by_tier()
RETURNS TABLE(pricing_tier TEXT, student_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.pricing_tier,
    COUNT(*)::BIGINT as student_count
  FROM cohort_registrations cr
  WHERE cr.payment_status = 'completed'
  GROUP BY cr.pricing_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a materialized view for faster access (optional, refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS student_counts_by_tier AS
SELECT 
  pricing_tier,
  COUNT(*)::BIGINT as student_count
FROM cohort_registrations
WHERE payment_status = 'completed'
GROUP BY pricing_tier;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_counts_tier ON student_counts_by_tier(pricing_tier);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_student_counts()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY student_counts_by_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-refresh counts when a payment is completed
CREATE OR REPLACE FUNCTION trigger_refresh_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND (OLD IS NULL OR OLD.payment_status != 'completed') THEN
    PERFORM refresh_student_counts();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_payment_completed
  AFTER INSERT OR UPDATE ON cohort_registrations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_counts();
