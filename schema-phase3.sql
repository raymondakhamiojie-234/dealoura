-- PHASE 3: DATABASE SCHEMA UPDATE

-- 1. ENUMS
CREATE TYPE transaction_status AS ENUM (
  'pending_payment',
  'payment_confirmed',
  'transfer_started',
  'buyer_reviewing',
  'completed',
  'cancelled',
  'disputed'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'succeeded',
  'failed',
  'cancelled',
  'refunded'
);

-- 2. TABLES

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES user_profiles(id) ON DELETE RESTRICT NOT NULL,
    seller_id UUID REFERENCES user_profiles(id) ON DELETE RESTRICT NOT NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE RESTRICT NOT NULL,
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL, -- Null if bought at full price without an offer
    agreed_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    platform_fee DECIMAL(10, 2) DEFAULT 0,
    status transaction_status DEFAULT 'pending_payment',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE RESTRICT NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE RESTRICT NOT NULL, -- The user making the payment
    provider VARCHAR(50) NOT NULL, -- e.g., 'stripe', 'paypal', 'mock'
    provider_transaction_id VARCHAR(255), -- ID from the external provider
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction Timeline (Audit log specifically for the transaction flow)
CREATE TABLE transaction_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
    status transaction_status NOT NULL,
    description TEXT,
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- Who triggered the change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TRIGGERS
CREATE TRIGGER update_transactions_modtime
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_modtime
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Automatically log timeline events when transaction status changes
CREATE OR REPLACE FUNCTION log_transaction_timeline()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO transaction_timeline (transaction_id, status, description, created_by)
    VALUES (NEW.id, NEW.status, 'Status changed to ' || NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER transaction_status_change_logger
  AFTER INSERT OR UPDATE OF status ON transactions
  FOR EACH ROW EXECUTE PROCEDURE log_transaction_timeline();


-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_timeline ENABLE ROW LEVEL SECURITY;

-- Transactions: Only involved buyer and seller can view. Only system/admins can modify (we'll use server actions).
CREATE POLICY "Involved parties can view transactions" ON transactions 
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Payments: Buyer can view their payments.
CREATE POLICY "Users can view own payments" ON payments 
  FOR SELECT USING (auth.uid() = user_id);

-- Timeline: Involved parties can view
CREATE POLICY "Involved parties can view timeline" ON transaction_timeline 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid()))
  );
