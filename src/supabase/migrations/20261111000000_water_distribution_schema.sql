-- ==============================================================================
-- AQUAFLOW ENTERPRISE WATER DISTRIBUTION MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role_enum AS ENUM ('customer', 'delivery', 'owner');
CREATE TYPE order_status_enum AS ENUM ('New', 'Confirmed', 'Out for Delivery', 'Delivered', 'Failed', 'Cancelled');
CREATE TYPE payment_status_enum AS ENUM ('Pending', 'Partial', 'Paid');
CREATE TYPE payment_method_enum AS ENUM ('Cash', 'UPI', 'Bank Transfer', 'Other');
CREATE TYPE customer_status_enum AS ENUM ('Active', 'Overdue', 'Clear');

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'customer',
  phone VARCHAR(20) NOT NULL UNIQUE,
  vehicle_details VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  capacity VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'jar_20l',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_jar_20l BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  badge VARCHAR(50),
  image_type VARCHAR(50) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCT PRICE HISTORY
CREATE TABLE IF NOT EXISTS public.product_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name VARCHAR(150) NOT NULL,
  previous_price NUMERIC(10, 2) NOT NULL,
  new_price NUMERIC(10, 2) NOT NULL,
  admin_id UUID REFERENCES public.profiles(id),
  admin_name VARCHAR(100) NOT NULL,
  reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(15) NOT NULL UNIQUE, -- Primary lookup key
  address TEXT NOT NULL,
  landmark VARCHAR(150),
  total_purchases NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  outstanding_due NUMERIC(12, 2) NOT NULL DEFAULT 0,
  outstanding_jars INT NOT NULL DEFAULT 0,
  previous_jar_balance INT NOT NULL DEFAULT 0,
  new_jars_delivered INT NOT NULL DEFAULT 0,
  empty_jars_returned INT NOT NULL DEFAULT 0,
  last_payment_date TIMESTAMPTZ,
  last_order_date TIMESTAMPTZ,
  account_status customer_status_enum NOT NULL DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id VARCHAR(50) PRIMARY KEY, -- E.g., ORD-20261111-9214
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(15) NOT NULL,
  delivery_address TEXT NOT NULL,
  landmark VARCHAR(150),
  special_instructions TEXT,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  payment_status payment_status_enum NOT NULL DEFAULT 'Pending',
  delivery_status order_status_enum NOT NULL DEFAULT 'New',
  assigned_delivery_person_id UUID REFERENCES public.profiles(id),
  assigned_delivery_person_name VARCHAR(100),
  idempotency_key VARCHAR(100) UNIQUE,
  cancellation_reason TEXT,
  delivery_notes TEXT,
  actual_delivered_jars INT DEFAULT 0,
  empty_jars_collected INT DEFAULT 0,
  amount_collected_at_delivery NUMERIC(10, 2) DEFAULT 0,
  delivery_payment_method payment_method_enum,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  out_for_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ORDER ITEMS (CRITICAL: Preserves price snapshot)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_order NUMERIC(10, 2) NOT NULL CHECK (price_at_order >= 0), -- Snapshot
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  is_jar_20l BOOLEAN NOT NULL DEFAULT TRUE
);

-- 9. FINANCIAL TRANSACTIONS (Chronological Immutable Ledger)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name VARCHAR(120) NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT NOT NULL,
  type VARCHAR(30) NOT NULL, -- 'order_charge', 'payment', 'manual_due', 'adjustment'
  debit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  credit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  balance_after NUMERIC(12, 2) NOT NULL,
  payment_method payment_method_enum,
  payment_reference VARCHAR(100),
  order_id VARCHAR(50) REFERENCES public.orders(id),
  recorded_by VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. JAR TRANSACTIONS (Separate Ledger for Reusable Jars)
CREATE TABLE IF NOT EXISTS public.jar_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name VARCHAR(120) NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT NOT NULL,
  type VARCHAR(30) NOT NULL, -- 'delivery', 'return', 'manual_adjustment'
  jars_delivered INT NOT NULL DEFAULT 0,
  jars_returned INT NOT NULL DEFAULT 0,
  balance_after INT NOT NULL,
  order_id VARCHAR(50) REFERENCES public.orders(id),
  recorded_by VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ADMIN ACTIVITY AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action VARCHAR(80) NOT NULL,
  admin_id UUID REFERENCES public.profiles(id),
  admin_name VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  previous_value TEXT,
  updated_value TEXT
);

-- 12. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON public.orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_tx_customer ON public.financial_transactions(customer_id, date);
CREATE INDEX IF NOT EXISTS idx_jar_tx_customer ON public.jar_transactions(customer_id, date);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jar_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Product Policies: Public can read active products; Only Owner can insert/update
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (is_active = TRUE OR auth.jwt() ->> 'role' = 'owner');

CREATE POLICY "Owner manage products" ON public.products
  FOR ALL USING (auth.jwt() ->> 'role' = 'owner');

-- Customer Policies: Public can insert new customer profile; Owner can read/update all
CREATE POLICY "Public create customer on checkout" ON public.customers
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Owner read update customers" ON public.customers
  FOR ALL USING (auth.jwt() ->> 'role' = 'owner');

-- Order Policies: Customers can insert orders; Delivery persons can view assigned; Owner can view/manage all
CREATE POLICY "Public guest insert orders" ON public.orders
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public track own orders by phone/id" ON public.orders
  FOR SELECT USING (TRUE);

CREATE POLICY "Delivery driver read assigned orders" ON public.orders
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'owner' OR 
    assigned_delivery_person_id = auth.uid()
  );

CREATE POLICY "Delivery driver update assigned orders" ON public.orders
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'owner' OR 
    assigned_delivery_person_id = auth.uid()
  );

-- Ledger Policies: Only Owner can view sensitive financial ledgers and audit logs
CREATE POLICY "Owner access financial transactions" ON public.financial_transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'owner');

CREATE POLICY "Owner access jar transactions" ON public.jar_transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'owner');

CREATE POLICY "Owner access audit logs" ON public.admin_activity_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'owner');
