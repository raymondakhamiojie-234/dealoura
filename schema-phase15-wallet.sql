-- ==============================================================================
-- PHASE 15: INTERNAL USER WALLET, LEDGER & WITHDRAWAL ENGINE
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pgpzxbtevjgsiwrllgra/sql
-- ==============================================================================

-- 1. Create user_wallets table
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (available_balance >= 0),
    escrow_locked_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (escrow_locked_balance >= 0),
    total_withdrawn NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_withdrawn >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create wallet_transactions table (Immutable Ledger)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'escrow_lock', 'escrow_release', 'escrow_refund'
    amount NUMERIC(12, 2) NOT NULL,
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'cancelled'
    reference_id VARCHAR(100), -- transaction_id, withdrawal_id, or deposit reference
    payment_method VARCHAR(50), -- 'bank_wire', 'crypto_usdt', 'wallet_balance'
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    net_payout NUMERIC(12, 2) NOT NULL,
    method VARCHAR(50) NOT NULL, -- 'bank_wire', 'usdt_trc20', 'usdc_polygon'
    destination_details JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Automatically create wallet for existing users
INSERT INTO public.user_wallets (user_id, available_balance, escrow_locked_balance, total_withdrawn)
SELECT id, 0.00, 0.00, 0.00
FROM public.user_profiles
ON CONFLICT (user_id) DO NOTHING;

-- 5. Trigger to auto-create wallet when new user_profile is created
CREATE OR REPLACE FUNCTION public.handle_user_wallet_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_wallets (user_id, available_balance, escrow_locked_balance, total_withdrawn)
    VALUES (NEW.id, 0.00, 0.00, 0.00)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_profile_wallet_created ON public.user_profiles;
CREATE TRIGGER on_user_profile_wallet_created
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_user_wallet_creation();

-- 6. Atomic Function: Get or Create Wallet
CREATE OR REPLACE FUNCTION public.get_or_create_wallet(p_user_id UUID)
RETURNS public.user_wallets AS $$
DECLARE
    v_wallet public.user_wallets;
BEGIN
    SELECT * INTO v_wallet FROM public.user_wallets WHERE user_id = p_user_id;
    IF NOT FOUND THEN
        INSERT INTO public.user_wallets (user_id, available_balance, escrow_locked_balance, total_withdrawn)
        VALUES (p_user_id, 0.00, 0.00, 0.00)
        RETURNING * INTO v_wallet;
    END IF;
    RETURN v_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Atomic Function: Deposit funds into wallet
CREATE OR REPLACE FUNCTION public.wallet_deposit_funds(
    p_user_id UUID,
    p_amount NUMERIC,
    p_method TEXT,
    p_reference TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_wallet public.user_wallets;
    v_tx_id UUID;
BEGIN
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Deposit amount must be greater than zero');
    END IF;

    -- Ensure wallet exists
    PERFORM public.get_or_create_wallet(p_user_id);

    -- Credit available balance
    UPDATE public.user_wallets
    SET available_balance = available_balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_wallet;

    -- Record transaction
    INSERT INTO public.wallet_transactions (
        user_id, type, amount, fee, status, reference_id, payment_method, description
    ) VALUES (
        p_user_id, 'deposit', p_amount, 0.00, 'completed', p_reference, p_method, 
        COALESCE(p_notes, 'Wallet balance deposit via ' || p_method)
    ) RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
        'success', true, 
        'available_balance', v_wallet.available_balance,
        'transaction_id', v_tx_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Atomic Function: Pay Escrow from Wallet Balance
CREATE OR REPLACE FUNCTION public.wallet_pay_escrow(
    p_buyer_id UUID,
    p_transaction_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_tx RECORD;
    v_wallet public.user_wallets;
    v_total_needed NUMERIC;
BEGIN
    -- Fetch transaction
    SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
    END IF;

    IF v_tx.buyer_id != p_buyer_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized buyer');
    END IF;

    IF v_tx.status != 'pending_payment' AND v_tx.status != 'payment_verifying' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transaction is not awaiting payment');
    END IF;

    v_total_needed := v_tx.agreed_price + COALESCE(v_tx.escrow_fee, ROUND(v_tx.agreed_price * 0.05, 2));

    -- Lock and check wallet balance
    SELECT * INTO v_wallet 
    FROM public.user_wallets 
    WHERE user_id = p_buyer_id 
    FOR UPDATE;

    IF NOT FOUND OR v_wallet.available_balance < v_total_needed THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Insufficient balance. You need $' || v_total_needed || ' but have $' || COALESCE(v_wallet.available_balance, 0)
        );
    END IF;

    -- Deduct from available, add to escrow_locked_balance
    UPDATE public.user_wallets
    SET available_balance = available_balance - v_total_needed,
        escrow_locked_balance = escrow_locked_balance + v_total_needed,
        updated_at = NOW()
    WHERE user_id = p_buyer_id;

    -- Record in wallet transactions
    INSERT INTO public.wallet_transactions (
        user_id, type, amount, fee, status, reference_id, payment_method, description
    ) VALUES (
        p_buyer_id, 'escrow_lock', v_total_needed, COALESCE(v_tx.escrow_fee, 0), 'completed', 
        p_transaction_id::text, 'wallet_balance', 
        'Locked in Dealoura Escrow Vault for Order #' || SUBSTRING(p_transaction_id::text, 1, 8)
    );

    -- Advance transaction status to payment_confirmed
    UPDATE public.transactions
    SET status = 'payment_confirmed',
        payment_proof_data = jsonb_build_object(
            'payerName', 'Wallet Balance Direct',
            'payerBank', 'Dealoura Internal Wallet',
            'referenceCode', 'WLT-' || SUBSTRING(p_transaction_id::text, 1, 8),
            'amountPaid', v_total_needed,
            'submittedAt', NOW()::text,
            'paymentType', 'wallet_balance'
        )::text,
        updated_at = NOW()
    WHERE id = p_transaction_id;

    -- Insert into payments table
    INSERT INTO public.payments (
        transaction_id, user_id, provider, amount, status
    ) VALUES (
        p_transaction_id, p_buyer_id, 'wallet_balance', v_total_needed, 'succeeded'
    );

    RETURN jsonb_build_object('success', true, 'total_paid', v_total_needed);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Atomic Function: Release Escrow Earnings to Seller Wallet
CREATE OR REPLACE FUNCTION public.wallet_release_escrow(
    p_transaction_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_tx RECORD;
    v_payout_amount NUMERIC;
    v_total_escrowed NUMERIC;
BEGIN
    SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
    END IF;

    v_payout_amount := v_tx.agreed_price - COALESCE(v_tx.escrow_fee, ROUND(v_tx.agreed_price * 0.05, 2));
    v_total_escrowed := v_tx.agreed_price + COALESCE(v_tx.escrow_fee, ROUND(v_tx.agreed_price * 0.05, 2));

    -- 1. Ensure seller wallet exists & credit available balance
    PERFORM public.get_or_create_wallet(v_tx.seller_id);
    UPDATE public.user_wallets
    SET available_balance = available_balance + v_payout_amount,
        updated_at = NOW()
    WHERE user_id = v_tx.seller_id;

    -- 2. Unlock buyer's locked escrow balance
    UPDATE public.user_wallets
    SET escrow_locked_balance = GREATEST(0, escrow_locked_balance - v_total_escrowed),
        updated_at = NOW()
    WHERE user_id = v_tx.buyer_id;

    -- 3. Record ledger entry for seller
    INSERT INTO public.wallet_transactions (
        user_id, type, amount, fee, status, reference_id, payment_method, description
    ) VALUES (
        v_tx.seller_id, 'escrow_release', v_payout_amount, COALESCE(v_tx.escrow_fee, 0), 'completed',
        p_transaction_id::text, 'internal_balance',
        'Escrow Payout for completed Order #' || SUBSTRING(p_transaction_id::text, 1, 8)
    );

    RETURN jsonb_build_object('success', true, 'seller_payout', v_payout_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Atomic Function: Request Withdrawal
CREATE OR REPLACE FUNCTION public.wallet_request_withdrawal(
    p_user_id UUID,
    p_amount NUMERIC,
    p_method TEXT,
    p_destination JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_wallet public.user_wallets;
    v_withdrawal_id UUID;
    v_fee NUMERIC := 0.00;
    v_net NUMERIC;
BEGIN
    IF p_amount < 20.00 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Minimum withdrawal amount is $20.00 USD');
    END IF;

    -- Small flat processing fee for wire or gas
    IF p_method = 'bank_wire' THEN
        v_fee := 15.00;
    ELSIF p_method = 'usdt_trc20' THEN
        v_fee := 2.00;
    ELSIF p_method = 'usdc_polygon' THEN
        v_fee := 1.00;
    END IF;

    IF p_amount <= v_fee THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal amount must cover the processing fee of $' || v_fee);
    END IF;

    v_net := p_amount - v_fee;

    -- Check and deduct from available balance
    SELECT * INTO v_wallet FROM public.user_wallets WHERE user_id = p_user_id FOR UPDATE;
    IF NOT FOUND OR v_wallet.available_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient available balance');
    END IF;

    UPDATE public.user_wallets
    SET available_balance = available_balance - p_amount,
        total_withdrawn = total_withdrawn + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Create withdrawal request
    INSERT INTO public.withdrawals (
        user_id, amount, fee, net_payout, method, destination_details, status
    ) VALUES (
        p_user_id, p_amount, v_fee, v_net, p_method, p_destination, 'pending'
    ) RETURNING id INTO v_withdrawal_id;

    -- Record transaction ledger
    INSERT INTO public.wallet_transactions (
        user_id, type, amount, fee, status, reference_id, payment_method, description
    ) VALUES (
        p_user_id, 'withdrawal', p_amount, v_fee, 'pending', v_withdrawal_id::text, p_method,
        'Withdrawal request via ' || p_method || ' to ' || COALESCE(p_destination->>'accountName', p_destination->>'walletAddress', 'Account')
    );

    RETURN jsonb_build_object('success', true, 'withdrawal_id', v_withdrawal_id, 'net_payout', v_net);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Security RLS Policies
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Wallets: Users can read their own wallet
DROP POLICY IF EXISTS "Users can view own wallet" ON public.user_wallets;
CREATE POLICY "Users can view own wallet"
ON public.user_wallets FOR SELECT
USING (auth.uid() = user_id);

-- Transactions: Users can view their own wallet transactions
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own wallet transactions"
ON public.wallet_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Withdrawals: Users can view their own withdrawals
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals"
ON public.withdrawals FOR SELECT
USING (auth.uid() = user_id);

-- Allow buyers/sellers to insert own withdrawals
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can insert own withdrawals"
ON public.withdrawals FOR INSERT
WITH CHECK (auth.uid() = user_id);
