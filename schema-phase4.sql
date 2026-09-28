-- PHASE 4: DATABASE SCHEMA UPDATE

-- 1. ENUMS
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved_buyer', 'resolved_seller', 'closed');
CREATE TYPE notification_type AS ENUM ('message', 'offer', 'transaction', 'system');

-- 2. TABLES

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
    opened_by UUID REFERENCES user_profiles(id) ON DELETE RESTRICT NOT NULL,
    reason TEXT NOT NULL,
    evidence_url TEXT,
    status dispute_status DEFAULT 'open',
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT, -- Optional URL to redirect to when clicked
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TRIGGERS
CREATE TRIGGER update_disputes_modtime
    BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to automatically create a notification when a new offer is made
CREATE OR REPLACE FUNCTION notify_new_offer()
RETURNS trigger AS $$
BEGIN
  -- Notify the seller
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT 
    l.seller_id, 
    'offer', 
    'New Offer Received!', 
    'You received a new offer of $' || NEW.amount || ' for ' || l.title,
    '/dashboard/offers'
  FROM listings l WHERE l.id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_offer_created
  AFTER INSERT ON offers
  FOR EACH ROW EXECUTE PROCEDURE notify_new_offer();

-- Function to automatically create a notification when a message is sent
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger AS $$
DECLARE
  convo_record RECORD;
  receiver_uuid UUID;
BEGIN
  -- Get the conversation details
  SELECT * INTO convo_record FROM conversations WHERE id = NEW.conversation_id;
  
  -- Determine who is receiving the message
  IF NEW.sender_id = convo_record.buyer_id THEN
    receiver_uuid := convo_record.seller_id;
  ELSE
    receiver_uuid := convo_record.buyer_id;
  END IF;

  -- Insert notification
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (
    receiver_uuid, 
    'message', 
    'New Message', 
    'You received a new message.', 
    '/dashboard/messages/' || NEW.conversation_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE PROCEDURE notify_new_message();


-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Disputes: Involved transaction parties can view. Opener can insert.
CREATE POLICY "Involved parties view disputes" ON disputes 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid()))
  );
CREATE POLICY "Involved parties can open disputes" ON disputes 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid()))
  );

-- Notifications: Users only see and update their own.
CREATE POLICY "Users view own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications 
  FOR UPDATE USING (auth.uid() = user_id);
