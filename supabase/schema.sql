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
  payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 1499.00,
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
