-- ====================================================================
-- DEALOURA: GRANT ADMINISTRATORS FULL ACCESS TO MODERATE ALL TABLES
-- ====================================================================

-- 1. Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. LISTINGS: Allow admins to view and update ANY listing
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
USING (public.is_admin());

-- 3. TRANSACTIONS: Allow admins to view and manage all transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions"
ON transactions FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all transactions" ON transactions;
CREATE POLICY "Admins can update all transactions"
ON transactions FOR UPDATE
USING (public.is_admin());

-- 4. VERIFICATIONS: Allow admins to view and manage all KYC verifications
DROP POLICY IF EXISTS "Admins can view all verifications" ON verifications;
CREATE POLICY "Admins can view all verifications"
ON verifications FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all verifications" ON verifications;
CREATE POLICY "Admins can update all verifications"
ON verifications FOR UPDATE
USING (public.is_admin());

-- 5. DISPUTES: Allow admins to view and manage all dispute tickets
DROP POLICY IF EXISTS "Admins can view all disputes" ON disputes;
CREATE POLICY "Admins can view all disputes"
ON disputes FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all disputes" ON disputes;
CREATE POLICY "Admins can update all disputes"
ON disputes FOR UPDATE
USING (public.is_admin());

-- 6. TIMELINE: Allow admins to view transaction timeline events
DROP POLICY IF EXISTS "Admins can view all timeline events" ON transaction_timeline;
CREATE POLICY "Admins can view all timeline events"
ON transaction_timeline FOR SELECT
USING (public.is_admin());

-- 7. APPROVE ANY CURRENT PENDING LISTINGS (Makes the uploaded account visible right away)
UPDATE listings SET status = 'approved' WHERE status = 'pending';
