-- Fix RLS Policies for Transactions

-- 1. Allow buyers to insert transactions (when they proceed to payment)
CREATE POLICY "Buyers can create transactions" 
ON transactions FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

-- 2. Allow buyers and sellers to update transactions (when changing state)
CREATE POLICY "Involved parties can update transactions" 
ON transactions FOR UPDATE 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 3. Allow system to insert into payments (simulated mock payments)
CREATE POLICY "Users can insert own payments" 
ON payments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Allow system to insert timeline events
CREATE POLICY "System can log timeline events"
ON transaction_timeline FOR INSERT
WITH CHECK (true); -- Trigger executes with SECURITY DEFINER, but just in case
