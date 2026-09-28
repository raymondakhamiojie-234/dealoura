-- PHASE 2: DATABASE SCHEMA UPDATE

-- 1. ENUMS
CREATE TYPE verification_status AS ENUM ('pending', 'submitted', 'under_review', 'verified', 'rejected');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'expired');

-- 2. TABLES

-- Verifications (Seller/Asset Verification)
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE, -- Optional: if verifying a specific asset instead of the user
    status verification_status DEFAULT 'pending',
    evidence_url TEXT, -- URL to private storage bucket file
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messaging
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, seller_id, listing_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status offer_status DEFAULT 'pending',
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reviewer_id, listing_id) -- Prevent multiple reviews for same transaction
);

-- 3. TRIGGERS
CREATE TRIGGER update_verifications_modtime
    BEFORE UPDATE ON verifications
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_conversations_modtime
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_offers_modtime
    BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Verifications: Users can see their own. Admins can see all (handled via app logic/service role for now).
CREATE POLICY "Users view own verifications" ON verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own verifications" ON verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own verifications" ON verifications FOR UPDATE USING (auth.uid() = user_id);

-- Conversations: Only participants can view
CREATE POLICY "Participants can view conversations" ON conversations 
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can start conversations" ON conversations 
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Messages: Only participants can view/insert
CREATE POLICY "Participants can view messages" ON messages 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid()))
  );
CREATE POLICY "Participants can send messages" ON messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Offers: Buyers and Sellers can view
CREATE POLICY "Involved parties can view offers" ON offers 
  FOR SELECT USING (
    auth.uid() = buyer_id OR 
    EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_id AND l.seller_id = auth.uid())
  );
CREATE POLICY "Buyers can make offers" ON offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Involved parties can update offers" ON offers 
  FOR UPDATE USING (
    auth.uid() = buyer_id OR 
    EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_id AND l.seller_id = auth.uid())
  );

-- Reviews: Anyone can read, only involved users can insert
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can write reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
