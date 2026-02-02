-- Supabase Schema for Vinarija Fakturisanje
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Klijenti (Clients)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  pib TEXT NOT NULL,
  mb TEXT NOT NULL,
  address TEXT,
  city TEXT,
  delivery_location TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Proizvodi (Products/Wines)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  unit TEXT DEFAULT '0.75',
  default_price DECIMAL(10,2),
  vat_rate INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fakture (Invoices)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number INTEGER NOT NULL,
  invoice_year INTEGER NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
  issue_date DATE NOT NULL,
  issue_place TEXT DEFAULT 'Malo Srediste',
  traffic_date DATE,
  traffic_place TEXT,
  due_date DATE,
  payment_method TEXT DEFAULT 'virmanom',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(invoice_number, invoice_year)
);

-- Stavke fakture (Invoice Items)
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  vat_rate INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Podešavanja firme (Company Settings)
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  address TEXT,
  pib TEXT NOT NULL,
  mb TEXT NOT NULL,
  bank_account TEXT,
  bank_name TEXT,
  activity_code TEXT,
  phone TEXT,
  email TEXT
);

-- Indexes for better performance
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_pib ON clients(pib);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_number_year ON invoices(invoice_number, invoice_year);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Row Level Security (RLS) Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write all data
-- (In a multi-tenant app, you'd filter by created_by or organization_id)

CREATE POLICY "Allow authenticated read clients" ON clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert clients" ON clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update clients" ON clients
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete clients" ON clients
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read products" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert products" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update products" ON products
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete products" ON products
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read invoices" ON invoices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert invoices" ON invoices
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update invoices" ON invoices
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete invoices" ON invoices
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read invoice_items" ON invoice_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert invoice_items" ON invoice_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update invoice_items" ON invoice_items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete invoice_items" ON invoice_items
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read company_settings" ON company_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert company_settings" ON company_settings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update company_settings" ON company_settings
  FOR UPDATE TO authenticated USING (true);

-- Function to get next invoice number for a year
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_year INTEGER)
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(invoice_number), 0) + 1
  INTO next_num
  FROM invoices
  WHERE invoice_year = p_year;

  RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- Insert default company settings (update with your actual data)
INSERT INTO company_settings (
  owner_name,
  company_name,
  address,
  pib,
  mb,
  bank_account,
  bank_name,
  activity_code,
  phone,
  email
) VALUES (
  'Marija Deđanski PR',
  'Proizvodnja vina Vinarija Kula Vetrova',
  'Balojska bb, Malo Srediste 26334',
  '110699470',
  '64958356',
  '325-9500500382945-35',
  'OTP banka',
  '1102',
  '065/ 814 78 00',
  NULL
);

-- Insert some sample products
INSERT INTO products (name, unit, default_price, vat_rate) VALUES
  ('Kosava crveno vino', '0.75', 999.00, 20),
  ('Kosava belo vino', '0.75', 999.00, 20),
  ('Roze vino', '0.75', 899.00, 20),
  ('Vino 1L', '1', 400.00, 20);
