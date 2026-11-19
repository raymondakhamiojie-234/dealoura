-- ====================================================================
-- DEALOURA: COMPLETE PERMISSIONS & VISIBILITY UNLOCK (IDEMPOTENT)
-- ====================================================================

-- 1. Helper function: checks if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. LISTINGS: Public can view all published accounts (approved, pending, sold)
-- Only 'draft' listings are hidden from public.
DROP POLICY IF EXISTS "Approved listings viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Public listings viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;

CREATE POLICY "Public listings viewable by everyone"
ON listings FOR SELECT
USING (status != 'draft' OR auth.uid() = seller_id OR public.is_admin());

CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
USING (public.is_admin() OR auth.uid() = seller_id);

-- 3. TRANSACTIONS: Allow admins + buyer + seller full visibility
DROP POLICY IF EXISTS "Involved parties can view transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON transactions;

CREATE POLICY "Involved parties and admins can view transactions"
ON transactions FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.is_admin());

CREATE POLICY "Involved parties and admins can update transactions"
ON transactions FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.is_admin());

-- 4. VERIFICATIONS: Allow admins + owner full visibility
DROP POLICY IF EXISTS "Users view own verifications" ON verifications;
DROP POLICY IF EXISTS "Admins can view all verifications" ON verifications;
DROP POLICY IF EXISTS "Admins can update all verifications" ON verifications;

CREATE POLICY "Users and admins can view verifications"
ON verifications FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users and admins can update verifications"
ON verifications FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin());

-- 5. DISPUTES: Allow admins + involved parties full visibility
DROP POLICY IF EXISTS "Involved parties view disputes" ON disputes;
DROP POLICY IF EXISTS "Admins can view all disputes" ON disputes;
DROP POLICY IF EXISTS "Admins can update all disputes" ON disputes;

CREATE POLICY "Involved parties and admins can view disputes"
ON disputes FOR SELECT
USING (
  public.is_admin() OR 
  EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  )
);

CREATE POLICY "Admins can update all disputes"
ON disputes FOR UPDATE
USING (public.is_admin());

-- 6. INSTANTLY CONVERT ANY PENDING LISTINGS TO APPROVED
UPDATE listings SET status = 'approved' WHERE status = 'pending';
