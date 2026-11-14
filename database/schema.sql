-- PayTrack Database Schema
-- Production-ready PostgreSQL schema for contractor payment tracking system
-- Version: 1.0.0
-- Author: PayTrack Engineering Team

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('CONTRACTOR', 'WORKER', 'ADMIN');
CREATE TYPE payment_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MODIFIED', 'COMPLETED');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE payment_category AS ENUM ('ADVANCE', 'SALARY', 'EXPENSE', 'ADJUSTMENT');
CREATE TYPE payment_mode AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE');
CREATE TYPE ledger_entry_type AS ENUM (
  'SALARY_EARNED',
  'SALARY_PAID',
  'ADVANCE_GIVEN',
  'EXPENSE_REIMBURSED',
  'ADJUSTMENT_CREDIT',
  'ADJUSTMENT_DEBIT'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (both contractors and workers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Indexes
  CONSTRAINT phone_number_format CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$')
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);

-- Contractor profiles
CREATE TABLE contractor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  gstin VARCHAR(15),
  pan VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT gstin_format CHECK (gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  CONSTRAINT pan_format CHECK (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$')
);

CREATE INDEX idx_contractor_user ON contractor_profiles(user_id);

-- Worker profiles
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  date_of_birth DATE,
  aadhar_number VARCHAR(12),
  pan VARCHAR(10),
  bank_account_number VARCHAR(20),
  bank_ifsc VARCHAR(11),
  bank_name VARCHAR(255),
  upi_id VARCHAR(255),
  preferred_payment_mode payment_mode DEFAULT 'UPI',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT aadhar_format CHECK (aadhar_number ~ '^[0-9]{12}$'),
  CONSTRAINT pan_format CHECK (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  CONSTRAINT ifsc_format CHECK (bank_ifsc ~ '^[A-Z]{4}0[A-Z0-9]{6}$')
);

CREATE INDEX idx_worker_user ON worker_profiles(user_id);
CREATE INDEX idx_worker_contractor ON worker_profiles(contractor_id);

-- Salary profiles (monthly salary configuration for workers)
CREATE TABLE salary_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  monthly_salary DECIMAL(10, 2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT monthly_salary_positive CHECK (monthly_salary > 0),
  CONSTRAINT effective_dates_valid CHECK (effective_to IS NULL OR effective_to > effective_from)
);

CREATE INDEX idx_salary_worker ON salary_profiles(worker_id);
CREATE INDEX idx_salary_active ON salary_profiles(is_active) WHERE is_active = true;

-- Projects/Customers
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT project_dates_valid CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_projects_contractor ON projects(contractor_id);
CREATE INDEX idx_projects_active ON projects(is_active) WHERE is_active = true;

-- Worker-Project assignments
CREATE TABLE worker_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT unique_active_assignment UNIQUE (worker_id, project_id, is_active)
);

CREATE INDEX idx_assignments_worker ON worker_assignments(worker_id);
CREATE INDEX idx_assignments_project ON worker_assignments(project_id);

-- ============================================================================
-- PAYMENT WORKFLOW TABLES
-- ============================================================================

-- Payment requests (initiated by workers)
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  amount DECIMAL(10, 2) NOT NULL,
  category payment_category NOT NULL,
  payment_mode payment_mode NOT NULL,
  purpose VARCHAR(255),
  notes TEXT,
  
  status payment_request_status DEFAULT 'PENDING',
  
  -- Modified fields (if contractor changes amount/category)
  modified_amount DECIMAL(10, 2),
  modified_category payment_category,
  modification_reason TEXT,
  
  -- Approval/rejection
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT amount_positive CHECK (amount > 0),
  CONSTRAINT modified_amount_positive CHECK (modified_amount IS NULL OR modified_amount > 0)
);

CREATE INDEX idx_payment_requests_worker ON payment_requests(worker_id);
CREATE INDEX idx_payment_requests_contractor ON payment_requests(contractor_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_created ON payment_requests(created_at DESC);

-- Transactions (created when payment request is approved)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_request_id UUID UNIQUE NOT NULL REFERENCES payment_requests(id) ON DELETE RESTRICT,
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  amount DECIMAL(10, 2) NOT NULL,
  category payment_category NOT NULL,
  payment_mode payment_mode NOT NULL,
  
  status transaction_status DEFAULT 'PENDING',
  
  -- Payment details
  upi_transaction_id VARCHAR(255),
  bank_reference_number VARCHAR(255),
  payment_proof_url TEXT,
  
  -- Cash payment confirmation
  cash_confirmed_at TIMESTAMPTZ,
  cash_confirmed_by UUID REFERENCES users(id),
  
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_transactions_worker ON transactions(worker_id);
CREATE INDEX idx_transactions_contractor ON transactions(contractor_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_payment_mode ON transactions(payment_mode);

-- ============================================================================
-- LEDGER SYSTEM (IMMUTABLE)
-- ============================================================================

-- Ledger entries (IMMUTABLE - no updates or deletes allowed)
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE RESTRICT,
  contractor_id UUID NOT NULL REFERENCES contractor_profiles(id) ON DELETE RESTRICT,
  transaction_id UUID REFERENCES transactions(id) ON DELETE RESTRICT,
  
  entry_type ledger_entry_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  
  -- Metadata
  description TEXT,
  reference_month DATE, -- For salary accrual tracking
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_ledger_worker ON ledger_entries(worker_id);
CREATE INDEX idx_ledger_contractor ON ledger_entries(contractor_id);
CREATE INDEX idx_ledger_type ON ledger_entries(entry_type);
CREATE INDEX idx_ledger_created ON ledger_entries(created_at DESC);
CREATE INDEX idx_ledger_reference_month ON ledger_entries(reference_month);

-- Prevent updates and deletes on ledger_entries
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Ledger entries are immutable. Use adjustment entries for corrections.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_ledger_update
  BEFORE UPDATE ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TRIGGER prevent_ledger_delete
  BEFORE DELETE ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

-- ============================================================================
-- AUDIT & NOTIFICATIONS
-- ============================================================================

-- Audit log (track all important actions)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Worker balance view
CREATE VIEW worker_balances AS
SELECT 
  w.id AS worker_id,
  w.full_name,
  w.contractor_id,
  COALESCE(SUM(CASE WHEN l.entry_type = 'SALARY_EARNED' THEN l.amount ELSE 0 END), 0) AS salary_earned,
  COALESCE(SUM(CASE WHEN l.entry_type = 'SALARY_PAID' THEN l.amount ELSE 0 END), 0) AS salary_paid,
  COALESCE(SUM(CASE WHEN l.entry_type = 'ADVANCE_GIVEN' THEN l.amount ELSE 0 END), 0) AS advances_given,
  COALESCE(SUM(CASE WHEN l.entry_type = 'EXPENSE_REIMBURSED' THEN l.amount ELSE 0 END), 0) AS expenses_reimbursed,
  COALESCE(SUM(CASE WHEN l.entry_type = 'ADJUSTMENT_CREDIT' THEN l.amount ELSE 0 END), 0) AS adjustment_credits,
  COALESCE(SUM(CASE WHEN l.entry_type = 'ADJUSTMENT_DEBIT' THEN l.amount ELSE 0 END), 0) AS adjustment_debits,
  COALESCE(SUM(CASE WHEN l.entry_type = 'SALARY_EARNED' THEN l.amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN l.entry_type = 'SALARY_PAID' THEN l.amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN l.entry_type = 'ADVANCE_GIVEN' THEN l.amount ELSE 0 END), 0) +
  COALESCE(SUM(CASE WHEN l.entry_type = 'ADJUSTMENT_CREDIT' THEN l.amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN l.entry_type = 'ADJUSTMENT_DEBIT' THEN l.amount ELSE 0 END), 0) AS outstanding_balance
FROM worker_profiles w
LEFT JOIN ledger_entries l ON w.id = l.worker_id
GROUP BY w.id, w.full_name, w.contractor_id;

-- Contractor monthly summary view
CREATE VIEW contractor_monthly_summary AS
SELECT 
  c.id AS contractor_id,
  DATE_TRUNC('month', t.created_at) AS month,
  COUNT(DISTINCT t.id) AS total_transactions,
  COUNT(DISTINCT t.worker_id) AS unique_workers,
  SUM(t.amount) AS total_amount,
  SUM(CASE WHEN t.category = 'SALARY' THEN t.amount ELSE 0 END) AS salary_paid,
  SUM(CASE WHEN t.category = 'ADVANCE' THEN t.amount ELSE 0 END) AS advances_given,
  SUM(CASE WHEN t.category = 'EXPENSE' THEN t.amount ELSE 0 END) AS expenses_paid,
  SUM(CASE WHEN t.payment_mode = 'CASH' THEN t.amount ELSE 0 END) AS cash_payments,
  SUM(CASE WHEN t.payment_mode = 'UPI' THEN t.amount ELSE 0 END) AS upi_payments,
  SUM(CASE WHEN t.payment_mode = 'BANK_TRANSFER' THEN t.amount ELSE 0 END) AS bank_payments
FROM contractor_profiles c
LEFT JOIN transactions t ON c.id = t.contractor_id
WHERE t.status = 'COMPLETED'
GROUP BY c.id, DATE_TRUNC('month', t.created_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate worker balance
CREATE OR REPLACE FUNCTION calculate_worker_balance(p_worker_id UUID)
RETURNS TABLE (
  salary_earned DECIMAL,
  salary_paid DECIMAL,
  advances_given DECIMAL,
  outstanding_balance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN entry_type = 'SALARY_EARNED' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN entry_type = 'SALARY_PAID' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN entry_type = 'ADVANCE_GIVEN' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN entry_type = 'SALARY_EARNED' THEN amount ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN entry_type = 'SALARY_PAID' THEN amount ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN entry_type = 'ADVANCE_GIVEN' THEN amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN entry_type = 'ADJUSTMENT_CREDIT' THEN amount ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN entry_type = 'ADJUSTMENT_DEBIT' THEN amount ELSE 0 END), 0)
  FROM ledger_entries
  WHERE worker_id = p_worker_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_profiles_updated_at BEFORE UPDATE ON contractor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_profiles_updated_at BEFORE UPDATE ON salary_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_requests_updated_at BEFORE UPDATE ON payment_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ledger_entries IS 'Immutable ledger entries. No updates or deletes allowed. Use adjustment entries for corrections.';
COMMENT ON TABLE transactions IS 'Payment transactions created when payment requests are approved.';
COMMENT ON TABLE payment_requests IS 'Payment requests initiated by workers and reviewed by contractors.';
COMMENT ON VIEW worker_balances IS 'Real-time worker balance calculation based on ledger entries.';
COMMENT ON FUNCTION calculate_worker_balance IS 'Calculate current balance for a specific worker.';
