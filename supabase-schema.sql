-- ============================================
-- Block Testing Recorder — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Block models lookup table
CREATE TABLE block_models (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default block models
INSERT INTO block_models (name) VALUES
  ('GIT-1.5'), ('HCL-T160'), ('GRF-2'), ('HCL-2008 V2 BAYER'),
  ('GIT-2'), ('CSS-2'), ('GIL-2'), ('GIC216 G'),
  ('HCL-2210D'), ('HCL-2214D'), ('HCL-2216D'), ('HCL-2218A'),
  ('GIT-2.5'), ('MP-1'), ('HCL-2510');

-- Customers lookup table
CREATE TABLE customers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default customers
INSERT INTO customers (name) VALUES
  ('ABC Industries'), ('XYZ Corp'), ('Global Manufacturing'),
  ('Tech Solutions'), ('Industrial Works');

-- Main entries table — every block test or repair record
CREATE TABLE entries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('NEW', 'REPAIR')),
  block_model TEXT NOT NULL,
  block_number TEXT,          -- 6-digit for NEW entries
  job_number TEXT,            -- for REPAIR entries
  customer TEXT,              -- for REPAIR entries
  result TEXT NOT NULL CHECK (result IN ('OK', 'IMP', 'Sleeve')),
  stage TEXT CHECK (stage IN ('Rough', 'Final') OR stage IS NULL),
  employee_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by block model (history view)
CREATE INDEX idx_entries_block_model ON entries (block_model);

-- Index for fast lookups by date
CREATE INDEX idx_entries_created_at ON entries (created_at DESC);

-- ============================================
-- Row Level Security (RLS)
-- For now: allow all operations for anon key
-- (all employees share the same app password)
-- ============================================
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow read/write for anon role (public access via app password)
CREATE POLICY "Allow all on entries" ON entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on block_models" ON block_models FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
