-- Phase 5: Escrow Agent Workflow Update

-- Add new transaction statuses for the DealBaron-style Escrow Agent middle-man flow
ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'agent_verifying' AFTER 'transfer_started';
ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'buyer_7_day_evaluation' AFTER 'agent_verifying';
